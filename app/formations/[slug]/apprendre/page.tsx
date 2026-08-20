import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  getLearningCourseForUser,
  getPublicCourse
} from "@/app/formations/course-data";
import { ServerCoursePlayer } from "@/components/learning/server-course-player";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { enrollUserInCourse } from "@/lib/lms/enrollments";
import { LmsError } from "@/lib/lms/errors";
import { buildPageMetadata } from "@/lib/seo";

type LearnPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: LearnPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) {
    return {
      title: "Apprendre",
      robots: { index: false, follow: false }
    };
  }
  return {
    ...buildPageMetadata({
      title: `Apprendre — ${course.shortTitle}`,
      description: `Poursuivez la formation « ${course.title} » dans votre espace sécurisé.`,
      path: `/formations/${course.slug}/apprendre`
    }),
    robots: { index: false, follow: false }
  };
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params;
  const session = await auth();
  const callbackUrl = `/formations/${slug}/apprendre`;
  if (!session?.user?.id)
    redirect(`/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}`);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isActive: true, emailVerified: true }
  });
  if (!user?.isActive || !user.emailVerified)
    redirect(
      `/connexion?erreur=compte&callbackUrl=${encodeURIComponent(callbackUrl)}`
    );

  let publicCourse: Awaited<ReturnType<typeof getLearningCourseForUser>>;
  try {
    publicCourse = await getLearningCourseForUser(user.id, slug);
  } catch (error) {
    if (!(error instanceof LmsError) || error.code !== "course_not_found") {
      throw error;
    }
    const availableCourse = await getPublicCourse(slug);
    if (!availableCourse) notFound();
    if (availableCourse.offer !== "free") {
      redirect(`/formations/${slug}?acces=requis`);
    }
    await enrollUserInCourse(user.id, { courseId: availableCourse.id });
    publicCourse = await getLearningCourseForUser(user.id, slug);
  }

  const enrollment = await db.enrollment.findUniqueOrThrow({
    where: {
      userId_courseId: { userId: user.id, courseId: publicCourse.id }
    }
  });

  const [progress, certificate, attempts, courseResources] = await Promise.all([
    db.lessonProgress.findMany({
      where: { enrollmentId: enrollment.id },
      select: { lessonId: true, status: true, lastPosition: true }
    }),
    db.certificate.findUnique({
      where: { enrollmentId: enrollment.id },
      select: { token: true, revokedAt: true }
    }),
    db.quizAttempt.groupBy({
      by: ["quizId"],
      where: { enrollmentId: enrollment.id },
      _count: { _all: true }
    }),
    db.courseResource.findMany({
      where: { courseId: publicCourse.id, lessonId: null, archivedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        kind: true,
        fileName: true
      }
    })
  ]);
  const attemptCounts = new Map(
    attempts.map((attempt) => [attempt.quizId, attempt._count._all])
  );
  const modules = publicCourse.modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({
      ...lesson,
      quiz: lesson.quiz
        ? {
            ...lesson.quiz,
            attemptCount: attemptCounts.get(lesson.quiz.id) ?? 0
          }
        : null
    }))
  }));

  return (
    <section className="container py-10 md:py-14">
      <nav
        aria-label="Fil d’Ariane"
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/formations">Formations</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/formations/${publicCourse.slug}`}>
          {publicCourse.shortTitle}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">Apprendre</span>
      </nav>
      <div className="mb-8 mt-6 flex flex-col gap-3 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>
            {publicCourse.offer === "free"
              ? "Formation gratuite"
              : "Formation achetée"}
          </Badge>
          <p className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            {publicCourse.shortTitle}
          </p>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Votre progression est enregistrée dans votre compte et vous suit d’un
          appareil à l’autre.
        </p>
      </div>
      <ServerCoursePlayer
        course={publicCourse}
        modules={modules}
        initialProgress={progress}
        initialLastLessonId={enrollment.lastLessonId}
        certificateToken={
          certificate && !certificate.revokedAt ? certificate.token : null
        }
        courseResources={courseResources}
      />
    </section>
  );
}

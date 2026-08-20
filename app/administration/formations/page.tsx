import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { CourseForm } from "@/components/admin/course-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Formations — Administration",
  robots: { index: false, follow: false }
};

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    orderBy: [{ archivedAt: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { enrollments: true, modules: true } } }
  });
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Contenu</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold">
            Formations
          </h1>
        </div>
        <Button asChild variant="secondary">
          <Link href="#nouvelle">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nouvelle
          </Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      course.status === "published" ? "default" : "outline"
                    }
                  >
                    {course.status}
                  </Badge>
                  {course.isPurchasable ? (
                    <Badge variant="secondary">Achetable</Badge>
                  ) : null}
                </div>
                <h2 className="mt-3 font-heading text-xl font-semibold">
                  {course.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course._count.modules} module(s) ·{" "}
                  {course._count.enrollments} inscription(s)
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/administration/formations/${course.id}`}>
                  Modifier
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card id="nouvelle" className="mt-10 scroll-mt-28">
        <CardHeader>
          <CardTitle>Créer une formation</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </>
  );
}

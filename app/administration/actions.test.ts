import { randomBytes } from "node:crypto";

import { beforeAll, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";

const authState = vi.hoisted(() => ({ userId: "" }));

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: authState.userId, role: "admin", isActive: true }
  }))
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import {
  addResourceAction,
  archiveLessonAction,
  archiveModuleAction,
  archiveResourceAction,
  manualEnrollmentAction,
  revokeEnrollmentAction,
  saveLessonAction,
  updateUserAccessAction
} from "@/app/administration/actions";
import { db } from "@/lib/db";
import { getPublicCertificateByToken } from "@/lib/lms/certificates";

let adminId = "";

beforeAll(async () => {
  const admin = await db.user.create({
    data: {
      email: "admin-actions-ui@example.com",
      emailVerified: new Date(),
      role: "admin",
      isActive: true
    }
  });
  adminId = admin.id;
  authState.userId = admin.id;
});

async function createCourse(slug: string, status = "draft") {
  return db.course.create({
    data: {
      slug,
      title: `Formation ${slug}`,
      shortTitle: slug,
      description: "Description de test suffisamment claire.",
      theme: "internet",
      level: "beginner",
      offer: "free",
      priceCents: 0,
      durationMinutes: 30,
      durationLabel: "30 min",
      format: "self-paced",
      audience: "Équipe de test",
      outcomes: ["Résultat"],
      prerequisites: [],
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });
}

async function createCourseContent({
  courseId,
  prefix,
  moduleRequired = true,
  lessonRequired = true
}: {
  courseId: string;
  prefix: string;
  moduleRequired?: boolean;
  lessonRequired?: boolean;
}) {
  const courseModule = await db.courseModule.create({
    data: {
      courseId,
      title: `Module ${prefix}`,
      position: 1,
      isRequired: moduleRequired
    }
  });
  const lesson = await db.lesson.create({
    data: {
      moduleId: courseModule.id,
      slug: `lecon-${prefix}`,
      title: `Leçon ${prefix}`,
      summary: "Résumé de la leçon.",
      durationMinutes: 10,
      position: 1,
      status: "published",
      isRequired: lessonRequired,
      content: {
        version: 1,
        blocks: [{ type: "paragraph", text: "Contenu de test." }]
      }
    }
  });
  const resource = await db.courseResource.create({
    data: {
      courseId,
      lessonId: lesson.id,
      title: `Ressource ${prefix}`,
      kind: "link",
      externalUrl: "https://example.com/ressource",
      isProtected: true
    }
  });

  return { courseModule, lesson, resource };
}

describe("actions administratives LMS", () => {
  it("archive modules, leçons et ressources sans suppression et sans dupliquer l'audit", async () => {
    const suffix = crypto.randomUUID();
    const course = await createCourse(`admin-archive-${suffix}`);
    const { courseModule, lesson, resource } = await createCourseContent({
      courseId: course.id,
      prefix: suffix,
      moduleRequired: false,
      lessonRequired: false
    });

    const moduleForm = new FormData();
    moduleForm.set("courseId", course.id);
    moduleForm.set("moduleId", courseModule.id);
    const lessonForm = new FormData();
    lessonForm.set("courseId", course.id);
    lessonForm.set("lessonId", lesson.id);
    const resourceForm = new FormData();
    resourceForm.set("courseId", course.id);
    resourceForm.set("resourceId", resource.id);

    await archiveModuleAction(moduleForm);
    await archiveModuleAction(moduleForm);
    await archiveLessonAction(lessonForm);
    await archiveLessonAction(lessonForm);
    await archiveResourceAction(resourceForm);
    await archiveResourceAction(resourceForm);

    await expect(
      db.courseModule.findUnique({ where: { id: courseModule.id } })
    ).resolves.toMatchObject({ archivedAt: expect.any(Date) });
    await expect(
      db.lesson.findUnique({ where: { id: lesson.id } })
    ).resolves.toMatchObject({ archivedAt: expect.any(Date) });
    await expect(
      db.courseResource.findUnique({ where: { id: resource.id } })
    ).resolves.toMatchObject({ archivedAt: expect.any(Date) });
    await expect(
      db.adminAuditLog.count({
        where: {
          entityId: { in: [courseModule.id, lesson.id, resource.id] },
          action: {
            in: ["module.archived", "lesson.archived", "resource.archived"]
          }
        }
      })
    ).resolves.toBe(3);
    expect(revalidatePath).toHaveBeenCalledWith(
      `/administration/formations/${course.id}`
    );
  });

  it("refuse d'archiver le contenu obligatoire déjà offert", async () => {
    const suffix = crypto.randomUUID();
    const course = await createCourse(
      `admin-archive-obligatoire-${suffix}`,
      "published"
    );
    const { courseModule, lesson, resource } = await createCourseContent({
      courseId: course.id,
      prefix: suffix
    });
    const learner = await db.user.create({
      data: {
        email: `archive-required-${suffix}@example.com`,
        emailVerified: new Date(),
        role: "learner",
        isActive: true
      }
    });
    await db.enrollment.create({
      data: { userId: learner.id, courseId: course.id, source: "manual" }
    });

    const moduleForm = new FormData();
    moduleForm.set("courseId", course.id);
    moduleForm.set("moduleId", courseModule.id);
    const lessonForm = new FormData();
    lessonForm.set("courseId", course.id);
    lessonForm.set("lessonId", lesson.id);

    await expect(archiveModuleAction(moduleForm)).rejects.toThrow(
      /module obligatoire.*dupliquez/i
    );
    await expect(archiveLessonAction(lessonForm)).rejects.toThrow(
      /leçon obligatoire.*dupliquez/i
    );
    await expect(
      db.courseModule.findUnique({ where: { id: courseModule.id } })
    ).resolves.toMatchObject({ archivedAt: null });
    await expect(
      db.lesson.findUnique({ where: { id: lesson.id } })
    ).resolves.toMatchObject({ archivedAt: null });

    // Une ressource n'influence pas la structure ni la progression historique.
    const resourceForm = new FormData();
    resourceForm.set("courseId", course.id);
    resourceForm.set("resourceId", resource.id);
    await archiveResourceAction(resourceForm);
    await expect(
      db.courseResource.findUnique({ where: { id: resource.id } })
    ).resolves.toMatchObject({ archivedAt: expect.any(Date) });
  });

  it("refuse un identifiant d'un autre cours et relit le rôle en base", async () => {
    const suffix = crypto.randomUUID();
    const [firstCourse, secondCourse] = await Promise.all([
      createCourse(`admin-archive-scope-a-${suffix}`),
      createCourse(`admin-archive-scope-b-${suffix}`)
    ]);
    const { courseModule, resource } = await createCourseContent({
      courseId: firstCourse.id,
      prefix: suffix,
      moduleRequired: false,
      lessonRequired: false
    });
    const forgedForm = new FormData();
    forgedForm.set("courseId", secondCourse.id);
    forgedForm.set("moduleId", courseModule.id);

    await expect(archiveModuleAction(forgedForm)).rejects.toThrow(
      /n'appartient pas à cette formation/i
    );

    const learner = await db.user.create({
      data: {
        email: `archive-role-${suffix}@example.com`,
        emailVerified: new Date(),
        role: "learner",
        isActive: true
      }
    });
    const resourceForm = new FormData();
    resourceForm.set("courseId", firstCourse.id);
    resourceForm.set("resourceId", resource.id);
    authState.userId = learner.id;
    try {
      await expect(archiveResourceAction(resourceForm)).rejects.toThrow();
    } finally {
      authState.userId = adminId;
    }
    await expect(
      db.courseResource.findUnique({ where: { id: resource.id } })
    ).resolves.toMatchObject({ archivedAt: null });
  });

  it("protège le dernier administrateur dans la transaction", async () => {
    const otherAdmins = await db.user.findMany({
      where: { role: "admin", id: { not: adminId } },
      select: { id: true, role: true, isActive: true }
    });
    try {
      await db.user.updateMany({
        where: { role: "admin", id: { not: adminId } },
        data: { role: "learner" }
      });
      const formData = new FormData();
      formData.set("userId", adminId);
      formData.set("role", "learner");

      await expect(updateUserAccessAction(formData)).rejects.toThrow(
        /dernier administrateur/i
      );
      await expect(
        db.user.findUnique({ where: { id: adminId } })
      ).resolves.toMatchObject({ role: "admin", isActive: true });
    } finally {
      for (const user of otherAdmins) {
        await db.user.update({
          where: { id: user.id },
          data: { role: user.role, isActive: user.isActive }
        });
      }
    }
  });

  it("refuse de déplacer une leçon vers un autre module par falsification d’identifiant", async () => {
    const [firstCourse, secondCourse] = await Promise.all([
      createCourse("admin-idor-premier"),
      createCourse("admin-idor-second")
    ]);
    const [firstModule, secondModule] = await Promise.all([
      db.courseModule.create({
        data: {
          courseId: firstCourse.id,
          title: "Premier module",
          position: 1
        }
      }),
      db.courseModule.create({
        data: {
          courseId: secondCourse.id,
          title: "Second module",
          position: 1
        }
      })
    ]);
    const lesson = await db.lesson.create({
      data: {
        moduleId: firstModule.id,
        slug: "lecon-test",
        title: "Leçon test",
        summary: "Résumé",
        durationMinutes: 10,
        position: 1,
        content: {
          version: 1,
          blocks: [{ type: "paragraph", text: "Contenu de test." }]
        }
      }
    });
    const formData = new FormData();
    formData.set("id", lesson.id);
    formData.set("moduleId", secondModule.id);
    formData.set("slug", lesson.slug);
    formData.set("title", lesson.title);
    formData.set("summary", lesson.summary);
    formData.set("durationMinutes", "10");
    formData.set("position", "1");
    formData.set("status", "draft");
    formData.set("isRequired", "on");
    formData.set(
      "contentJson",
      JSON.stringify({
        version: 1,
        blocks: [{ type: "paragraph", text: "Contenu de test." }]
      })
    );

    await expect(saveLessonAction(formData)).rejects.toThrow(
      /n’appartient pas au module/i
    );
    await expect(
      db.lesson.findUnique({ where: { id: lesson.id } })
    ).resolves.toMatchObject({ moduleId: firstModule.id });
  });

  it("refuse un lien de ressource privé et une inscription à un brouillon", async () => {
    const course = await createCourse("admin-validation-brouillon");
    const resourceForm = new FormData();
    resourceForm.set("courseId", course.id);
    resourceForm.set("title", "Lien privé");
    resourceForm.set("description", "Test");
    resourceForm.set("externalUrl", "https://127.0.0.1/secret");
    await expect(addResourceAction(resourceForm)).rejects.toThrow(
      /HTTPS, public/i
    );

    const learner = await db.user.create({
      data: {
        email: "learner-draft-actions@example.com",
        emailVerified: new Date(),
        role: "learner",
        isActive: true
      }
    });
    const enrollmentForm = new FormData();
    enrollmentForm.set("courseId", course.id);
    enrollmentForm.set("email", learner.email!);
    await expect(manualEnrollmentAction(enrollmentForm)).rejects.toThrow(
      /publiée et active/i
    );
  });

  it("révoque atomiquement le certificat et applique aussi l’état défensif de l’inscription", async () => {
    const course = await createCourse(
      `admin-revocation-${crypto.randomUUID()}`,
      "published"
    );
    const learner = await db.user.create({
      data: {
        email: `learner-revocation-${crypto.randomUUID()}@example.com`,
        emailVerified: new Date(),
        role: "learner",
        isActive: true
      }
    });
    const enrollment = await db.enrollment.create({
      data: { userId: learner.id, courseId: course.id, source: "manual" }
    });
    const certificate = await db.certificate.create({
      data: {
        enrollmentId: enrollment.id,
        userId: learner.id,
        courseId: course.id,
        token: randomBytes(32).toString("base64url")
      }
    });
    const formData = new FormData();
    formData.set("enrollmentId", enrollment.id);

    await revokeEnrollmentAction(formData);

    await expect(
      db.certificate.findUnique({ where: { id: certificate.id } })
    ).resolves.toMatchObject({ revokedAt: expect.any(Date) });
    await expect(
      getPublicCertificateByToken(certificate.token)
    ).resolves.toMatchObject({ status: "revoked" });

    // Simule une ancienne ligne incohérente afin de vérifier la défense en lecture.
    await db.certificate.update({
      where: { id: certificate.id },
      data: { revokedAt: null }
    });
    await expect(
      getPublicCertificateByToken(certificate.token)
    ).resolves.toMatchObject({ status: "revoked" });
  });
});

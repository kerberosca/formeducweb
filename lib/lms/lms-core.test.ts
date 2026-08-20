import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import {
  getPublicCertificateByToken,
  issueCertificateIfEligible,
  renderCertificatePdfForUser,
  revokeCertificate
} from "@/lib/lms/certificates";
import { enrollUserInCourse } from "@/lib/lms/enrollments";
import { LmsError } from "@/lib/lms/errors";
import { importLegacyProgress, updateLessonProgress } from "@/lib/lms/progress";
import { getQuizForUser, submitQuizAttempt } from "@/lib/lms/quizzes";
import {
  getResourceForUser,
  getSafeExternalResourceUrl
} from "@/lib/lms/resources";
import {
  legacyProgressImportSchema,
  lessonContentSchema,
  progressRequestSchema
} from "@/lib/lms/validation";

const originalResourceRoot = process.env.LMS_RESOURCE_ROOT;
let resourceRoot = "";

async function clearLmsData() {
  await db.adminAuditLog.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.quizAttempt.deleteMany();
  await db.certificate.deleteMany();
  await db.enrollment.deleteMany();
  await db.entitlement.deleteMany();
  await db.stripeEvent.deleteMany();
  await db.emailJob.deleteMany();
  await db.order.deleteMany();
  await db.quizChoice.deleteMany();
  await db.quizQuestion.deleteMany();
  await db.quiz.deleteMany();
  await db.courseResource.deleteMany();
  await db.lesson.deleteMany();
  await db.courseModule.deleteMany();
  await db.course.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();
}

async function createUser(role = "learner") {
  return db.user.create({
    data: {
      name: role === "admin" ? "Administratrice Test" : "Camille Test",
      email: `${role}-${crypto.randomUUID()}@example.invalid`,
      emailVerified: new Date(),
      isActive: true,
      role
    }
  });
}

async function createFreeCourse() {
  const course = await db.course.create({
    data: {
      slug: `cours-${crypto.randomUUID()}`,
      title: "Formation de test",
      shortTitle: "Test",
      description: "Formation utilisée par les tests du LMS.",
      theme: "numerique",
      level: "debutant",
      offer: "free",
      priceCents: 0,
      durationMinutes: 20,
      durationLabel: "20 min",
      format: "autonome",
      audience: "Toute personne",
      outcomes: [],
      prerequisites: [],
      status: "published",
      publishedAt: new Date()
    }
  });
  const courseModule = await db.courseModule.create({
    data: {
      courseId: course.id,
      title: "Module requis",
      position: 1,
      isRequired: true
    }
  });
  const lesson = await db.lesson.create({
    data: {
      moduleId: courseModule.id,
      slug: "lecon-test",
      title: "Leçon test",
      summary: "Une leçon de validation.",
      durationMinutes: 20,
      position: 1,
      content: {
        version: 1,
        blocks: [{ type: "paragraph", text: "Contenu sans HTML." }]
      },
      status: "published",
      isRequired: true
    }
  });
  return { course, module: courseModule, lesson };
}

async function createQuiz(lessonId: string, maxAttempts = 2) {
  return db.quiz.create({
    data: {
      lessonId,
      title: "Validation",
      passingScore: 80,
      maxAttempts,
      status: "published",
      questions: {
        create: [
          {
            prompt: "Quelle réponse est correcte?",
            explanation: "La première réponse est le bon réflexe.",
            position: 1,
            choices: {
              create: [
                { label: "Le bon réflexe", isCorrect: true, position: 1 },
                { label: "Le mauvais réflexe", isCorrect: false, position: 2 }
              ]
            }
          }
        ]
      }
    },
    include: { questions: { include: { choices: true } } }
  });
}

beforeEach(async () => {
  await clearLmsData();
  resourceRoot = path.resolve("tmp", `lms-resources-${crypto.randomUUID()}`);
  await mkdir(resourceRoot, { recursive: true });
  process.env.LMS_RESOURCE_ROOT = resourceRoot;
});

afterEach(async () => {
  if (originalResourceRoot === undefined) delete process.env.LMS_RESOURCE_ROOT;
  else process.env.LMS_RESOURCE_ROOT = originalResourceRoot;
  if (resourceRoot.includes("lms-resources-")) {
    await rm(resourceRoot, { recursive: true, force: true });
  }
});

describe("validation LMS", () => {
  it("refuse le HTML et exige une confirmation explicite pour l’import", () => {
    expect(
      lessonContentSchema.safeParse({
        version: 1,
        blocks: [{ type: "paragraph", text: "<script>alert(1)</script>" }]
      }).success
    ).toBe(false);
    expect(
      legacyProgressImportSchema.safeParse({
        courseSlug: "cours-test",
        confirmed: false,
        items: [{ lessonSlug: "lecon", completed: true }]
      }).success
    ).toBe(false);
    expect(
      progressRequestSchema.safeParse({
        operation: "update",
        courseSlug: "cours-test",
        lessonId: "cm00000000000000000000000",
        status: "completed"
      }).success
    ).toBe(true);
  });
});

describe("inscriptions et progression", () => {
  it("crée une inscription gratuite de façon idempotente", async () => {
    const [user, { course }] = await Promise.all([
      createUser(),
      createFreeCourse()
    ]);

    const first = await enrollUserInCourse(user.id, { courseId: course.id });
    const second = await enrollUserInCourse(user.id, {
      courseSlug: course.slug
    });

    expect(second.id).toBe(first.id);
    expect(await db.enrollment.count({ where: { userId: user.id } })).toBe(1);
  });

  it("conserve la progression côté serveur, bloque l’IDOR et importe une seule fois", async () => {
    const owner = await createUser();
    const stranger = await createUser();
    const { course, lesson } = await createFreeCourse();
    await enrollUserInCourse(owner.id, { courseId: course.id });

    await expect(
      updateLessonProgress(stranger.id, {
        courseId: course.id,
        lessonId: lesson.id,
        status: "completed",
        lastPosition: 10
      })
    ).rejects.toMatchObject({ status: 404 });

    const firstImport = await importLegacyProgress(
      owner.id,
      { courseId: course.id },
      [{ lessonSlug: lesson.slug, completed: true, lastPosition: 12 }],
      true
    );
    const secondImport = await importLegacyProgress(
      owner.id,
      { courseId: course.id },
      [{ lessonSlug: lesson.slug, completed: false, lastPosition: 1 }],
      true
    );

    expect(firstImport.alreadyImported).toBe(false);
    expect(firstImport.enrollment.progressPercent).toBe(100);
    expect(secondImport.alreadyImported).toBe(true);
    expect(await db.adminAuditLog.count()).toBe(1);
    expect(
      await db.lessonProgress.findUnique({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: firstImport.enrollment.id,
            lessonId: lesson.id
          }
        }
      })
    ).toMatchObject({ status: "completed", lastPosition: 12 });
  });

  it("conserve l’apprentissage actif après archivage sans accepter de nouvelle inscription", async () => {
    const learner = await createUser();
    const newcomer = await createUser();
    const { course, lesson } = await createFreeCourse();
    await enrollUserInCourse(learner.id, { courseId: course.id });
    await db.course.update({
      where: { id: course.id },
      data: { status: "archived", archivedAt: new Date() }
    });

    await expect(
      updateLessonProgress(learner.id, {
        courseId: course.id,
        lessonId: lesson.id,
        status: "completed",
        lastPosition: 5
      })
    ).resolves.toMatchObject({ progressPercent: 100 });
    await expect(
      enrollUserInCourse(newcomer.id, { courseId: course.id })
    ).rejects.toMatchObject({ status: 404, code: "course_not_found" });
  });
});

describe("quiz et certificat", () => {
  it("applique le seuil et la limite, puis émet un seul certificat PDF révocable", async () => {
    const user = await createUser();
    const admin = await createUser("admin");
    const stranger = await createUser();
    const { course, lesson } = await createFreeCourse();
    const quiz = await createQuiz(lesson.id);
    const enrollment = await enrollUserInCourse(user.id, {
      courseId: course.id
    });
    await updateLessonProgress(user.id, {
      courseId: course.id,
      lessonId: lesson.id,
      status: "completed",
      lastPosition: 20
    });

    expect(await db.certificate.count()).toBe(0);
    const publicQuiz = await getQuizForUser(user.id, { quizId: quiz.id });
    expect(JSON.stringify(publicQuiz.questions)).not.toContain("isCorrect");
    expect(JSON.stringify(publicQuiz.questions)).not.toContain("explanation");

    const question = quiz.questions[0];
    const wrong = question.choices.find((choice) => !choice.isCorrect)!;
    const right = question.choices.find((choice) => choice.isCorrect)!;
    const failed = await submitQuizAttempt(user.id, quiz.id, [
      { questionId: question.id, choiceId: wrong.id }
    ]);
    const passed = await submitQuizAttempt(user.id, quiz.id, [
      { questionId: question.id, choiceId: right.id }
    ]);

    expect(failed).toMatchObject({ score: 0, passed: false });
    expect(failed.feedback[0]).toMatchObject({
      questionId: question.id,
      selectedChoiceId: wrong.id,
      correct: false
    });
    expect(failed.feedback[0]).not.toHaveProperty("correctChoiceId");
    expect(failed.feedback[0]).not.toHaveProperty("explanation");
    expect(passed).toMatchObject({
      score: 100,
      passed: true,
      passingScore: 80
    });
    expect(passed.feedback[0]).toMatchObject({
      correctChoiceId: right.id,
      explanation: "La première réponse est le bon réflexe."
    });
    await expect(
      submitQuizAttempt(user.id, quiz.id, [
        { questionId: question.id, choiceId: right.id }
      ])
    ).rejects.toMatchObject({
      status: 409,
      code: "quiz_attempt_limit_reached"
    });

    const firstCertificate = await db.certificate.findUniqueOrThrow({
      where: { enrollmentId: enrollment.id }
    });
    const sameCertificate = await issueCertificateIfEligible(
      user.id,
      enrollment.id
    );
    expect(sameCertificate?.id).toBe(firstCertificate.id);
    expect(sameCertificate?.token).toBe(firstCertificate.token);
    expect(firstCertificate.token).toMatch(/^[A-Za-z0-9_-]{43}$/);

    await expect(
      renderCertificatePdfForUser(stranger.id, firstCertificate.id)
    ).rejects.toMatchObject({ status: 404, code: "certificate_not_found" });
    const pdf = await renderCertificatePdfForUser(user.id, firstCertificate.id);
    const samePdf = await renderCertificatePdfForUser(
      user.id,
      firstCertificate.id
    );
    expect(pdf.buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.buffer.byteLength).toBeGreaterThan(1_000);
    expect(pdf.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(samePdf.hash).toBe(pdf.hash);

    await revokeCertificate(
      admin.id,
      firstCertificate.id,
      "Test de révocation"
    );
    await expect(
      renderCertificatePdfForUser(user.id, firstCertificate.id)
    ).rejects.toMatchObject({ status: 410, code: "certificate_revoked" });
    expect(
      await getPublicCertificateByToken(firstCertificate.token)
    ).toMatchObject({ id: firstCertificate.id, revokedAt: expect.any(Date) });
  });

  it("révèle la correction après une dernière tentative échouée", async () => {
    const user = await createUser();
    const { course, lesson } = await createFreeCourse();
    const quiz = await createQuiz(lesson.id, 1);
    await enrollUserInCourse(user.id, { courseId: course.id });
    const question = quiz.questions[0];
    const wrong = question.choices.find((choice) => !choice.isCorrect)!;
    const right = question.choices.find((choice) => choice.isCorrect)!;

    const exhausted = await submitQuizAttempt(user.id, quiz.id, [
      { questionId: question.id, choiceId: wrong.id }
    ]);

    expect(exhausted).toMatchObject({ score: 0, passed: false });
    expect(exhausted.feedback[0]).toMatchObject({
      correctChoiceId: right.id,
      explanation: "La première réponse est le bon réflexe."
    });
  });
});

describe("ressources protégées", () => {
  it("confine les fichiers, applique la liste autorisée et protège contre l’IDOR", async () => {
    const owner = await createUser();
    const stranger = await createUser();
    const { course, lesson } = await createFreeCourse();
    await enrollUserInCourse(owner.id, { courseId: course.id });
    const fileName = "guide-test.txt";
    const contents = Buffer.from("Ressource de pratique Formeduc.", "utf8");
    await writeFile(path.join(resourceRoot, fileName), contents);
    const resource = await db.courseResource.create({
      data: {
        courseId: course.id,
        lessonId: lesson.id,
        title: "Guide",
        kind: "file",
        fileName,
        storageKey: fileName,
        mimeType: "text/plain",
        sizeBytes: contents.byteLength
      }
    });

    await expect(
      getResourceForUser(stranger.id, resource.id)
    ).rejects.toMatchObject({
      status: 403
    });
    const downloaded = await getResourceForUser(owner.id, resource.id);
    expect(downloaded.kind).toBe("file");
    if (downloaded.kind === "file") {
      expect(downloaded.data.toString("utf8")).toBe(contents.toString("utf8"));
    }

    const escaped = await db.courseResource.create({
      data: {
        courseId: course.id,
        title: "Fichier hors périmètre",
        kind: "file",
        fileName: "secret.txt",
        storageKey: "../secret.txt",
        mimeType: "text/plain",
        sizeBytes: 1
      }
    });
    await expect(
      getResourceForUser(owner.id, escaped.id)
    ).rejects.toMatchObject({
      code: "invalid_storage_key"
    });

    const disguisedName = "page.txt";
    const disguised = Buffer.from(
      "<!doctype html><html><body>Non</body></html>"
    );
    await writeFile(path.join(resourceRoot, disguisedName), disguised);
    const disguisedResource = await db.courseResource.create({
      data: {
        courseId: course.id,
        title: "HTML déguisé",
        kind: "file",
        fileName: disguisedName,
        storageKey: disguisedName,
        mimeType: "text/plain",
        sizeBytes: disguised.byteLength
      }
    });
    await expect(
      getResourceForUser(owner.id, disguisedResource.id)
    ).rejects.toMatchObject({ code: "resource_content_mismatch" });
  });

  it("masque uniformément les ressources de leçons indisponibles tout en préservant les cours archivés", async () => {
    const owner = await createUser();
    const { course, module: courseModule, lesson } = await createFreeCourse();
    await enrollUserInCourse(owner.id, { courseId: course.id });
    const fileName = "etat-lecon.txt";
    const contents = Buffer.from("Ressource liée à une leçon publiée.", "utf8");
    await writeFile(path.join(resourceRoot, fileName), contents);
    const resource = await db.courseResource.create({
      data: {
        courseId: course.id,
        lessonId: lesson.id,
        title: "Ressource de leçon",
        kind: "file",
        fileName,
        storageKey: fileName,
        mimeType: "text/plain",
        sizeBytes: contents.byteLength
      }
    });

    await db.lesson.update({
      where: { id: lesson.id },
      data: { status: "draft" }
    });
    await expect(
      getResourceForUser(owner.id, resource.id)
    ).rejects.toMatchObject({ status: 404, code: "resource_not_found" });

    await db.lesson.update({
      where: { id: lesson.id },
      data: { status: "published", archivedAt: new Date() }
    });
    await expect(
      getResourceForUser(owner.id, resource.id)
    ).rejects.toMatchObject({ status: 404, code: "resource_not_found" });

    await db.lesson.update({
      where: { id: lesson.id },
      data: { archivedAt: null }
    });
    await db.courseModule.update({
      where: { id: courseModule.id },
      data: { archivedAt: new Date() }
    });
    await expect(
      getResourceForUser(owner.id, resource.id)
    ).rejects.toMatchObject({ status: 404, code: "resource_not_found" });

    await db.courseModule.update({
      where: { id: courseModule.id },
      data: { archivedAt: null }
    });
    await db.course.update({
      where: { id: course.id },
      data: { status: "archived", archivedAt: new Date() }
    });
    await expect(
      getResourceForUser(owner.id, resource.id)
    ).resolves.toMatchObject({ kind: "file" });
  });

  it("n’autorise que les redirections HTTPS sans identifiants", () => {
    expect(getSafeExternalResourceUrl("https://example.com/guide")).toBe(
      "https://example.com/guide"
    );
    expect(getSafeExternalResourceUrl("http://example.com/guide")).toBeNull();
    expect(
      getSafeExternalResourceUrl("https://user:pass@example.com/")
    ).toBeNull();
    expect(getSafeExternalResourceUrl("https://127.0.0.1/guide")).toBeNull();
    expect(
      getSafeExternalResourceUrl("https://service.local/guide")
    ).toBeNull();
    expect(getSafeExternalResourceUrl("javascript:alert(1)")).toBeNull();
  });
});

// Ensure imported error shape remains stable for API callers.
expect(new LmsError(403, "Interdit", "forbidden")).toMatchObject({
  status: 403,
  code: "forbidden"
});

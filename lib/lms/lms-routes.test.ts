import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { authenticatedUserMock } = vi.hoisted(() => ({
  authenticatedUserMock: vi.fn()
}));

vi.mock("@/lib/lms/authenticated-user", () => ({
  getAuthenticatedLmsUser: authenticatedUserMock
}));

import { GET as downloadCertificate } from "@/app/api/lms/certificates/[id]/pdf/route";
import { GET as downloadResource } from "@/app/api/lms/resources/[id]/download/route";
import { db } from "@/lib/db";

const originalResourceRoot = process.env.LMS_RESOURCE_ROOT;
let resourceRoot = "";

async function clearData() {
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

async function createFixture() {
  const owner = await db.user.create({
    data: {
      name: "Alex Formation",
      email: `owner-${crypto.randomUUID()}@example.invalid`,
      emailVerified: new Date(),
      isActive: true
    }
  });
  const stranger = await db.user.create({
    data: {
      email: `stranger-${crypto.randomUUID()}@example.invalid`,
      emailVerified: new Date(),
      isActive: true
    }
  });
  const course = await db.course.create({
    data: {
      slug: `route-${crypto.randomUUID()}`,
      title: "Cours protégé",
      shortTitle: "Cours",
      description: "Cours de test des routes.",
      theme: "test",
      level: "debutant",
      offer: "free",
      priceCents: 0,
      durationMinutes: 10,
      durationLabel: "10 min",
      format: "autonome",
      audience: "Test",
      outcomes: [],
      prerequisites: [],
      status: "published",
      publishedAt: new Date()
    }
  });
  const courseModule = await db.courseModule.create({
    data: { courseId: course.id, title: "Module", position: 1 }
  });
  const lesson = await db.lesson.create({
    data: {
      moduleId: courseModule.id,
      slug: "lecon",
      title: "Leçon",
      summary: "Résumé",
      durationMinutes: 10,
      position: 1,
      content: { version: 1, blocks: [{ type: "paragraph", text: "Test" }] },
      status: "published"
    }
  });
  const enrollment = await db.enrollment.create({
    data: {
      userId: owner.id,
      courseId: course.id,
      progressPercent: 100,
      completedAt: new Date()
    }
  });
  const certificate = await db.certificate.create({
    data: {
      enrollmentId: enrollment.id,
      userId: owner.id,
      courseId: course.id,
      token: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
        "base64url"
      )
    }
  });
  const contents = Buffer.from("Fichier protégé", "utf8");
  await writeFile(path.join(resourceRoot, "guide.txt"), contents);
  const resource = await db.courseResource.create({
    data: {
      courseId: course.id,
      lessonId: lesson.id,
      title: "Guide",
      kind: "file",
      fileName: "guide.txt",
      storageKey: "guide.txt",
      mimeType: "text/plain",
      sizeBytes: contents.byteLength
    }
  });

  return { owner, stranger, certificate, resource };
}

beforeEach(async () => {
  authenticatedUserMock.mockReset();
  await clearData();
  resourceRoot = path.resolve("tmp", `lms-route-${crypto.randomUUID()}`);
  await mkdir(resourceRoot, { recursive: true });
  process.env.LMS_RESOURCE_ROOT = resourceRoot;
});

afterEach(async () => {
  if (originalResourceRoot === undefined) delete process.env.LMS_RESOURCE_ROOT;
  else process.env.LMS_RESOURCE_ROOT = originalResourceRoot;
  if (resourceRoot.includes("lms-route-")) {
    await rm(resourceRoot, { recursive: true, force: true });
  }
});

describe("routes LMS protégées", () => {
  it("sert la ressource au propriétaire et refuse l’IDOR", async () => {
    const { owner, stranger, resource } = await createFixture();
    authenticatedUserMock.mockResolvedValueOnce(stranger);
    const denied = await downloadResource(
      new Request(`http://localhost/api/lms/resources/${resource.id}/download`),
      { params: Promise.resolve({ id: resource.id }) }
    );
    expect(denied.status).toBe(403);

    authenticatedUserMock.mockResolvedValueOnce(owner);
    const allowed = await downloadResource(
      new Request(`http://localhost/api/lms/resources/${resource.id}/download`),
      { params: Promise.resolve({ id: resource.id }) }
    );
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("content-type")).toBe("text/plain");
    expect(allowed.headers.get("cache-control")).toContain("no-store");
    expect(allowed.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(await allowed.text()).toBe("Fichier protégé");
  });

  it("masque un certificat étranger, sert le PDF et bloque sa révocation", async () => {
    const { owner, stranger, certificate } = await createFixture();
    authenticatedUserMock.mockResolvedValueOnce(stranger);
    const hidden = await downloadCertificate(
      new Request(
        `http://localhost/api/lms/certificates/${certificate.id}/pdf`
      ),
      { params: Promise.resolve({ id: certificate.id }) }
    );
    expect(hidden.status).toBe(404);

    authenticatedUserMock.mockResolvedValueOnce(owner);
    const allowed = await downloadCertificate(
      new Request(
        `http://localhost/api/lms/certificates/${certificate.id}/pdf`
      ),
      { params: Promise.resolve({ id: certificate.id }) }
    );
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("content-type")).toBe("application/pdf");
    expect(allowed.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(
      new TextDecoder().decode((await allowed.arrayBuffer()).slice(0, 4))
    ).toBe("%PDF");

    await db.certificate.update({
      where: { id: certificate.id },
      data: { revokedAt: new Date() }
    });
    authenticatedUserMock.mockResolvedValueOnce(owner);
    const revoked = await downloadCertificate(
      new Request(
        `http://localhost/api/lms/certificates/${certificate.id}/pdf`
      ),
      { params: Promise.resolve({ id: certificate.id }) }
    );
    expect(revoked.status).toBe(410);
    expect(await revoked.json()).toMatchObject({ code: "certificate_revoked" });
  });
});

import { createHash, randomBytes } from "node:crypto";
import type { ReactElement } from "react";

import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import {
  CertificatePdfDocument,
  type CertificatePdfDocumentProps
} from "@/lib/lms/certificate-pdf";
import { LmsError } from "@/lib/lms/errors";
import { getAbsoluteUrl } from "@/lib/seo";

function opaqueCertificateToken() {
  return randomBytes(32).toString("base64url");
}

async function assertCertificateEligibility(
  userId: string,
  enrollmentId: string
) {
  const enrollment = await db.enrollment.findFirst({
    where: {
      id: enrollmentId,
      userId,
      status: "active",
      revokedAt: null
    },
    select: {
      id: true,
      courseId: true,
      progressPercent: true,
      completedAt: true
    }
  });

  if (!enrollment) {
    throw new LmsError(
      404,
      "L’inscription est introuvable.",
      "enrollment_not_found"
    );
  }
  if (enrollment.progressPercent < 100 || !enrollment.completedAt) {
    return null;
  }

  const requiredQuizzes = await db.quiz.findMany({
    where: {
      status: "published",
      lesson: {
        status: "published",
        archivedAt: null,
        isRequired: true,
        module: {
          courseId: enrollment.courseId,
          isRequired: true,
          archivedAt: null
        }
      }
    },
    select: { id: true }
  });

  if (requiredQuizzes.length) {
    const passed = await db.quizAttempt.findMany({
      where: {
        enrollmentId,
        userId,
        passed: true,
        quizId: { in: requiredQuizzes.map((quiz) => quiz.id) }
      },
      distinct: ["quizId"],
      select: { quizId: true }
    });
    if (passed.length !== requiredQuizzes.length) return null;
  }

  return enrollment;
}

export async function issueCertificateIfEligible(
  userId: string,
  enrollmentId: string
) {
  const enrollment = await assertCertificateEligibility(userId, enrollmentId);
  if (!enrollment) return null;

  try {
    return await db.certificate.upsert({
      where: { enrollmentId },
      create: {
        enrollmentId,
        userId,
        courseId: enrollment.courseId,
        token: opaqueCertificateToken()
      },
      update: {}
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return db.certificate.findUnique({ where: { enrollmentId } });
    }
    throw error;
  }
}

export async function getPublicCertificateByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;

  const certificate = await db.certificate.findUnique({
    where: { token },
    select: {
      id: true,
      issuedAt: true,
      revokedAt: true,
      user: { select: { name: true } },
      course: { select: { title: true } },
      enrollment: { select: { status: true, revokedAt: true } }
    }
  });
  if (!certificate) return null;
  const { enrollment, ...publicCertificate } = certificate;
  const isRevoked = Boolean(
    certificate.revokedAt ||
    enrollment.status !== "active" ||
    enrollment.revokedAt
  );
  return {
    ...publicCertificate,
    status: isRevoked ? ("revoked" as const) : ("active" as const)
  };
}

async function requireOwnedCertificate(userId: string, certificateId: string) {
  const certificate = await db.certificate.findFirst({
    where: { id: certificateId, userId },
    include: {
      user: { select: { name: true, email: true, isActive: true } },
      course: { select: { title: true } },
      enrollment: {
        select: { status: true, revokedAt: true }
      }
    }
  });

  // A single 404 response prevents probing another learner's certificate IDs.
  if (!certificate) {
    throw new LmsError(
      404,
      "Le certificat est introuvable.",
      "certificate_not_found"
    );
  }
  if (!certificate.user.isActive) {
    throw new LmsError(403, "Ce compte est inactif.", "inactive_account");
  }
  if (
    certificate.enrollment.status !== "active" ||
    certificate.enrollment.revokedAt
  ) {
    throw new LmsError(
      403,
      "L’accès à cette formation est révoqué.",
      "enrollment_revoked"
    );
  }
  if (certificate.revokedAt) {
    throw new LmsError(
      410,
      "Ce certificat a été révoqué.",
      "certificate_revoked"
    );
  }

  return certificate;
}

export async function renderCertificatePdfForUser(
  userId: string,
  certificateId: string
) {
  const certificate = await requireOwnedCertificate(userId, certificateId);
  const recipient =
    certificate.user.name?.trim() || certificate.user.email || "Apprenant";
  const issuedOn = new Intl.DateTimeFormat("fr-CA", {
    dateStyle: "long",
    timeZone: "America/Toronto"
  }).format(certificate.issuedAt);
  const props: CertificatePdfDocumentProps = {
    certificateId: certificate.id,
    recipient,
    courseTitle: certificate.course.title,
    issuedOn,
    issuedAt: certificate.issuedAt,
    verificationUrl: getAbsoluteUrl(
      `/certificats/verifier/${certificate.token}`
    )
  };
  const document = CertificatePdfDocument(props) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(document);
  const hash = createHash("sha256").update(buffer).digest("hex");

  const stillActive = await db.certificate.updateMany({
    where: {
      id: certificate.id,
      userId,
      revokedAt: null,
      enrollment: { status: "active", revokedAt: null }
    },
    data: { pdfHash: hash }
  });
  if (stillActive.count !== 1) {
    throw new LmsError(
      410,
      "Ce certificat a été révoqué.",
      "certificate_revoked"
    );
  }

  return { certificate, buffer, hash };
}

export async function revokeCertificate(
  actorId: string,
  certificateId: string,
  reason: string
) {
  const actor = await db.user.findFirst({
    where: { id: actorId, role: "admin", isActive: true },
    select: { id: true }
  });
  if (!actor) {
    throw new LmsError(
      403,
      "Un rôle administrateur est requis.",
      "admin_required"
    );
  }

  return db.$transaction(async (transaction) => {
    const certificate = await transaction.certificate.findUnique({
      where: { id: certificateId }
    });
    if (!certificate) {
      throw new LmsError(
        404,
        "Le certificat est introuvable.",
        "certificate_not_found"
      );
    }
    if (certificate.revokedAt) return certificate;

    const revokedAt = new Date();
    const revoked = await transaction.certificate.update({
      where: { id: certificateId },
      data: { revokedAt }
    });
    await transaction.adminAuditLog.create({
      data: {
        actorId,
        action: "lms.certificate_revoked",
        entityType: "Certificate",
        entityId: certificateId,
        before: { revokedAt: null },
        after: {
          revokedAt: revokedAt.toISOString(),
          reason: reason.slice(0, 500)
        }
      }
    });
    return revoked;
  });
}

import { NextResponse } from "next/server";

import { getAuthenticatedLmsUser } from "@/lib/lms/authenticated-user";
import { lmsErrorResponse, LmsError } from "@/lib/lms/errors";
import {
  getCourseProgress,
  importLegacyProgress,
  updateLessonProgress
} from "@/lib/lms/progress";
import {
  enrollmentRequestSchema,
  progressRequestSchema
} from "@/lib/lms/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedLmsUser();
    const url = new URL(request.url);
    const parsed = enrollmentRequestSchema.safeParse({
      courseId: url.searchParams.get("courseId") || undefined,
      courseSlug: url.searchParams.get("courseSlug") || undefined
    });
    if (!parsed.success) {
      throw new LmsError(
        400,
        "La demande de progression est invalide.",
        "invalid_request"
      );
    }
    return NextResponse.json(await getCourseProgress(user.id, parsed.data));
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedLmsUser();
    const parsed = progressRequestSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      throw new LmsError(
        400,
        "La demande de progression est invalide.",
        "invalid_request"
      );
    }

    if (parsed.data.operation === "import_legacy") {
      return NextResponse.json(
        await importLegacyProgress(
          user.id,
          {
            courseId: parsed.data.courseId,
            courseSlug: parsed.data.courseSlug
          },
          parsed.data.items,
          parsed.data.confirmed
        )
      );
    }

    return NextResponse.json({
      enrollment: await updateLessonProgress(user.id, {
        courseId: parsed.data.courseId,
        courseSlug: parsed.data.courseSlug,
        lessonId: parsed.data.lessonId,
        status: parsed.data.status,
        lastPosition: parsed.data.lastPosition
      })
    });
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

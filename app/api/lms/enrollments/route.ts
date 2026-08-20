import { NextResponse } from "next/server";

import { getAuthenticatedLmsUser } from "@/lib/lms/authenticated-user";
import { enrollUserInCourse, listUserEnrollments } from "@/lib/lms/enrollments";
import { lmsErrorResponse, LmsError } from "@/lib/lms/errors";
import { enrollmentRequestSchema } from "@/lib/lms/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getAuthenticatedLmsUser();
    return NextResponse.json({
      enrollments: await listUserEnrollments(user.id)
    });
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedLmsUser();
    const parsed = enrollmentRequestSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      throw new LmsError(
        400,
        "La demande d’inscription est invalide.",
        "invalid_request"
      );
    }
    const enrollment = await enrollUserInCourse(user.id, parsed.data);
    return NextResponse.json({ enrollment }, { status: 200 });
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

import { NextResponse } from "next/server";

import { getAuthenticatedLmsUser } from "@/lib/lms/authenticated-user";
import { lmsErrorResponse, LmsError } from "@/lib/lms/errors";
import { getQuizForUser, submitQuizAttempt } from "@/lib/lms/quizzes";
import { quizLocatorSchema, quizSubmissionSchema } from "@/lib/lms/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedLmsUser();
    const url = new URL(request.url);
    const parsed = quizLocatorSchema.safeParse({
      quizId: url.searchParams.get("quizId") || undefined,
      lessonId: url.searchParams.get("lessonId") || undefined
    });
    if (!parsed.success) {
      throw new LmsError(
        400,
        "La demande de questionnaire est invalide.",
        "invalid_request"
      );
    }
    return NextResponse.json({
      quiz: await getQuizForUser(user.id, parsed.data)
    });
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedLmsUser();
    const parsed = quizSubmissionSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      throw new LmsError(
        400,
        "Les réponses sont invalides.",
        "invalid_request"
      );
    }
    return NextResponse.json({
      attempt: await submitQuizAttempt(
        user.id,
        parsed.data.quizId,
        parsed.data.answers
      )
    });
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

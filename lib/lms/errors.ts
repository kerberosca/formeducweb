import { NextResponse } from "next/server";

export class LmsError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "LmsError";
  }
}

export function lmsErrorResponse(error: unknown) {
  if (error instanceof LmsError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  console.error("LMS route error", error);
  return NextResponse.json(
    {
      error: "Une erreur est survenue. Veuillez réessayer.",
      code: "internal_error"
    },
    { status: 500 }
  );
}

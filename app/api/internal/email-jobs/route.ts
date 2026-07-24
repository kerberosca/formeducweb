import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { processDueEmailJobs } from "@/lib/email-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const configuredSecret = (
    process.env.EMAIL_JOB_SECRET ||
    process.env.CRON_SECRET ||
    ""
  ).trim();
  const authorization = request.headers.get("authorization") || "";
  const receivedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!configuredSecret || !receivedSecret) return false;
  const expected = Buffer.from(configuredSecret);
  const received = Buffer.from(receivedSecret);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    return NextResponse.json(await processDueEmailJobs());
  } catch (error) {
    console.error("Email jobs processor error", error);
    return NextResponse.json(
      { error: "Impossible de traiter les courriels planifiés." },
      { status: 500 }
    );
  }
}

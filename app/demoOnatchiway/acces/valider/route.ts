import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyDemoOnatchiwayPassword } from "@/lib/demo-onatchiway-password";
import {
  createDemoOnatchiwaySessionToken,
  DEMO_ONATCHIWAY_COOKIE_NAME,
  DEMO_ONATCHIWAY_PATH,
  DEMO_ONATCHIWAY_SESSION_SECONDS
} from "@/lib/demo-onatchiway-session";

const INVALID_ACCESS_PATH = `${DEMO_ONATCHIWAY_PATH}/acces?erreur=1`;

function redirect(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url), 303);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password");
  const sessionSecret = process.env.DEMO_ONATCHIWAY_SESSION_SECRET ?? "";
  const isValid =
    typeof password === "string" &&
    password.length <= 256 &&
    sessionSecret.length > 0 &&
    (await verifyDemoOnatchiwayPassword(password));

  if (!isValid) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return redirect(request, INVALID_ACCESS_PATH);
  }

  const response = redirect(request, DEMO_ONATCHIWAY_PATH);
  response.cookies.set({
    name: DEMO_ONATCHIWAY_COOKIE_NAME,
    value: createDemoOnatchiwaySessionToken(sessionSecret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: DEMO_ONATCHIWAY_PATH,
    maxAge: DEMO_ONATCHIWAY_SESSION_SECONDS
  });

  return response;
}

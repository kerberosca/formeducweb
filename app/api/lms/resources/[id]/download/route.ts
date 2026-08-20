import { NextResponse } from "next/server";

import { getAuthenticatedLmsUser } from "@/lib/lms/authenticated-user";
import { lmsErrorResponse } from "@/lib/lms/errors";
import {
  contentDispositionAttachment,
  getResourceForUser
} from "@/lib/lms/resources";

export const runtime = "nodejs";

type ResourceRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: ResourceRouteContext) {
  try {
    const user = await getAuthenticatedLmsUser();
    const { id } = await context.params;
    const resource = await getResourceForUser(user.id, id);

    if (resource.kind === "redirect") {
      return NextResponse.redirect(resource.url, {
        status: 303,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "Referrer-Policy": "no-referrer",
          "X-Robots-Tag": "noindex, nofollow",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    return new NextResponse(new Uint8Array(resource.data), {
      headers: {
        "Content-Type": resource.mimeType,
        "Content-Length": String(resource.sizeBytes),
        "Content-Disposition": contentDispositionAttachment(resource.fileName),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

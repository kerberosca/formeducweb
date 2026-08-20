import { NextResponse } from "next/server";

import { getAuthenticatedLmsUser } from "@/lib/lms/authenticated-user";
import { renderCertificatePdfForUser } from "@/lib/lms/certificates";
import { lmsErrorResponse } from "@/lib/lms/errors";

export const runtime = "nodejs";

type CertificateRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: CertificateRouteContext) {
  try {
    const user = await getAuthenticatedLmsUser();
    const { id } = await context.params;
    const { certificate, buffer } = await renderCertificatePdfForUser(
      user.id,
      id
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificat-${certificate.id}.pdf"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    return lmsErrorResponse(error);
  }
}

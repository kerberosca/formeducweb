import { NextResponse } from "next/server";

import { sendContactEmail } from "@/lib/email";
import { contactFormSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = contactFormSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Le formulaire de contact est invalide.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    await sendContactEmail(parsed.data);

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    console.error("Contact route error", error);
    return NextResponse.json(
      {
        error: "Impossible d’envoyer votre message pour le moment."
      },
      { status: 500 }
    );
  }
}


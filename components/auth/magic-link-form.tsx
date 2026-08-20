"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GENERIC_CONFIRMATION =
  "Si cette adresse peut être utilisée, un lien de connexion vient d’être préparé. Consultez votre boîte de réception.";

export function MagicLinkForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await signIn("email", {
        email,
        redirect: false,
        redirectTo: callbackUrl
      });
    } catch {
      // The public response intentionally stays identical. Configuration and
      // delivery failures are recorded server-side without exposing accounts.
    } finally {
      setConfirmation(GENERIC_CONFIRMATION);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="connexion-email">Adresse courriel</Label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="connexion-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-11"
            placeholder="vous@entreprise.ca"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Send aria-hidden="true" className="mr-2 size-4" />
        {isSubmitting
          ? "Préparation du lien…"
          : "Recevoir mon lien de connexion"}
      </Button>

      {confirmation ? (
        <div
          className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-foreground"
          role="status"
          aria-live="polite"
        >
          {confirmation}
        </div>
      ) : null}
    </form>
  );
}

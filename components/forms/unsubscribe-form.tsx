"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function UnsubscribeForm({ token }: { token: string }) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const unsubscribe = async () => {
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Le désabonnement a échoué.");
      }
      setStatus("success");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Le désabonnement a échoué."
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="space-y-5" aria-live="polite">
        <p className="text-lg leading-8 text-muted-foreground">
          Votre désabonnement est confirmé. Les envois commerciaux planifiés ont
          été annulés immédiatement.
        </p>
        <Button asChild variant="secondary">
          <Link href="/">Retour à l’accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8 text-muted-foreground">
        Confirmez pour ne plus recevoir de communications commerciales de
        ForméducWeb. Les messages transactionnels que vous demandez, comme un
        reçu ou un lien d’accès, pourront toujours être envoyés.
      </p>
      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        onClick={unsubscribe}
        disabled={status === "submitting" || !token}
      >
        {status === "submitting"
          ? "Confirmation…"
          : "Confirmer mon désabonnement"}
      </Button>
    </div>
  );
}

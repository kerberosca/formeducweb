"use client";

import { useState } from "react";
import { LoaderCircle, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CourseCheckoutButton({ courseSlug }: { courseSlug: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/lms/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug })
      });
      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Le paiement ne peut pas être ouvert.");
      }
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Le paiement ne peut pas être ouvert."
      );
      setPending(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={checkout}
      >
        {pending ? (
          <LoaderCircle
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {pending ? "Ouverture du paiement…" : "Acheter la formation"}
      </Button>
      {error ? (
        <p className="mt-3 text-sm leading-6 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { trackMetaInitiateCheckout } from "@/lib/meta-pixel";

type UnlockReportButtonProps = {
  assessmentId?: string;
  accessToken?: string;
  label?: string;
  variant?: "default" | "secondary" | "ghost";
  className?: string;
};

export function UnlockReportButton({
  assessmentId,
  accessToken,
  label = "Débloquer mon rapport complet (29$)",
  variant = "default",
  className
}: UnlockReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assessmentId,
          accessToken
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; reportUrl?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Impossible de lancer le paiement pour le moment.");
      }

      const nextUrl = payload?.url || payload?.reportUrl;

      if (!nextUrl) {
        throw new Error("Aucun lien de paiement n’a été retourné.");
      }

      trackMetaInitiateCheckout({
        content_name: "Rapport complet Loi 25",
        content_category: "Diagnostic Loi 25",
        num_items: 1
      });
      window.location.assign(nextUrl);
    } catch (error) {
      console.error("Stripe checkout error", error);
      toast.error(error instanceof Error ? error.message : "Impossible de lancer le paiement pour le moment.");
      setIsLoading(false);
    }
  };

  return (
    <Button type="button" onClick={handleClick} disabled={isLoading} variant={variant} className={className}>
      <CreditCard className="mr-2 h-4 w-4" />
      {isLoading ? "Redirection vers le paiement..." : label}
    </Button>
  );
}

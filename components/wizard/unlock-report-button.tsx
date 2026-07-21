"use client";

import { type FormEvent, useId, useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { AssessmentType } from "@/lib/diagnostics";

type UnlockReportButtonProps = {
  assessmentType?: AssessmentType;
  assessmentId?: string;
  accessToken?: string;
  profileComplete?: boolean;
  onProfileSaved?: (contactName: string, companyName: string) => void;
  label?: string;
  variant?: "default" | "secondary" | "ghost";
  className?: string;
};

export function UnlockReportButton({
  assessmentType = "loi25",
  assessmentId,
  accessToken,
  profileComplete = true,
  onProfileSaved,
  label = "Débloquer mon rapport complet (29 $)",
  variant = "default",
  className
}: UnlockReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const fieldId = useId();
  const contactNameId = `${fieldId}-contact-name`;
  const companyNameId = `${fieldId}-company-name`;
  const profileErrorId = `${fieldId}-profile-error`;
  const hasProfile = profileComplete || profileSaved;

  const startCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, accessToken })
      });

      const payload = (await response.json().catch(() => null)) as {
        url?: string;
        reportUrl?: string;
        error?: string;
        code?: string;
      } | null;

      if (response.status === 409 && payload?.code === "PROFILE_REQUIRED") {
        setShowProfile(true);
        throw new Error(payload.error);
      }
      if (!response.ok)
        throw new Error(
          payload?.error || "Impossible de lancer le paiement pour le moment."
        );

      const nextUrl = payload?.url || payload?.reportUrl;
      if (!nextUrl) throw new Error("Aucun lien de paiement n’a été retourné.");

      trackAnalyticsEvent("checkout_started", {
        diagnostic_type: assessmentType
      });
      window.location.assign(nextUrl);
    } catch (error) {
      console.error("Stripe checkout error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de lancer le paiement pour le moment."
      );
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!hasProfile) {
      setShowProfile(true);
      return;
    }
    void startCheckout();
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);

    if (
      !accessToken ||
      contactName.trim().length < 2 ||
      companyName.trim().length < 2
    ) {
      setProfileError(
        "Veuillez entrer votre nom et celui de votre entreprise."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/assessment/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, contactName, companyName })
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          payload?.error || "Impossible d’enregistrer ces renseignements."
        );

      setProfileSaved(true);
      setShowProfile(false);
      onProfileSaved?.(contactName.trim(), companyName.trim());
      toast.success(
        "Renseignements enregistrés. Ouverture du paiement sécurisé…"
      );
      await startCheckout();
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer ces renseignements."
      );
      setIsLoading(false);
    }
  };

  if (showProfile && !hasProfile) {
    return (
      <form
        className="w-full space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4"
        onSubmit={handleProfileSubmit}
      >
        <div>
          <p className="font-medium text-foreground">
            Personnaliser le rapport complet
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Ces renseignements servent uniquement à préparer le PDF et les
            gabarits pour votre organisation.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={contactNameId}>Nom</Label>
          <Input
            id={contactNameId}
            autoComplete="name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            aria-invalid={Boolean(profileError)}
            aria-describedby={profileError ? profileErrorId : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={companyNameId}>Entreprise</Label>
          <Input
            id={companyNameId}
            autoComplete="organization"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            aria-invalid={Boolean(profileError)}
            aria-describedby={profileError ? profileErrorId : undefined}
          />
        </div>
        {profileError ? (
          <p
            id={profileErrorId}
            role="alert"
            className="text-sm text-destructive"
          >
            {profileError}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={isLoading}>
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? "Enregistrement…" : "Continuer vers le paiement"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowProfile(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      className={className}
    >
      <CreditCard className="mr-2 h-4 w-4" />
      {isLoading ? "Redirection vers le paiement…" : label}
    </Button>
  );
}

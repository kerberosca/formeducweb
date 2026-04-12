"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  COOKIE_CONSENT_EVENT,
  clearCookieConsent,
  getTrackerConfig,
  hasOptionalTrackersConfigured,
  parseCookieConsent,
  readCookieConsentRaw,
  saveCookieConsent
} from "@/lib/cookie-consent";

type ConsentSnapshot = string | null | "server";

type DraftConsentState = {
  analytics: boolean;
  marketing: boolean;
};

function subscribeConsent(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", onChange);
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange as EventListener);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange as EventListener);
  };
}

function getConsentSnapshot(): ConsentSnapshot {
  return readCookieConsentRaw();
}

function getConsentServerSnapshot(): ConsentSnapshot {
  return "server";
}

export function CookiePreferencesPanel() {
  const trackerConfig = useMemo(() => getTrackerConfig(), []);
  const hasAnalyticsTracker = Boolean(trackerConfig.gaMeasurementId);
  const hasMarketingTracker = Boolean(trackerConfig.metaPixelId || trackerConfig.googleAdsId);
  const trackerConfigured = useMemo(() => hasOptionalTrackersConfigured(), []);
  const consentSnapshot = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot);
  const consentState = useMemo(() => {
    if (consentSnapshot === "server") return null;
    return parseCookieConsent(consentSnapshot);
  }, [consentSnapshot]);

  const [draftConsent, setDraftConsent] = useState<DraftConsentState | null>(null);

  const resolvedAnalytics = hasAnalyticsTracker
    ? (draftConsent?.analytics ?? Boolean(consentState?.analytics))
    : false;
  const resolvedMarketing = hasMarketingTracker
    ? (draftConsent?.marketing ?? Boolean(consentState?.marketing))
    : false;

  if (!trackerConfigured) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <h2 className="font-heading text-2xl font-semibold">Preferences cookies</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Aucun tracker optionnel n&apos;est configure pour le moment. La banniere de consentement ne s&apos;affiche donc pas,
            et aucun cookie non essentiel n&apos;est charge.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = (analytics: boolean, marketing: boolean, message: string) => {
    saveCookieConsent({
      analytics: hasAnalyticsTracker ? analytics : false,
      marketing: hasMarketingTracker ? marketing : false
    });
    setDraftConsent(null);
    toast.success(message);
  };

  return (
    <Card id="preferences-cookies" className="border-primary/20">
      <CardContent className="space-y-5 p-8">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold">Preferences cookies</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Vous pouvez modifier vos choix de consentement ici a tout moment.
          </p>
          <Label className="block text-xs leading-6 text-muted-foreground">
            {consentState ? "Vos preferences sont actuellement enregistrees." : "Aucune preference enregistree pour le moment."}
          </Label>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 md:grid-cols-2">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={resolvedAnalytics}
              onCheckedChange={(checked) =>
                setDraftConsent((current) => ({
                  analytics: Boolean(checked),
                  marketing: current?.marketing ?? Boolean(consentState?.marketing)
                }))
              }
              disabled={!hasAnalyticsTracker}
              aria-label="Activer analytics"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Analytics</span>
              <span className="block text-xs leading-6 text-muted-foreground">
                {hasAnalyticsTracker ? "Mesure de frequentation (si configure)." : "Non configure sur cet environnement."}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <Checkbox
              checked={resolvedMarketing}
              onCheckedChange={(checked) =>
                setDraftConsent((current) => ({
                  analytics: current?.analytics ?? Boolean(consentState?.analytics),
                  marketing: Boolean(checked)
                }))
              }
              disabled={!hasMarketingTracker}
              aria-label="Activer marketing"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Marketing</span>
              <span className="block text-xs leading-6 text-muted-foreground">
                {hasMarketingTracker
                  ? "Google Ads et pixels publicitaires (si configures)."
                  : "Non configure sur cet environnement."}
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button type="button" variant="secondary" onClick={() => handleSave(true, true, "Preferences enregistrees (acceptation).") }>
            Tout accepter
          </Button>

          <Button type="button" variant="ghost" onClick={() => handleSave(false, false, "Preferences enregistrees (refus).") }>
            Tout refuser
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(resolvedAnalytics, resolvedMarketing, "Preferences cookies enregistrees.")}
          >
            Enregistrer mes choix
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              clearCookieConsent();
              setDraftConsent(null);
              toast.success("Preferences reinitialisees. La banniere sera de nouveau affichee.");
            }}
          >
            Reinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

  const [allowAnalytics, setAllowAnalytics] = useState(false);
  const [allowMarketing, setAllowMarketing] = useState(false);

  useEffect(() => {
    setAllowAnalytics(Boolean(consentState?.analytics));
    setAllowMarketing(Boolean(consentState?.marketing));
  }, [consentState]);

  if (!trackerConfigured) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <h2 className="font-heading text-2xl font-semibold">Préférences cookies</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Aucun tracker optionnel n&apos;est configuré pour le moment. La bannière de consentement ne s&apos;affiche donc
            pas, et aucun cookie non essentiel n&apos;est chargé.
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
    toast.success(message);
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="space-y-5 p-8">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold">Préférences cookies</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Vous pouvez modifier vos choix de consentement ici à tout moment.
          </p>
          <Label className="block text-xs leading-6 text-muted-foreground">
            {consentState ? "Vos préférences sont actuellement enregistrées." : "Aucune préférence enregistrée pour le moment."}
          </Label>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 md:grid-cols-2">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={hasAnalyticsTracker ? allowAnalytics : false}
              onCheckedChange={(checked) => setAllowAnalytics(Boolean(checked))}
              disabled={!hasAnalyticsTracker}
              aria-label="Activer analytics"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Analytics</span>
              <span className="block text-xs leading-6 text-muted-foreground">
                {hasAnalyticsTracker ? "Mesure de fréquentation (si configuré)." : "Non configuré sur cet environnement."}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <Checkbox
              checked={hasMarketingTracker ? allowMarketing : false}
              onCheckedChange={(checked) => setAllowMarketing(Boolean(checked))}
              disabled={!hasMarketingTracker}
              aria-label="Activer marketing"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Marketing</span>
              <span className="block text-xs leading-6 text-muted-foreground">
                {hasMarketingTracker ? "Pixels publicitaires (si configuré)." : "Non configuré sur cet environnement."}
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setAllowAnalytics(hasAnalyticsTracker);
              setAllowMarketing(hasMarketingTracker);
              handleSave(true, true, "Préférences enregistrées (acceptation).");
            }}
          >
            Tout accepter
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setAllowAnalytics(false);
              setAllowMarketing(false);
              handleSave(false, false, "Préférences enregistrées (refus).");
            }}
          >
            Tout refuser
          </Button>

          <Button type="button" onClick={() => handleSave(allowAnalytics, allowMarketing, "Préférences cookies enregistrées.")}>
            Enregistrer mes choix
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              clearCookieConsent();
              toast.success("Préférences réinitialisées. La bannière sera de nouveau affichée.");
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

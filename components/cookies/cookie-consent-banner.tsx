"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  COOKIE_CONSENT_EVENT,
  getTrackerConfig,
  hasOptionalTrackersConfigured,
  parseCookieConsent,
  readCookieConsentRaw,
  saveCookieConsent,
  type CookieConsentState
} from "@/lib/cookie-consent";

type ConsentMode = "simple" | "customize";
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

export function CookieConsentBanner() {
  const trackerConfig = useMemo(() => getTrackerConfig(), []);
  const hasAnalyticsTracker = Boolean(trackerConfig.gaMeasurementId);
  const hasMarketingTracker = Boolean(trackerConfig.metaPixelId || trackerConfig.googleAdsId);
  const trackerConfigured = useMemo(() => hasOptionalTrackersConfigured(), []);
  const consentSnapshot = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot);
  const consentState = useMemo(() => {
    if (consentSnapshot === "server") return null;
    return parseCookieConsent(consentSnapshot);
  }, [consentSnapshot]);

  const [mode, setMode] = useState<ConsentMode>("simple");
  const [allowAnalytics, setAllowAnalytics] = useState(false);
  const [allowMarketing, setAllowMarketing] = useState(false);

  const isVisible = trackerConfigured && consentState === null;

  if (!isVisible) {
    return null;
  }

  const handleSave = (next: Pick<CookieConsentState, "analytics" | "marketing">, message: string) => {
    saveCookieConsent(next);
    toast.success(message);
  };

  return (
    <section className="fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6">
      <Card className="mx-auto w-full max-w-4xl border-primary/20 bg-background/95 shadow-2xl backdrop-blur">
        <CardContent className="space-y-4 p-5 md:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">Cookies et consentement</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Nous utilisons des cookies techniques nécessaires. Les cookies non essentiels sont bloqués tant que vous
              n’avez pas choisi. Consultez la{" "}
              <Link href="/politique-cookies" className="underline underline-offset-4">
                politique cookies
              </Link>
              .
            </p>
          </div>

          {mode === "customize" ? (
            <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 md:grid-cols-2">
              {hasAnalyticsTracker ? (
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={allowAnalytics}
                    onCheckedChange={(checked) => setAllowAnalytics(Boolean(checked))}
                    aria-label="Activer analytics"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">Analytics</span>
                    <span className="block text-xs leading-6 text-muted-foreground">
                      Mesure de fréquentation (si configuré).
                    </span>
                  </span>
                </label>
              ) : null}

              {hasMarketingTracker ? (
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={allowMarketing}
                    onCheckedChange={(checked) => setAllowMarketing(Boolean(checked))}
                    aria-label="Activer marketing"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">Marketing</span>
                    <span className="block text-xs leading-6 text-muted-foreground">
                      Pixels publicitaires (si configuré).
                    </span>
                  </span>
                </label>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {mode === "simple" ? (
              <Button type="button" variant="secondary" onClick={() => setMode("customize")}>
                Personnaliser
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setMode("simple")}>
                Retour
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSave({ analytics: false, marketing: false }, "Préférences enregistrées (refus).")}
            >
              Refuser
            </Button>

            {mode === "customize" ? (
              <Button
                type="button"
                onClick={() =>
                  handleSave(
                    {
                      analytics: hasAnalyticsTracker ? allowAnalytics : false,
                      marketing: hasMarketingTracker ? allowMarketing : false
                    },
                    "Préférences cookies enregistrées."
                  )
                }
              >
                Enregistrer mes choix
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() =>
                  handleSave(
                    { analytics: hasAnalyticsTracker, marketing: hasMarketingTracker },
                    "Préférences enregistrées (acceptation)."
                  )
                }
              >
                Accepter
              </Button>
            )}
          </div>
          <Label className="block text-xs leading-6 text-muted-foreground">
            Vous pourrez ajuster ces choix plus tard via la page Politique cookies.
          </Label>
        </CardContent>
      </Card>
    </section>
  );
}

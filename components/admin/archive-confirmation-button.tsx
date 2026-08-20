"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Archive } from "lucide-react";

import { Button } from "@/components/ui/button";

type ArchiveConfirmationButtonProps = {
  buttonLabel: string;
  confirmationLabel: string;
};

export function ArchiveConfirmationButton({
  buttonLabel,
  confirmationLabel
}: ArchiveConfirmationButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const promptId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const restoreTriggerFocus = useRef(false);

  useEffect(() => {
    if (confirming) {
      confirmRef.current?.focus();
      return;
    }

    if (restoreTriggerFocus.current) {
      restoreTriggerFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [confirming]);

  if (!confirming) {
    return (
      <Button
        ref={triggerRef}
        type="button"
        size="sm"
        variant="secondary"
        aria-expanded="false"
        onClick={() => setConfirming(true)}
      >
        <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
        {buttonLabel}
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`Confirmer l'archivage : ${confirmationLabel}`}
      aria-describedby={promptId}
      aria-live="polite"
      className="rounded-xl border border-orange-200 bg-orange-50 p-3"
    >
      <p id={promptId} className="text-xs leading-5 text-orange-950">
        Archiver {confirmationLabel}? Le contenu sera retiré des parcours sans
        être supprimé.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          ref={confirmRef}
          type="submit"
          size="sm"
          className="bg-orange-700 text-white hover:bg-orange-800"
        >
          Confirmer l'archivage
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            restoreTriggerFocus.current = true;
            setConfirming(false);
          }}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}

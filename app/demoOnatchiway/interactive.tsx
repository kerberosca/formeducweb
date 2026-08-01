"use client";

import { useEffect, useState } from "react";

type TicketButtonProps = {
  compact?: boolean;
  salesClose: string;
  ticketingUrl: string;
};

function getCountdown(deadline: string, now: Date) {
  const remaining = Math.max(0, Date.parse(deadline) - now.getTime());
  const totalSeconds = Math.floor(remaining / 1_000);

  return {
    closed: remaining <= 0,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60
  };
}

function getTicketAction(ticketingUrl: string, deadline: string, now: Date) {
  if (getCountdown(deadline, now).closed) return "closed" as const;
  if (!ticketingUrl.trim()) return "unavailable" as const;
  return "active" as const;
}

export function TicketButton({
  compact = false,
  salesClose,
  ticketingUrl
}: TicketButtonProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(new Date()), 0);
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const state = now
    ? getTicketAction(ticketingUrl, salesClose, now)
    : ticketingUrl
      ? "pending"
      : "unavailable";

  const label =
    state === "closed"
      ? "Ventes terminées"
      : state === "active"
        ? compact
          ? "Acheter"
          : "Acheter mes billets"
        : state === "pending"
          ? "Ouverture..."
          : "Billetterie à venir";

  if (state === "active") {
    return (
      <a
        className={`ticket-button${compact ? "ticket-button--compact" : ""}`}
        href={ticketingUrl}
        target="_blank"
        rel="noreferrer"
      >
        {label}
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <button
      className={`ticket-button ticket-button--disabled${compact ? "ticket-button--compact" : ""}`}
      type="button"
      disabled
    >
      {label}
    </button>
  );
}

export function Countdown({ salesClose }: { salesClose: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(new Date()), 0);
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  if (!now) {
    return (
      <div className="countdown" aria-label="Chargement du compte à rebours">
        {[
          ["--", "jours"],
          ["--", "heures"],
          ["--", "minutes"],
          ["--", "secondes"]
        ].map(([value, label]) => (
          <div className="countdown__unit" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const countdown = getCountdown(salesClose, now);

  if (countdown.closed) {
    return (
      <div className="countdown countdown--closed" role="status">
        Les ventes sont maintenant terminées.
      </div>
    );
  }

  return (
    <div
      className="countdown"
      aria-label="Temps restant avant la fin des ventes"
    >
      {[
        [countdown.days, "jours"],
        [countdown.hours, "heures"],
        [countdown.minutes, "minutes"],
        [countdown.seconds, "secondes"]
      ].map(([value, label]) => (
        <div className="countdown__unit" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

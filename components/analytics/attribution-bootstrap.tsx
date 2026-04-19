"use client";

import { useEffect } from "react";

import { ensureFirstTouchAttribution } from "@/lib/attribution";

export function AttributionBootstrap() {
  useEffect(() => {
    ensureFirstTouchAttribution();
  }, []);

  return null;
}

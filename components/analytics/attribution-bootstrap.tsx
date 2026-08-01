"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ensureFirstTouchAttribution } from "@/lib/attribution";
import { isHostedDemoPath } from "@/lib/hosted-demo-path";

export function AttributionBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    if (isHostedDemoPath(pathname)) return;
    ensureFirstTouchAttribution();
  }, [pathname]);

  return null;
}

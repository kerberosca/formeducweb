"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PendingPaymentRefresh() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 10) window.clearInterval(timer);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [router]);

  return null;
}

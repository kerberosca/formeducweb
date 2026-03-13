"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-2xl border border-border",
          title: "font-semibold",
          description: "text-sm"
        }
      }}
    />
  );
}

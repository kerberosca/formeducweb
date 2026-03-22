import type { Metadata } from "next";

import { PrintReportPage } from "@/components/wizard/print-report-page";

export const metadata: Metadata = {
  title: "Impression du rapport Loi 25",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function WizardPrintPage() {
  return <PrintReportPage />;
}

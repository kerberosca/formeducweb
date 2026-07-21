import type { Metadata } from "next";

import { DiagnosticReportAccess } from "@/components/wizard/report-access";

type ReportAccessPageProps = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ cancel?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default async function AiReportAccessPage({
  params,
  searchParams
}: ReportAccessPageProps) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <DiagnosticReportAccess
      token={token}
      cancel={resolvedSearchParams?.cancel}
      expectedType="ai"
    />
  );
}

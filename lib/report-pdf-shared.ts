import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";

export function filenameFromCompany(companyName: string, assessmentType: AssessmentType = "loi25") {
  const slug = companyName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const date = new Date().toISOString().slice(0, 10);
  return `${getDiagnosticConfig(assessmentType).filePrefix}-${slug || "entreprise"}-${date}.pdf`;
}

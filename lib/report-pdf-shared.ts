export function filenameFromCompany(companyName: string) {
  const slug = companyName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const date = new Date().toISOString().slice(0, 10);
  return `rapport-loi25-${slug || "entreprise"}-${date}.pdf`;
}

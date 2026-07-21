export function areExternalServicesDisabled() {
  const value = process.env.DISABLE_EXTERNAL_SERVICES?.trim().toLowerCase();
  return value === "1" || value === "true";
}

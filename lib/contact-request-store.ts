import { db } from "@/lib/db";
import { mapAttributionToDb } from "@/lib/attribution-server";
import type { ContactFormInput } from "@/lib/schemas";

export async function createContactRequestRecord(payload: ContactFormInput) {
  const attribution = mapAttributionToDb(payload.attribution);

  return db.contactRequest.create({
    data: {
      name: payload.name,
      company: payload.company,
      email: payload.email,
      phone: payload.phone || null,
      reason: payload.reason,
      message: payload.message,
      consentMarketing: payload.consentMarketing ?? false,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      utmContent: attribution.utmContent,
      utmTerm: attribution.utmTerm,
      landingPath: attribution.landingPath,
      referrerHost: attribution.referrerHost,
      firstSeenAt: attribution.firstSeenAt
    }
  });
}

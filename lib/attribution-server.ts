import type { AttributionInput } from "@/lib/schemas";

export type AttributionDbFields = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPath: string | null;
  referrerHost: string | null;
  firstSeenAt: Date | null;
};

function toNullableText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toNullableDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function mapAttributionToDb(attribution: AttributionInput | undefined): AttributionDbFields {
  return {
    utmSource: toNullableText(attribution?.utm_source),
    utmMedium: toNullableText(attribution?.utm_medium),
    utmCampaign: toNullableText(attribution?.utm_campaign),
    utmContent: toNullableText(attribution?.utm_content),
    utmTerm: toNullableText(attribution?.utm_term),
    landingPath: toNullableText(attribution?.landing_path),
    referrerHost: toNullableText(attribution?.referrer_host),
    firstSeenAt: toNullableDate(attribution?.first_seen_at)
  };
}

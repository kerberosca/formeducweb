import { z } from "zod";

import { contactReasons } from "@/lib/contact-options";
import { assessmentTypes } from "@/lib/diagnostics";

const optionalAttributionText = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).optional();

export const assessmentTypeSchema = z.enum(assessmentTypes);

export const attributionSchema = z.object({
  utm_source: optionalAttributionText(120),
  utm_medium: optionalAttributionText(120),
  utm_campaign: optionalAttributionText(180),
  utm_content: optionalAttributionText(180),
  utm_term: optionalAttributionText(180),
  landing_path: optionalAttributionText(500),
  referrer_host: optionalAttributionText(255),
  first_seen_at: z.string().datetime({ offset: true }).optional()
});

export const leadCaptureSchema = z.object({
  contactName: z.string().trim().max(120).optional().default(""),
  companyName: z.string().trim().max(160).optional().default(""),
  email: z
    .string()
    .email("Veuillez entrer un courriel valide.")
    .transform((value) => value.trim().toLowerCase()),
  phone: z.string().trim().optional().default(""),
  consentMarketing: z.boolean().default(false)
});

export const assessmentAnswersSchema = z.record(
  z.string(),
  z.string().optional()
);

export const assessmentPayloadSchema = z.object({
  assessmentType: assessmentTypeSchema.default("loi25"),
  email: leadCaptureSchema.shape.email,
  consentMarketing: z.boolean().default(false),
  entitlementToken: z.string().min(32).max(128).optional(),
  answers: assessmentAnswersSchema,
  attribution: attributionSchema.optional()
});

export const assessmentPreviewPayloadSchema = z.object({
  assessmentType: assessmentTypeSchema.default("loi25"),
  answers: assessmentAnswersSchema
});

export const assessmentProfileSchema = z.object({
  accessToken: z.string().min(16, "Token invalide."),
  contactName: z.string().trim().min(2, "Veuillez entrer votre nom.").max(120),
  companyName: z
    .string()
    .trim()
    .min(2, "Veuillez entrer le nom de votre entreprise.")
    .max(160)
});

export const checkoutSessionPayloadSchema = z
  .object({
    assessmentId: z.string().cuid().optional(),
    accessToken: z.string().min(16).optional(),
    productCode: z
      .enum([
        "loi25_kit",
        "cyber_kit",
        "ai_kit",
        "digital_hygiene_trio",
        "trio_upgrade"
      ])
      .optional()
  })
  .refine((value) => Boolean(value.assessmentId || value.accessToken), {
    message: "assessmentId ou accessToken est requis."
  });

export const checkoutSearchParamsSchema = z.object({
  session_id: z.string().min(1).optional(),
  source: z.string().optional()
});

export const tokenSearchParamSchema = z.object({
  token: z.string().min(16, "Token invalide.")
});

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Veuillez entrer votre nom.")
    .max(120, "Le nom est trop long."),
  company: z
    .string()
    .trim()
    .max(160, "Le nom de l’entreprise est trop long.")
    .optional()
    .default(""),
  email: z
    .string()
    .trim()
    .max(254, "Le courriel est trop long.")
    .email("Veuillez entrer un courriel valide.")
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(40, "Le numéro de téléphone est trop long.")
    .optional()
    .default(""),
  reason: z.enum(contactReasons, {
    errorMap: () => ({ message: "Veuillez sélectionner un motif valide." })
  }),
  message: z
    .string()
    .trim()
    .min(10, "Veuillez préciser votre besoin en quelques mots.")
    .max(4000, "Le message est trop long."),
  website: z.string().trim().max(200).optional().default(""),
  consentMarketing: z.boolean().default(false),
  attribution: attributionSchema.optional()
});

export const privacyRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Veuillez entrer votre nom.")
    .max(120, "Le nom est trop long."),
  email: z
    .string()
    .trim()
    .max(254, "Le courriel est trop long.")
    .email("Veuillez entrer un courriel valide.")
    .transform((value) => value.toLowerCase()),
  companyName: z.string().trim().max(160).optional().default(""),
  requestType: z.enum(
    ["access", "rectification", "deletion", "withdrawal", "question"],
    {
      errorMap: () => ({
        message: "Veuillez choisir un type de demande valide."
      })
    }
  ),
  message: z
    .string()
    .trim()
    .min(20, "Veuillez ajouter quelques détails pour traiter votre demande.")
    .max(4000, "Le message est trop long."),
  website: z.string().trim().max(200).optional().default("")
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
export type AttributionInput = z.infer<typeof attributionSchema>;
export type AssessmentTypeInput = z.infer<typeof assessmentTypeSchema>;
export type AssessmentPayloadInput = z.infer<typeof assessmentPayloadSchema>;
export type AssessmentPreviewPayloadInput = z.infer<
  typeof assessmentPreviewPayloadSchema
>;
export type AssessmentProfileInput = z.infer<typeof assessmentProfileSchema>;
export type CheckoutSessionPayloadInput = z.infer<
  typeof checkoutSessionPayloadSchema
>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type PrivacyRequestInput = z.infer<typeof privacyRequestSchema>;

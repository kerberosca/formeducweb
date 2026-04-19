import { z } from "zod";

const optionalAttributionText = (maxLength: number) => z.string().trim().min(1).max(maxLength).optional();

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
  contactName: z.string().min(2, "Veuillez entrer votre nom."),
  companyName: z.string().min(2, "Veuillez entrer le nom de votre entreprise."),
  email: z
    .string()
    .email("Veuillez entrer un courriel valide.")
    .transform((value) => value.trim().toLowerCase()),
  phone: z.string().optional().default(""),
  consentMarketing: z.boolean().default(false)
});

export const assessmentAnswersSchema = z.record(z.string(), z.string().optional());

export const assessmentPayloadSchema = z.object({
  leadCapture: leadCaptureSchema,
  answers: assessmentAnswersSchema,
  attribution: attributionSchema.optional()
});

export const checkoutSessionPayloadSchema = z
  .object({
    assessmentId: z.string().cuid().optional(),
    accessToken: z.string().min(16).optional()
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
  name: z.string().min(2, "Veuillez entrer votre nom."),
  company: z.string().min(2, "Veuillez entrer le nom de votre entreprise."),
  email: z
    .string()
    .email("Veuillez entrer un courriel valide.")
    .transform((value) => value.trim().toLowerCase()),
  phone: z.string().optional().default(""),
  reason: z.string().min(2, "Veuillez selectionner un motif."),
  message: z.string().min(10, "Veuillez preciser votre besoin en quelques mots."),
  consentMarketing: z.boolean().default(false),
  attribution: attributionSchema.optional()
});

export const privacyRequestSchema = z.object({
  fullName: z.string().min(2, "Veuillez entrer votre nom."),
  email: z
    .string()
    .email("Veuillez entrer un courriel valide.")
    .transform((value) => value.trim().toLowerCase()),
  companyName: z.string().optional().default(""),
  requestType: z.enum(["access", "rectification", "deletion", "withdrawal", "question"], {
    errorMap: () => ({ message: "Veuillez choisir un type de demande valide." })
  }),
  message: z.string().min(20, "Veuillez ajouter quelques details pour traiter votre demande.")
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
export type AttributionInput = z.infer<typeof attributionSchema>;
export type AssessmentPayloadInput = z.infer<typeof assessmentPayloadSchema>;
export type CheckoutSessionPayloadInput = z.infer<typeof checkoutSessionPayloadSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type PrivacyRequestInput = z.infer<typeof privacyRequestSchema>;

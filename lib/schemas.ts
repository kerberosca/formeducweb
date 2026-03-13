import { z } from "zod";

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
  answers: assessmentAnswersSchema
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Veuillez entrer votre nom."),
  company: z.string().min(2, "Veuillez entrer le nom de votre entreprise."),
  email: z
    .string()
    .email("Veuillez entrer un courriel valide.")
    .transform((value) => value.trim().toLowerCase()),
  phone: z.string().optional().default(""),
  reason: z.string().min(2, "Veuillez sélectionner un motif."),
  message: z.string().min(10, "Veuillez préciser votre besoin en quelques mots."),
  consentMarketing: z.boolean().default(false)
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
export type AssessmentPayloadInput = z.infer<typeof assessmentPayloadSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getFirstTouchAttribution } from "@/lib/attribution";
import { contactReasons } from "@/lib/content";
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas";

export function ContactForm({ defaultReason }: { defaultReason?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      reason:
        defaultReason && contactReasons.includes(defaultReason)
          ? defaultReason
          : contactReasons[0],
      message: "",
      consentMarketing: false
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          attribution: getFirstTouchAttribution()
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(
          payload.error || "Impossible d'envoyer votre message pour le moment."
        );
      }

      toast.success("Message envoyé. On vous revient rapidement.");
      form.reset();
      router.push("/merci?source=contact");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      setSubmissionError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parlons de votre projet</CardTitle>
        <CardDescription>
          Décrivez votre besoin et on vous répondra avec une prochaine étape
          réaliste.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                aria-invalid={Boolean(form.formState.errors.name)}
                aria-describedby={
                  form.formState.errors.name ? "name-error" : undefined
                }
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p
                  id="name-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                aria-invalid={Boolean(form.formState.errors.company)}
                aria-describedby={
                  form.formState.errors.company ? "company-error" : undefined
                }
                {...form.register("company")}
              />
              {form.formState.errors.company ? (
                <p
                  id="company-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {form.formState.errors.company.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Courriel</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                aria-describedby={
                  form.formState.errors.email ? "email-error" : undefined
                }
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p
                  id="email-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" {...form.register("phone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif principal</Label>
            <select
              id="reason"
              aria-invalid={Boolean(form.formState.errors.reason)}
              aria-describedby={
                form.formState.errors.reason ? "reason-error" : undefined
              }
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...form.register("reason")}
            >
              {contactReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {form.formState.errors.reason ? (
              <p
                id="reason-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {form.formState.errors.reason.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Votre besoin</Label>
            <Textarea
              id="message"
              aria-invalid={Boolean(form.formState.errors.message)}
              aria-describedby={
                form.formState.errors.message ? "message-error" : undefined
              }
              placeholder="Décrivez brièvement votre contexte, votre site actuel ou votre besoin d'accompagnement."
              {...form.register("message")}
            />
            {form.formState.errors.message ? (
              <p
                id="message-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {form.formState.errors.message.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4">
            <Controller
              control={form.control}
              name="consentMarketing"
              render={({ field }) => (
                <Checkbox
                  id="consentMarketing"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(Boolean(checked))
                  }
                  aria-label="Consentement marketing"
                />
              )}
            />
            <Label
              htmlFor="consentMarketing"
              className="leading-6 text-muted-foreground"
            >
              J’accepte de recevoir des communications de ForméducWeb. Mon
              consentement est optionnel et je peux me désabonner en tout temps.
            </Label>
          </div>

          {submissionError ? (
            <p
              role="alert"
              aria-live="assertive"
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {submissionError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-muted-foreground">
              Aucune promesse de conformité n’est faite ici. On parle de
              diagnostic, d’alignement et d’implantation. Consultez notre{" "}
              <Link
                href="/politique-confidentialite"
                className="underline underline-offset-4"
              >
                politique de confidentialité
              </Link>{" "}
              ou{" "}
              <Link
                href="/demande-confidentialite"
                className="underline underline-offset-4"
              >
                exercer vos droits
              </Link>
              .
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactReasons } from "@/lib/content";
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas";

export function ContactForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      reason: contactReasons[0],
      message: "",
      consentMarketing: false
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Impossible d’envoyer votre message pour le moment.");
      }

      toast.success("Message envoyé. On vous revient rapidement.");
      form.reset();
      router.push("/merci?source=contact");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parlons de votre projet</CardTitle>
        <CardDescription>
          Décrivez votre besoin et on vous répondra avec une prochaine étape réaliste.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" {...form.register("company")} />
              {form.formState.errors.company ? (
                <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Courriel</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
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
              <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Votre besoin</Label>
            <Textarea
              id="message"
              placeholder="Décrivez brièvement votre contexte, votre site actuel ou votre besoin d’accompagnement."
              {...form.register("message")}
            />
            {form.formState.errors.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4">
            <Controller
              control={form.control}
              name="consentMarketing"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  aria-label="Consentement marketing"
                />
              )}
            />
            <Label className="leading-6 text-muted-foreground">
              J’accepte de recevoir des communications de FormÉducWeb. Mon consentement est optionnel et je peux me
              désabonner en tout temps.
            </Label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-muted-foreground">
              Aucune promesse de conformité n’est faite ici. On parle de diagnostic, d’alignement et d’implantation.
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


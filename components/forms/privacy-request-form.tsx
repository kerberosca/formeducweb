"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { privacyRequestSchema, type PrivacyRequestInput } from "@/lib/schemas";

const requestTypes: Array<{ value: PrivacyRequestInput["requestType"]; label: string }> = [
  { value: "access", label: "Accès à mes renseignements" },
  { value: "rectification", label: "Correction d'information" },
  { value: "deletion", label: "Suppression (selon obligations applicables)" },
  { value: "withdrawal", label: "Retrait de consentement marketing" },
  { value: "question", label: "Question générale sur la confidentialité" }
];

export function PrivacyRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PrivacyRequestInput>({
    resolver: zodResolver(privacyRequestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      requestType: "access",
      message: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/privacy-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Impossible d'envoyer votre demande pour le moment.");
      }

      toast.success("Demande envoyée. Nous vous répondrons dès que possible.");
      form.reset({
        fullName: "",
        email: "",
        companyName: "",
        requestType: "access",
        message: ""
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demande de confidentialité</CardTitle>
        <CardDescription>
          Utilisez ce formulaire pour exercer vos droits ou poser une question sur vos renseignements personnels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" {...form.register("fullName")} />
              {form.formState.errors.fullName ? (
                <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Courriel</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Entreprise (optionnel)</Label>
            <Input id="companyName" {...form.register("companyName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestType">Type de demande</Label>
            <select
              id="requestType"
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...form.register("requestType")}
            >
              {requestTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {form.formState.errors.requestType ? (
              <p className="text-sm text-destructive">{form.formState.errors.requestType.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Détails de votre demande</Label>
            <Textarea
              id="message"
              placeholder="Expliquez votre besoin pour nous aider à traiter votre demande rapidement."
              {...form.register("message")}
            />
            {form.formState.errors.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-muted-foreground">
              Ce formulaire sert à la gestion des demandes de confidentialité. Une vérification d&apos;identité peut être
              demandée selon la nature de la requête.
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

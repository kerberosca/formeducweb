# FormÉducWeb

Site Next.js 14+ en TypeScript pour FormÉducWeb, avec landing FR-CA, pages services, pages légales et wizard d’auto-évaluation Loi 25 connectée aux artefacts fournis:

- `data/loi25_questions.fr-ca.json`
- `lib/scoring.ts`
- `lib/recommendations.ts`

Le projet est pensé pour un MVP déployable sur Vercel, sans base de données par défaut, avec impression HTML pour le PDF et une structure email prête à brancher via Resend.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- composants style shadcn/ui dans `components/ui`
- React Hook Form + Zod
- impression HTML pour téléchargement PDF
- API routes pour wizard et contact

## Démarrage

1. Installer les dépendances:

```bash
npm install
```

2. Créer votre environnement:

```bash
cp .env.example .env.local
```

3. Lancer en développement:

```bash
npm run dev
```

4. Vérifier avant déploiement:

```bash
npm run lint
npm run typecheck
npm run build
```

## Variables d’environnement

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BOOKING_URL=
ADMIN_EMAIL=bonjour@formeducweb.ca
CONTACT_TO_EMAIL=bonjour@formeducweb.ca
RESEND_API_KEY=
RESEND_FROM=FormÉducWeb <noreply@example.com>
```

### Email

- Sans clé `RESEND_API_KEY`, les envois tombent en mode MVP et sont loggés en console.
- Avec Resend configuré, le client reçoit son rapport et FormÉducWeb reçoit une notification lead.

## Déploiement Vercel

1. Créez un projet Vercel et importez le repo.
2. Ajoutez les variables d’environnement du fichier `.env.example`.
3. Gardez la commande de build par défaut:

```bash
npm run build
```

4. Déployez.

Le projet ne dépend d’aucune base de données pour le MVP. Vous pouvez donc déployer sans migration.

## Arborescence

```text
app/
  api/
    assessment/route.ts
    contact/route.ts
  a-propos/page.tsx
  conditions-utilisation/page.tsx
  contact/page.tsx
  loi-25/
    page.tsx
    wizard/page.tsx
  mentions-legales/page.tsx
  merci/page.tsx
  politique-confidentialite/page.tsx
  services/
    cybersecurite/page.tsx
    page.tsx
    seo/page.tsx
    site-web/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  forms/contact-form.tsx
  marketing/
  site-footer.tsx
  site-header.tsx
  ui/
  wizard/
data/
  loi25_questions.fr-ca.json
lib/
  content.ts
  email.ts
  recommendations.ts
  schemas.ts
  scoring.ts
  site.ts
  utils.ts
  wizard.ts
```

## Fonctionnement de la wizard

### Chargement

- Le JSON `data/loi25_questions.fr-ca.json` est chargé côté serveur via `getWizardData()`.
- Les sections deviennent les écrans de la wizard.
- Les réponses sont sauvegardées en `localStorage` pour reprise plus tard.

### Soumission

La soumission envoie:

```json
{
  "leadCapture": {
    "contactName": "Julie Martin",
    "companyName": "Atelier Boréal",
    "email": "julie@atelierboreal.ca",
    "phone": "514-555-0199",
    "consentMarketing": true
  },
  "answers": {
    "A1": "pme",
    "A2": "10_49",
    "A3": "services",
    "B1": "yes",
    "B2": "partial",
    "B3": "no",
    "B4": "some",
    "B5": "informal",
    "C1": "yes_old",
    "C2": "many",
    "C3": "partial",
    "C4": "yes",
    "C5": "basic",
    "D1": "some",
    "D2": "partial",
    "D3": "yes_not_tested",
    "D4": "sometimes",
    "D5": "no",
    "E1": "partial",
    "E2": "no",
    "E3": "no",
    "E4": "partial",
    "F1": "informal",
    "F2": "yes_old",
    "F3": "partial",
    "F4": "partial",
    "F5": "no"
  }
}
```

La route `POST /api/assessment`:

1. valide le payload avec Zod;
2. appelle `computeScore(wizard, answers)`;
3. appelle `generateReport(wizard, answers, scoreResult)`;
4. retourne `{ scoreResult, report, pdfUrl: null }`;
5. tente d’envoyer les emails si configurés.

### Exemple de rendu attendu

- score global: `58/100`
- niveau: `En progression`
- top gaps: politiques web, consentement/cookies, registre d’incidents, contrôle des accès, dossier de preuves
- plan 30 jours: cartographie, politique, MFA, sauvegardes, registre
- plan 90 jours: rôles d’accès, consentement, demandes liées aux données, fournisseurs, simulation d’incident

## Notes importantes

- Le JSON fourni contient 27 questions au total: 3 de profil (`A1` à `A3`) et 24 scorées (`B` à `F`).
- Le site n’installe aucun tracker par défaut.
- Aucun texte ne promet une entreprise “certifiée conforme” ou une “garantie de conformité”.


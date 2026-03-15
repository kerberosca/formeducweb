# ForméducWeb

Site Next.js App Router pour ForméducWeb avec wizard d'auto-evaluation Loi 25, modele freemium low-ticket, Stripe Checkout, rapport Lite/Full, PDF serveur et stockage Prisma.

## Artefacts obligatoires reutilises

- `data/loi25_questions.fr-ca.json`
- `lib/scoring.ts`
- `lib/recommendations.ts`

Ces trois fichiers restent au coeur du flux:

1. le wizard collecte les reponses;
2. `computeScore()` calcule le score et les sections;
3. `generateReport()` produit le rapport complet;
4. `toLiteReport()` filtre la version gratuite;
5. le rapport complet est debloque apres paiement Stripe.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- composants style shadcn/ui dans `components/ui`
- React Hook Form + Zod
- Prisma + SQLite en local
- Stripe Checkout + webhook Stripe
- `@react-pdf/renderer` pour le PDF complet
- email MVP via logs console, structure Resend prete

## Flux low-ticket

### Gratuit (Lite)

Apres soumission du wizard, l'utilisateur obtient:

- score global
- niveau
- 3 priorites max
- plan 30 jours (5 items)
- disclaimers

### Payant (Full)

Apres paiement Stripe, l'utilisateur obtient:

- acces a `/loi-25/rapport/[token]`
- PDF complet
- Top 5 detaille
- plan 30 + 90 jours
- checklist et gabarits
- page merci avec confirmation de paiement

## Demarrage local

1. Installer les dependances:

```bash
npm install
```

2. Copier les variables d'environnement:

```bash
cp .env.example .env
```

3. Initialiser la base SQLite locale:

```bash
npm run db:setup
npm run prisma:generate
```

4. Lancer le projet:

```bash
npm run dev
```

5. Verifier avant de deployer:

```bash
npm run lint
npm run typecheck
npm run build
```

## Variables d'environnement

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BOOKING_URL=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_META_PIXEL_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_CENTS=2900
STRIPE_CURRENCY=cad
REPORT_UNLOCK_PRICE_LABEL=29 $
DATABASE_URL=file:./prisma/dev.db
ASSESSMENT_RETENTION_UNPAID_DAYS=180
ASSESSMENT_RETENTION_PAID_DAYS=730
ADMIN_NOTIFICATION_EMAIL=
ADMIN_EMAIL=bonjour@formeducweb.ca
CONTACT_TO_EMAIL=bonjour@formeducweb.ca
RESEND_API_KEY=
RESEND_FROM=ForméducWeb <noreply@example.com>
```

### Cookies et trackers optionnels

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` active le chargement GA seulement apres consentement analytics.
- `NEXT_PUBLIC_META_PIXEL_ID` active le Pixel Meta seulement apres consentement marketing.
- Si ces variables sont vides, aucun tracker optionnel n'est charge et la banniere ne s'affiche pas.

## Prisma et base de donnees

Le projet utilise Prisma avec SQLite en local.

### Fichiers Prisma

- `prisma/schema.prisma`
- `prisma/migrations/20260314000000_add_low_ticket_assessment/migration.sql`
- `prisma.config.ts`
- `scripts/setup-sqlite.mjs`

### Notes locales

- `npm run db:setup` initialise `prisma/dev.db` a partir de la migration fournie.
- `npm run prisma:generate` fonctionne localement.
- Dans cet environnement Windows, `npx prisma migrate status` retourne encore un `Schema engine error` generique. Le projet reste exploitable localement avec la migration SQL fournie et `db:setup`.
- Si vous voulez passer a Postgres plus tard, Docker Desktop fera tres bien l'affaire, mais ce n'est pas requis pour le flux local actuel.

## Stripe

### Routes implementees

- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/webhook`
- `POST /api/privacy-request`
- `GET /merci?session_id=...`
- `GET /loi-25/rapport/[token]`
- `GET /demande-confidentialite`

### Tester Stripe en local

1. Ajouter vos cles Stripe dans `.env`.
2. Lancer l'application:

```bash
npm run dev
```

3. Dans un autre terminal, connecter Stripe CLI au webhook local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copier le secret de webhook fourni par Stripe CLI dans `STRIPE_WEBHOOK_SECRET`.
5. Faire le parcours:

```text
Wizard -> Resultat Lite -> Debloquer mon rapport complet -> Checkout -> Merci -> Rapport complet
```

### Comportement du webhook

Le webhook:

- lit le RAW body avec `await request.text()`
- verifie la signature Stripe
- marque l'assessment comme `paid`
- conserve `stripeSessionId` et `stripePaymentIntent`
- prepare l'envoi d'email de deblocage

## Downloads securises

Accessibles seulement si `paymentStatus = paid`:

- `GET /api/pdf?token=...`
- `GET /api/download/incident-registry?token=...`
- `GET /api/download/form-snippet?token=...`

## Renforcement conformite (operationnel)

- politique cookies dediee sur /politique-cookies

- en-tetes de securite HTTP globaux via `proxy.ts`
- no-store applique aux routes sensibles (rapport token et API sensibles)
- page rapport token marquee non indexable (`robots: noindex`)
- limitation anti-abus sur les endpoints contact, wizard et checkout
- expiration automatique des sauvegardes locales wizard (30 jours)
- parcours dedie de demandes de confidentialite (`/demande-confidentialite`)
- minimisation des logs email en mode fallback (pas de contenu detaille en console)

## Arborescence utile

```text
app/
  api/
    assessment/route.ts
    contact/route.ts
    privacy-request/route.ts
    download/
      form-snippet/route.ts
      incident-registry/route.ts
    pdf/route.ts
    stripe/
      create-checkout-session/route.ts
      webhook/route.ts
  loi-25/
    page.tsx
    rapport/
      [token]/page.tsx
    wizard/
      page.tsx
  merci/page.tsx
components/
  ui/
  wizard/
    assessment-wizard.tsx
    copy-snippet-button.tsx
    lite-result-view.tsx
    report-view.tsx
    unlock-report-button.tsx
data/
  loi25_questions.fr-ca.json
lib/
  assessment-store.ts
  assessment-types.ts
  bonus-assets.ts
  db.ts
  email.ts
  payments.ts
  recommendations.ts
  reportFilters.ts
  report-pdf.tsx
  scoring.ts
  schemas.ts
  stripe.ts
  text.ts
  wizard.ts
prisma/
  migrations/
  schema.prisma
scripts/
  setup-sqlite.mjs
```

## Exemple de payload wizard

```json
{
  "leadCapture": {
    "contactName": "Julie Martin",
    "companyName": "Atelier Boreal",
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

## Validation effectuee

Validation locale refaite apres integration low-ticket:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run prisma:generate
npm run db:setup
```

## Notes importantes

- Aucun tracker n'est installe par defaut.
- Le site ne promet jamais une entreprise "certifiee conforme" ou une "garantie de conformite".
- Le langage utilise reste: auto-evaluation, alignement, recommandations generales, priorisation, implantation.
- Le JSON fourni contient 27 questions au total: 3 de profil et 24 questions scorees.





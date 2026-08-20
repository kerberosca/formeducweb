# ForméducWeb

Portail d’entreprise et LMS intégré pour ForméducWeb. L’application réunit les
formations, les services numériques, la boutique historique de diagnostics, les
ressources pratiques et un espace apprenant administrable. Le travail courant
est local : aucun push ni déploiement de production n’est inclus.

La description détaillée des deux phases, des choix techniques et des limites se
trouve dans [docs/refonte-formeduc-web.md](docs/refonte-formeduc-web.md).

## Ce qui est disponible

- Un portail public avec accueil, formations, neuf pages de service, boutique,
  ressources, À propos, contact et réalisations.
- Une recherche globale sur `/recherche?q=` couvrant formations, services,
  produits, guides, ressources, réalisations et FAQ, sans distinction d’accent.
- Les trois Kits d’exécution 90 jours historiques à 29 $ CAD et le Trio Hygiène
  numérique à 59 $ CAD, avec leurs routes Stripe et leurs droits existants.
- Des comptes par lien courriel à usage unique, un tableau de bord apprenant et
  une administration intégrée.
- Un LMS alimenté par Prisma : inscriptions, reprise, progression, quiz,
  ressources protégées et certificats vérifiables.
- **Excel essentiel**, complet et achetable à 49 $ CAD, avec un classeur XLSX de
  pratique protégé.
- **Word — documents professionnels**, affiché à 39 $ CAD mais clairement marqué
  « en préparation » et non achetable.

## Stack

- Next.js `16.2.12`, App Router, React `19.2.7` et TypeScript.
- Tailwind CSS, composants réutilisables, React Hook Form et Zod.
- Prisma `7.8.0` avec SQLite.
- Auth.js / NextAuth `5.0.0-beta.32` et adaptateur Prisma `2.11.3`.
- Nodemailer vers Mailpit en local; Resend est réservé à une activation explicite
  hors environnement local.
- Stripe Checkout et webhook, avec un flux distinct pour les cours.
- Vitest, Testing Library, Playwright et axe pour la validation.

## Démarrage avec npm

Prérequis : Node.js 22 et npm.

```powershell
npm ci
Copy-Item .env.example .env
npm run prisma:generate
npm run db:setup
npm run dev
```

`npm run db:setup` exécute `prisma migrate deploy`, puis l’import transactionnel
et idempotent des six formations. Si une base historique utilise encore
`__local_migrations`, le script vérifie ses sept migrations et les marque d’abord
dans `_prisma_migrations` sans supprimer l’ancien registre. Le site est accessible sur
[http://localhost:3000](http://localhost:3000).

Le lien de connexion exige un serveur SMTP local sur `localhost:1025`. Le chemin
Docker Desktop ci-dessous démarre automatiquement Mailpit et constitue le moyen
recommandé de tester le parcours complet.

## Docker Desktop local

La surcouche `docker-compose.local.yml` conserve `docker-compose.yml` intact,
publie le site uniquement sur l'interface locale `127.0.0.1`, au port 3010,
utilise un volume SQLite local, démarre Mailpit et le travailleur de courriels,
puis force `DISABLE_EXTERNAL_SERVICES=1`.

Docker Desktop récent avec Docker Compose prenant en charge les balises
`!override` et `!reset` est requis.

```powershell
$env:LMS_BOOTSTRAP_ADMIN_EMAILS = "admin@formeducweb.local"
docker compose -f docker-compose.yml -f docker-compose.local.yml build formeducweb
docker compose -f docker-compose.yml -f docker-compose.local.yml --profile ops run --rm formeducweb_migrate
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
docker compose -f docker-compose.yml -f docker-compose.local.yml ps
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f formeducweb
```

Ouvrir ensuite :

- le portail : [http://localhost:3010](http://localhost:3010);
- Mailpit : [http://127.0.0.1:8025](http://127.0.0.1:8025).

Pour arrêter les conteneurs sans effacer la base :

```powershell
docker compose -f docker-compose.yml -f docker-compose.local.yml down
```

Ne pas ajouter `-v` sauf si la suppression du volume SQLite local est
volontaire et qu’une sauvegarde vérifiée existe.

## Routes principales

| Zone             | Routes                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portail          | `/`, `/formations`, `/services`, `/produits`, `/ressources`, `/a-propos`, `/contact`, `/realisations`, `/recherche?q=`                                     |
| Compte           | `/connexion`, `/mon-espace`, `/mon-espace/profil`                                                                                                          |
| Apprentissage    | `/formations/[slug]`, `/formations/[slug]/apprendre`                                                                                                       |
| Certificats      | `/certificats/verifier/[token]`                                                                                                                            |
| Administration   | `/administration`, `/administration/formations`, `/administration/inscriptions`, `/administration/utilisateurs`, `/administration/commandes`               |
| API LMS          | `/api/lms/enrollments`, `/api/lms/progress`, `/api/lms/quizzes`, `/api/lms/resources/[id]/download`, `/api/lms/certificates/[id]/pdf`, `/api/lms/checkout` |
| Auth et commerce | `/api/auth/[...nextauth]`, `/api/stripe/create-checkout-session`, `/api/stripe/webhook`                                                                    |

Toutes les formations exigent un compte pour ouvrir le lecteur, y compris les
formations gratuites. L’inscription gratuite est idempotente après connexion.

## Variables importantes

Les valeurs locales sûres se trouvent dans `.env.example`; la surcouche Docker
les impose sans lire `.env.production`.

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EMAIL_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=file:./prisma/dev.db

DISABLE_EXTERNAL_SERVICES=1
TRUSTED_PROXY_HEADERS=0
AUTH_URL=http://localhost:3000
AUTH_SECRET=local-only-formeducweb-auth-secret
AUTH_EMAIL_PROVIDER=nodemailer
AUTH_SMTP_HOST=localhost
AUTH_SMTP_PORT=1025
AUTH_SMTP_ALLOW_LOCAL=1
AUTH_SMTP_FROM=FormeducWeb <connexion@formeducweb.local>
LMS_BOOTSTRAP_ADMIN_EMAILS=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM=
EMAIL_JOB_SECRET=
EMAIL_JOB_INTERVAL_MS=300000
```

Ne jamais utiliser une clé de production en local. Lorsque
`DISABLE_EXTERNAL_SERVICES=1`, le SMTP explicitement local reste permis pour
Mailpit, mais Stripe, Resend et les traceurs externes demeurent neutralisés.
Conserver `TRUSTED_PROXY_HEADERS=0` pour un accès direct ou loopback. La valeur
`1` est réservée à un déploiement derrière un proxy de confiance configuré pour
écraser systématiquement `x-forwarded-for`, `x-real-ip` et `cf-connecting-ip`;
sinon, ces en-têtes sont contrôlables par le client et ne doivent pas servir aux
quotas ou journaux de sécurité.

## Données et migrations

- `prisma/schema.prisma` contient les modèles historiques, Auth.js, LMS et
  commerce de cours.
- La chaîne compte douze migrations : sept historiques et cinq complémentaires,
  dont `20260808050000_add_stripe_refund_tombstones` pour rendre les
  remboursements Stripe monotones.
- `npm run db:setup` applique les migrations standard et synchronise le catalogue
  LMS.
- `node scripts/ops/ensure-prisma-baseline.mjs` normalise de façon contrôlée une
  base historique qui possède les sept entrées `__local_migrations` attendues.
- `npm run prisma:migrate` est réservé à la création de migrations en
  développement.
- `npm run lms:seed` relance uniquement l’import LMS idempotent.
- Le classeur source d’Excel se trouve dans `data/lms-resources`; dans Docker, les
  ressources d’exécution sont stockées hors de `public`, sous
  `/data/lms-resources`.
- `node scripts/ops/verify-lms-migration.mjs <base.sqlite>` exécute les contrôles
  SQLite, exige toutes les tables Auth/LMS/commerce, conserve les comptages
  historiques et ajoute le comptage ainsi que l’empreinte des tombstones Stripe.

Sauvegarder le fichier SQLite ou le volume Docker avant toute migration. Les
sauvegardes de travail locales sont ignorées par Git dans `.local-backups/`.

## Validation

Avec le site Docker accessible sur le port 3010 :

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run format:check
npm run test:e2e
git diff --check
```

Playwright vise `http://127.0.0.1:3010` par défaut et exécute les scénarios du
portail à 320, 390, 768 et 1440 px avec des contrôles axe. Lors d’une première
installation, installer au besoin le navigateur choisi par la configuration
Playwright.

La recette LMS locale crée des comptes, inscriptions, progrès et certificats
dans le volume Docker. Elle est donc explicite et utilise uniquement Mailpit :

```powershell
$env:RUN_LMS_DOCKER_E2E = "1"
npx playwright test e2e/lms-docker.spec.ts
Remove-Item Env:RUN_LMS_DOCKER_E2E
```

## Sécurité et périmètre

- Le lien magique expire après 15 minutes, ne peut servir qu’une fois et les
  demandes sont limitées de façon persistante.
- Le rôle et l’état actif sont revérifiés en base; le dernier administrateur ne
  peut pas être supprimé ni rétrogradé.
- Les mutations administratives sont validées côté serveur et inscrites au
  journal d’audit.
- Les téléchargements LMS contrôlent l’inscription, le type, la taille et le
  chemin du fichier; aucun contenu LMS arbitraire en HTML n’est rendu.
- Les prix, la devise et le courriel d’un achat de cours viennent de la base et
  de la session, jamais du navigateur.
- Le remboursement révoque l’accès au cours tout en conservant la progression.

Cette branche ne doit pas être poussée ni déployée sans instruction explicite,
sauvegarde, clés de test, recette et plan de retour arrière.

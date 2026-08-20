# Refonte du portail ForméducWeb — phases 1 et 2 locales

Ce document décrit l’implémentation réunissant le portail d’entreprise et le LMS
administrable. Le périmètre est strictement local : le dépôt de production, les
clés réelles et le site public n’ont pas été modifiés, poussés ou déployés.

## 1. État final et périmètre

La phase 1 stabilise le portail public, Docker, la navigation, la recherche, le
contenu, les services et le SEO. La phase 2 ajoute les comptes par courriel, un
LMS alimenté par la base, la progression, les quiz, les certificats,
l’administration et le commerce direct des cours.

Les deux phases étendent l’application existante sans remplacer ses diagnostics.
Demo839 a depuis été séparé vers `https://escadron839.ca`. SQLite demeure la base
de données, les URL et prix des produits historiques restent inchangés, et aucun
appel Stripe ou Resend réel ne doit partir sans activation explicite avec des
clés de test.

Le travail est isolé sur les branches locales
`codex/refonte-formeduc-phase-1` et `codex/refonte-formeduc-lms`. La sauvegarde Git
logique antérieure à la phase 1 est
`refs/backups/formeducweb/pre-phase1-20260808`, au commit
`95f5852a1fb31357b1379ed8d6c9728f744b0a94`.

## 2. Stack et architecture

- Next.js `16.2.12` avec App Router, React `19.2.7` et TypeScript.
- Tailwind CSS, composants réutilisables, Lucide, React Hook Form et Zod.
- Prisma `7.8.0` et SQLite pour les fonctions historiques, Auth.js, le LMS et le
  commerce.
- Auth.js / NextAuth `5.0.0-beta.32`, adaptateur Prisma `2.11.3` et sessions en
  base.
- Nodemailer `8.0.11` vers Mailpit en local; Resend peut être sélectionné
  uniquement par une future configuration explicite.
- Stripe Checkout et webhook pour les diagnostics historiques et, séparément,
  le cours Excel.
- `@react-pdf/renderer` pour les rapports et certificats; Vitest, Testing Library,
  Playwright et axe pour les validations.
- Image Docker multiétage sous Node.js 22. Le processus Next.js non privilégié
  possède `.next` et `/data`, ce qui permet l’écriture du cache d’images et des
  ressources sans `EACCES`.

Prisma est la source d’exécution du catalogue, des fiches, du lecteur et de
l’administration LMS. `lib/training.ts` sert à l’import initial idempotent, mais
le parcours utilisateur ne retombe pas sur un catalogue statique lorsque la
base est indisponible.

## 3. Portail public et identité éditoriale

L’accueil est organisé en onze blocs : héro avec vraie recherche, quatre chemins
d’entrée, mission/vision/promesse, formations, services, sur-mesure, produits,
méthode, valeurs et ressources avec appel à l’action final.

L’identité éditoriale présente l’origine, les domaines d’expertise et huit
valeurs : Simplicité, Accessibilité, Autonomie, Transparence, Sécurité,
Pragmatisme, Éducation et Accompagnement humain. Le profil fondateur est nullable
et n’est jamais affiché partiellement; aucun nom, parcours, portrait ou résultat
non confirmé n’est inventé.

Les principales routes publiques sont `/`, `/formations`, `/services`,
`/produits`, `/ressources`, `/a-propos`, `/contact`, `/realisations` et
`/recherche?q=`. Les ressources pratiques couvrent notamment Excel/Word, le Web,
l’automatisation et les décisions numériques sans annoncer de faux téléchargement
ou de fausse capsule.

Le formulaire de contact partage une énumération validée côté client et serveur,
incluant Boutique en ligne et Cybersécurité générale. Les longueurs sont limitées
et un champ leurre réduit les soumissions automatisées.

## 4. Navigation, recherche, services et SEO

La navigation suit l’ordre Accueil, Formations, Services, Boutique, Ressources,
À propos, Contact, puis donne accès à Mon espace. Le sous-menu Services est
utilisable au clavier et sur mobile.

Neuf pages de service sont disponibles :

1. `/services/site-web`;
2. `/services/commerce-electronique`;
3. `/services/automatisation-ia`;
4. `/services/soutien-ti`;
5. `/services/formation-sur-mesure`;
6. `/services/seo`;
7. `/services/cybersecurite`;
8. `/services/soutien-industriel`;
9. `/services/solutions-entreprises`.

Huit entrées principales alimentent le sous-menu; la page SEO historique reste
accessible et indexable sans alourdir cette navigation.

`GET /recherche?q=` couvre les formations, services, produits, guides,
ressources, réalisations et FAQ. La normalisation ignore les accents et classe
les résultats selon le titre exact, le titre partiel, les mots-clés, puis la
description. La page de recherche est en `noindex, follow`.

Le SEO comprend le sitemap, les métadonnées, `SearchAction`, les fils d’Ariane
des services et les données `Product`/`Offer` des produits réellement achetables.
Les espaces privés et la recherche ne sont pas indexables.

## 5. Boutique historique préservée

Les trois produits existants conservent leurs codes, routes, prix, jetons et
parcours Stripe :

- Kit d’exécution 90 jours — Loi 25 : 29 $ CAD;
- Kit d’exécution 90 jours — Cybersécurité : 29 $ CAD;
- Kit d’exécution 90 jours — Intelligence artificielle : 29 $ CAD.

Le Trio Hygiène numérique reste à 59 $ CAD et l’amélioration historique vers le
Trio reste à 30 $ CAD. Les rapports à jeton, PDF, gabarits, échéances, commandes,
droits et événements Stripe existants n’ont pas été remplacés par le LMS.

`Order.kind` distingue maintenant `assessment` et `course`. `Entitlement` est
généralisé avec un type de ressource, une clé, un utilisateur et un cours, tandis
que les champs propres aux diagnostics sont facultatifs. Les droits historiques
sont migrés vers `resourceType=assessment` sans modifier leurs identifiants,
jetons, états ou échéances.

## 6. Authentification, comptes et courriels

Les routes principales sont `/connexion`, `/mon-espace`, `/mon-espace/profil` et
`/api/auth/[...nextauth]`. Tous les cours exigent un compte pour apprendre, y
compris les cours gratuits.

La connexion utilise un lien courriel à usage unique valable 15 minutes. Le
jeton et la session sont stockés en base; le jeton consommé ne peut pas être
réutilisé. La réponse à une demande est identique pour toute adresse afin de
réduire l’énumération, et `AuthRateLimit` limite durablement les demandes par
identité et origine. Les utilisateurs inactifs sont refusés et les redirections
externes sont filtrées.

Les rôles sont `learner` et `admin`. Les administrateurs initiaux ne sont amorcés
qu’à partir de `LMS_BOOTSTRAP_ADMIN_EMAILS`. Le rôle et l’état actif sont relus en
base pour les zones sensibles, et une transaction empêche la suppression ou la
rétrogradation du dernier administrateur.

Dans Docker local, Nodemailer remet les messages à `mailpit:1025`. Mailpit les
capture sur la machine et les affiche sur
`http://127.0.0.1:8025`; aucun courriel ne quitte l’ordinateur. Le travailleur
`EmailJob` traite aussi les courriels transactionnels de cours vers Mailpit. Une
configuration de production distincte pourra sélectionner Resend, avec clé et
expéditeur explicites.

## 7. Modèle LMS et contenu administrable

Les modèles `Course`, `CourseModule` et `Lesson` décrivent le catalogue et les
parcours. `CourseResource`, `Enrollment`, `LessonProgress`, les modèles de quiz,
`Certificate` et `AdminAuditLog` couvrent les ressources, l’apprentissage, les
évaluations, les attestations et la traçabilité.

Les leçons sont des blocs JSON versionnés et validés : titre, paragraphe, liste,
appel, étapes, image, lien et exercice. Aucun HTML arbitraire n’est accepté. Les
niveaux et formats sont contrôlés dans l’administration; la publication vérifie
la structure, les leçons obligatoires, les quiz et le prix positif d’une offre
payante.

Les ressources de fichiers sont conservées hors de `public`, sous
`/data/lms-resources` dans Docker, avec un maximum de 25 Mo. Les types admis sont
PDF, DOCX, XLSX, PPTX, CSV, TXT, PNG et JPEG. HTML, SVG, archives et exécutables
sont refusés. Le téléchargement passe toujours par l’API protégée et vérifie
l’inscription ainsi que le droit d’accès.

Après les premières inscriptions, les contenus obligatoires ne sont plus
supprimés de manière destructive. L’administration privilégie l’archivage, ou
une version suivante lorsque le contenu pédagogique doit changer.

## 8. Parcours apprenant, progression, quiz et certificat

Le catalogue et les fiches restent publics. `/formations/[slug]/apprendre`
redirige vers la connexion lorsque nécessaire. Après authentification,
l’inscription gratuite est idempotente; un cours payant exige un droit actif.

`/mon-espace` réunit les formations, le pourcentage, la reprise à la dernière
leçon, les achats et les certificats. `/mon-espace/profil` permet de gérer les
informations prévues du compte.

Une ancienne progression `localStorage` peut être importée une seule fois après
confirmation. Après cet import, la progression serveur est la source de vérité.
Elle est enregistrée par leçon, ne régresse pas accidentellement et reste
conservée si un droit payant est remboursé.

Les quiz appliquent un seuil et un nombre de tentatives sans transmettre les
bonnes réponses avant la soumission. La réussite du parcours produit un seul
certificat idempotent. Son PDF est réservé au propriétaire; la route publique
`/certificats/verifier/[token]` utilise un jeton opaque, affiche l’état de
validité et est non indexable. Un remboursement ou une révocation invalide le
certificat.

## 9. Administration intégrée

L’administration se trouve sous `/administration` avec les sections formations,
inscriptions, utilisateurs et commandes. Elle permet de créer et gérer les
cours, modules, leçons, blocs JSON, quiz, ressources, inscriptions, comptes et
commandes.

Chaque mutation passe par une action serveur validée avec Zod et revérifie le
rôle administrateur en base. Les relations entre cours, module, leçon et
ressource sont vérifiées pour empêcher l’écriture dans un autre périmètre. Les
liens externes de ressource sont validés et chaque modification importante crée
une entrée `AdminAuditLog`.

Un cours ne peut être publié que lorsque sa structure obligatoire est complète,
ses leçons et quiz sont valides et son prix est cohérent. Les cours archivés ne
peuvent plus recevoir de nouvelles ventes ou inscriptions, mais un apprenant
déjà autorisé peut terminer son parcours.

## 10. Formations et commerce LMS

L’import `scripts/lms/import-courses.mjs` charge six formations de façon
transactionnelle et idempotente. Il crée leurs modules, leçons et quiz sans
écraser le contenu versionné d’un cours qui possède déjà des inscriptions.

**Excel essentiel** est la première formation payante complète : 49 $ CAD, six
leçons substantielles, exercices et classeur
`excel-essentiel-pratique.xlsx`. Le fichier est livré comme ressource XLSX
protégée et n’est jamais servi directement depuis `public`.

**Word — documents professionnels** affiche 39 $ CAD avec l’état « en
préparation ». Il demeure non achetable tant que son contenu véritable n’est pas
terminé. Les autres formations gratuites exigent elles aussi une connexion avant
l’inscription.

`POST /api/lms/checkout` exige une session active et vérifiée. Le serveur lit le
prix et la devise uniquement en base et utilise le courriel du compte; les
valeurs commerciales envoyées par le navigateur sont ignorées. Si Stripe est
absent ou désactivé, la route répond 503. Le webhook choisit le traitement selon
`Order.kind`.

Après un paiement confirmé, droit, inscription et tâche de courriel sont créés
de façon idempotente. Un remboursement révoque le droit, bloque l’accès, révoque
le certificat et conserve la progression. Les achats historiques dont le
courriel correspond au compte vérifié peuvent être rattachés à ce compte.

## 11. Migrations, sauvegardes et compatibilité

La chaîne compte douze migrations : les sept migrations historiques sont
conservées et suivies dans `_prisma_migrations`, puis cinq migrations
complémentaires font évoluer Auth.js, le LMS et le commerce. La table
`__local_migrations` demeure temporairement comme historique local, mais
`prisma migrate deploy` est maintenant le mécanisme standard.

Cinq migrations complètent le schéma :

- `20260808010000_add_auth_lms` ajoute Auth.js et le LMS;
- `20260808020000_generalize_commerce_for_courses` reconstruit le commerce pour
  les cours;
- `20260808030000_normalize_generic_entitlements` normalise les droits
  génériques;
- `20260808040000_make_assessment_entitlement_fields_optional` rend nullable le
  dernier indicateur strictement réservé aux droits de diagnostic;
- `20260808050000_add_stripe_refund_tombstones` conserve un tombstone par
  PaymentIntent remboursé afin d’empêcher un achèvement Stripe tardif de
  réactiver une commande.

Les reconstructions SQLite sont exécutées sous transaction explicite avec les
clés étrangères contrôlées. Avant le déploiement des nouvelles migrations,
`scripts/ops/ensure-prisma-baseline.mjs` exige les sept entrées et tables
historiques attendues, puis complète `_prisma_migrations` de façon reprenable.
`npm run db:setup` lance ensuite `prisma migrate deploy`, puis l’import LMS. Le
conteneur de migration utilise
`scripts/ops/migrate-production.mjs`, qui applique aussi la migration terminale
retirant les tables Demo839 avant de synchroniser les cours.

Avant toute migration, sauvegarder `prisma/dev.db` ou le fichier du volume
Docker. Les copies de travail se trouvent sous `.local-backups/`, ignoré par Git.
Après migration, utiliser
`node scripts/ops/verify-lms-migration.mjs <base.sqlite>` pour exécuter
`PRAGMA quick_check`, `PRAGMA foreign_key_check`, exiger toutes les tables
Auth/LMS/commerce, conserver les comptages historiques et comparer les
empreintes des diagnostics, commandes, droits, événements Stripe, tombstones de
remboursement et tâches de courriel.

## 12. Docker Desktop local

`docker-compose.yml` reste la définition destinée au VPS. La surcouche
`docker-compose.local.yml` crée le projet `formeducweb-local`, publie Next.js
uniquement sur `127.0.0.1:3010`, remplace le fichier d'environnement de
production et force les valeurs locales sûres.

```powershell
$env:LMS_BOOTSTRAP_ADMIN_EMAILS = "admin@formeducweb.local"
docker compose -f docker-compose.yml -f docker-compose.local.yml build formeducweb
docker compose -f docker-compose.yml -f docker-compose.local.yml --profile ops run --rm formeducweb_migrate
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
docker compose -f docker-compose.yml -f docker-compose.local.yml ps
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f formeducweb
```

Le portail répond sur `http://localhost:3010`. Les liens magiques et les
courriels transactionnels sont visibles sur `http://127.0.0.1:8025`.

La surcouche impose `DISABLE_EXTERNAL_SERVICES=1`, des clés Stripe/Resend vides,
un SMTP interne `mailpit:1025` et un travailleur local chaque minute.
Mailpit est le seul transport explicitement autorisé malgré le verrou externe.

Pour arrêter sans supprimer la base :

```powershell
docker compose -f docker-compose.yml -f docker-compose.local.yml down
```

Ne jamais ajouter `-v` sans intention claire, chemin vérifié et sauvegarde du
volume.

## 13. Variables, commandes et validation

Variables principales :

- URL : `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`,
  `EMAIL_PUBLIC_BASE_URL`, `AUTH_URL`;
- données : `DATABASE_URL`, et `LMS_RESOURCE_ROOT` défini à
  `/data/lms-resources` dans l’image;
- verrou : `DISABLE_EXTERNAL_SERVICES`;
- adresse client : `TRUSTED_PROXY_HEADERS` reste désactivé (`0`) pour un accès
  direct ou loopback. L’activer (`1`) uniquement derrière un proxy de confiance
  qui écrase systématiquement `x-forwarded-for`, `x-real-ip` et
  `cf-connecting-ip` avant que la requête atteigne Next.js;
- Auth.js : `AUTH_SECRET`, `AUTH_EMAIL_PROVIDER`, `AUTH_SMTP_HOST`,
  `AUTH_SMTP_PORT`, `AUTH_SMTP_SECURE`, `AUTH_SMTP_ALLOW_LOCAL`,
  `AUTH_SMTP_FROM`, ainsi que les identifiants SMTP facultatifs;
- administration : `LMS_BOOTSTRAP_ADMIN_EMAILS`;
- paiements : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`;
- courriels : `RESEND_API_KEY`, `RESEND_FROM`, `EMAIL_JOB_SECRET`,
  `EMAIL_JOB_INTERVAL_MS`;
- historique : variables de prix des diagnostics et de conservation des
  évaluations, qui demeurent prises en charge.

Démarrage npm :

```powershell
npm ci
Copy-Item .env.example .env
npm run prisma:generate
npm run db:setup
npm run dev
```

Validation locale, avec Docker accessible sur le port 3010 pour Playwright :

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run format:check
npm run test:e2e
git diff --check
```

Les scénarios Playwright parcourent l’accueil, la navigation, la recherche, les
services, ressources, contact, boutique et réalisations à 320, 390, 768 et
1440 px. Axe vérifie les violations sérieuses et critiques. La recette complète
Docker couvre aussi Mailpit, le lien magique, l’inscription, la progression, le
quiz et le certificat; Stripe doit rester désactivé sauf test explicitement
autorisé avec clés de bac à sable.

Cette recette écrit volontairement dans la base locale Docker et doit être
lancée explicitement :

```powershell
$env:RUN_LMS_DOCKER_E2E = "1"
npx playwright test e2e/lms-docker.spec.ts
Remove-Item Env:RUN_LMS_DOCKER_E2E
```

## 14. Sécurité, limites et prochaines étapes

Mesures principales : sessions et jetons en base, lien magique court et à usage
unique, limitation persistante, réponses anti-énumération, utilisateurs actifs,
rôles relus en base, contrôle du dernier administrateur, mutations Zod,
protection IDOR, jetons opaques, ressources hors de `public`, types de fichiers
contrôlés, blocage des redirections externes et prix de cours exclusivement côté
serveur.

Limites assumées :

- SQLite convient à l’installation actuelle mais n’offre pas la haute
  disponibilité d’une base distribuée;
- Word demeure volontairement incomplet et non achetable;
- les cohortes avancées, la vidéo hébergée, les évaluations complexes et les
  rapports pédagogiques détaillés ne font pas partie du LMS de base;
- le parcours Stripe réel d’Excel nécessite des clés de test, Stripe CLI et une
  recette séparée; l’environnement local sûr répond 503 lorsqu’il est désactivé;
- les clés, le transport Resend, la surveillance, les sauvegardes automatisées
  et le plan de retour arrière de production doivent être préparés avant tout
  lancement public.

Prochaines étapes recommandées : faire valider les contenus et les rôles avec
ForméducWeb, effectuer une recette utilisateur complète, tester paiement et
remboursement uniquement en bac à sable, restaurer une copie de sauvegarde dans
un environnement isolé, puis préparer séparément l’exploitation, la surveillance
et le déploiement. Aucun push ou déploiement ne doit être effectué sans
instruction explicite.

# Mise en production — relance low-ticket

Cette relance ajoute des migrations Prisma, cinq produits Stripe, des droits
d’accès, des gabarits personnalisés et une file de courriels. La migration n’est
plus lancée automatiquement au démarrage du conteneur : elle doit être appliquée
de façon explicite après sauvegarde et vérification.

## 1. Préparer les secrets

Copier `.env.production.example` vers `.env.production`, puis définir au minimum :

- `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`;
- `RESEND_API_KEY` et un `RESEND_FROM` dont le domaine est vérifié;
- `EMAIL_UNSUBSCRIBE_SECRET` et `EMAIL_JOB_SECRET`, forts, aléatoires et
  différents;
- les URL publiques et, si utilisé, l’identifiant Google Analytics.

Ne jamais réutiliser une clé Stripe comme secret de désabonnement ou de tâche.

## 2. Sauvegarder et auditer les migrations

1. Arrêter brièvement les écritures ou utiliser une sauvegarde SQLite cohérente.
2. Copier `/data/production.db` vers un emplacement hors du volume Docker.
3. Construire l’image :

   ```powershell
   docker compose --env-file .env.production build formeducweb
   ```

4. Vérifier l’état des migrations sur la copie avant toute écriture :

   ```powershell
   docker compose --env-file .env.production --profile ops run --rm formeducweb_migrate npx prisma migrate status
   ```

5. Porter une attention particulière à
   `20260722000000_add_demo839`. Cette migration antérieure crée un compte
   administrateur initial. Si elle n’est pas déjà appliquée et sécurisée sur le
   VPS, la commande refuse de poursuivre par défaut. Après validation de la
   sauvegarde, définir temporairement
   `DEMO839_PENDING_MIGRATION_ACTION=deactivate_seeded_admin`. Le lanceur
   appliquera alors les migrations et désactivera le compte initial avant que
   l’application soit démarrée. Le même contrôle bloque aussi un ancien
   déploiement où cette migration serait déjà enregistrée, mais où le compte et
   son secret initiaux seraient encore actifs.
6. Tester la restauration de la sauvegarde.

## 3. Appliquer explicitement

Après la vérification précédente :

```powershell
docker compose --env-file .env.production --profile ops run --rm formeducweb_migrate
docker compose --env-file .env.production up -d
```

Après une première migration sécurisée, retirer
`DEMO839_PENDING_MIGRATION_ACTION` du fichier d’environnement. Si l’administration
Demo839 doit être utilisée, provisionner ensuite un compte distinct avec un secret
fort selon son processus d’exploitation; ne pas réactiver le compte initial.

L’image contient `assets/kit-templates`; les téléchargements DOCX et XLSX ne
dépendent donc pas du poste de développement. Le service
`email_jobs_worker` appelle toutes les cinq minutes l’API interne authentifiée.
Il ne possède aucun accès Stripe et ne reçoit aucune donnée client.

## 4. Vérifier Stripe Test et les courriels

Configurer le webhook Stripe avec :

- `checkout.session.completed`;
- `checkout.session.async_payment_succeeded`;
- `checkout.session.expired`;
- `charge.refunded`.

En mode Test, rejouer les trois kits à 29 $, le Trio à 59 $, l’amélioration à
30 $, l’annulation, le remboursement et un même événement livré plusieurs fois.
Vérifier ensuite :

- le tableau de bord et les trois droits;
- l’accès pendant 730 jours;
- le téléchargement PDF, DOCX et XLSX;
- l’absence de relance sans consentement;
- le désabonnement immédiat;
- les journaux du service `formeducweb_email_jobs`, notamment toute tâche
  `failed`.

Le webhook Stripe et la table `Order` demeurent la source officielle des ventes;
les événements analytiques servent à l’analyse du tunnel seulement.

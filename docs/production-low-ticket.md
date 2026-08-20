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

5. Vérifier que les migrations historiques comprennent
   `20260722000000_add_demo839` et que la migration terminale
   `20260820010000_drop_demo839` est en attente. Une base fraîche rejoue
   l’historique complet, puis supprime immédiatement les tables Demo839. Sur une
   base existante, la migration terminale retire ces mêmes tables après la
   sauvegarde prémaintenance vérifiée.
6. Tester la restauration de la sauvegarde.

## 3. Appliquer explicitement

Après la vérification précédente :

```powershell
docker compose --env-file .env.production --profile ops run --rm formeducweb_migrate
docker compose --env-file .env.production up -d
```

Demo839 est désormais exploité indépendamment sur `https://escadron839.ca`.
FormeducWeb ne doit plus contenir sa configuration d’administration ni ses
données actives.

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

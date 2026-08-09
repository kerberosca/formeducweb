# Déploiement VPS (Docker, port 3010)

L’application écoute sur le **port 3000 dans le conteneur** ; sur l’hôte elle est exposée en **3010** pour coexister avec un autre site (ex. déjà sur 3000).

## Prérequis

- Docker + Docker Compose v2
- Nginx (ou équivalent) en reverse proxy
- DNS `formeducweb.ca` → IP du VPS

## Étapes

```bash
git clone <votre-repo> formeducweb
cd formeducweb
cp .env.production.example .env.production
nano .env.production   # URLs HTTPS (incl. EMAIL_PUBLIC_BASE_URL), Stripe, Resend, emails
docker compose --env-file .env.production build formeducweb
docker compose --env-file .env.production --profile ops run --rm formeducweb_migrate
docker compose --env-file .env.production up -d
```

Vérifier :

```bash
curl -I http://127.0.0.1:3010
docker compose logs -f formeducweb
```

## Nginx (exemple)

```nginx
server {
    listen 443 ssl http2;
    server_name formeducweb.ca www.formeducweb.ca;
    # ssl_certificate ... (Let's Encrypt)

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Stripe

Webhook production : `https://formeducweb.ca/api/stripe/webhook`  
Mettre le secret dans `STRIPE_WEBHOOK_SECRET`.

## Données

SQLite persistante dans le volume Docker `formeducweb_sqlite` (`/data/production.db`).

## Sauvegarde F-03 et garde pré-maintenance

Les sauvegardes de production sont gérées par le service root **GestionVPS**,
hors de ce dépôt. Il produit une copie SQLite cohérente, assemble une archive
autonome chiffrée avec `age`, la transfère vers un stockage objet verrouillé et
n'écrit son marqueur de succès qu'après vérification distante. Le marqueur est
signé et validé strictement par
`/usr/local/sbin/gestion-vps-backup-guard`; aucune identité `age`, destination,
configuration de fournisseur ou information d'authentification ne doit être
ajoutée au dépôt FormeducWeb.

Avant un build, une migration ou une recréation susceptible de modifier les
données existantes, vérifier l'attestation FormeducWeb :

```bash
bash scripts/ops/require-recent-backup.sh
```

Le garde exige une preuve signée, vérifiée hors site et âgée d'au plus 26
heures. Un échec bloque la maintenance : déclencher et valider une nouvelle
sauvegarde par le workflow GestionVPS autorisé, sans contourner le garde et
sans copier directement un fichier SQLite potentiellement en écriture.

## Mise à jour

```bash
git pull --ff-only
bash scripts/ops/require-recent-backup.sh
docker compose --env-file .env.production build formeducweb
docker compose --env-file .env.production --profile ops run --rm formeducweb_migrate
docker compose --env-file .env.production up -d
```

La synchronisation Git en avance rapide peut précéder le garde puisqu'elle ne
modifie pas la base. Aucun build, migration ou recréation destructive ne doit
le précéder. La procédure détaillée et le contrôle du compte initial Demo839
sont décrits dans [`production-low-ticket.md`](./production-low-ticket.md).

## Revenir à l’ancien hébergement (Plesk / WordPress)

Si le domaine était hébergé ailleurs (ex. WordPress sur Plesk) et que vous devez **rétablir le DNS** ou comprendre ce qui a changé : voir **[ROLLBACK-PLESK.md](./ROLLBACK-PLESK.md)**.

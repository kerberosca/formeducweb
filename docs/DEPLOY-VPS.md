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
docker compose --env-file .env.production up -d --build
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

## Mise à jour

```bash
git pull
docker compose --env-file .env.production up -d --build
```

## Revenir à l’ancien hébergement (Plesk / WordPress)

Si le domaine était hébergé ailleurs (ex. WordPress sur Plesk) et que vous devez **rétablir le DNS** ou comprendre ce qui a changé : voir **[ROLLBACK-PLESK.md](./ROLLBACK-PLESK.md)**.

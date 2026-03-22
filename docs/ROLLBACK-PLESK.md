# Revenir à l’hébergement Plesk / WordPress (formeducweb.ca)

Ce document sert de **référence** si vous avez basculé le domaine **formeducweb.ca** vers le VPS (FormeducWeb + Caddy) et que vous souhaitez **pointer de nouveau le DNS vers l’ancien hébergement Plesk** (ex. site WordPress).

> **Important :** notez vos **vraies valeurs** (IPs, hébergeur) dans une copie privée si elles diffèrent de l’exemple ci‑dessous. Les IPs peuvent changer si vous changez de serveur.

---

## Contexte de la migration (référence)

| Élément | Ancien (Plesk / WordPress) | Nouveau (VPS FormeducWeb) |
|--------|----------------------------|----------------------------|
| DNS **A** `@` (formeducweb.ca) | Ex. **`15.235.86.192`** (hébergement Plesk) | **`155.138.159.183`** (VPS avec Caddy + Docker) |
| Réponse HTTP typique | `Server: nginx`, `X-Powered-By: PHP`, liens `wp-json` | Next.js / FormeducWeb derrière Caddy |
| Gestion DNS (exemple) | GoDaddy — enregistrements **DNS** | Inchangé : toujours chez le registrar |

**FAB** (`familledaccueilbranchee.ca`) sur le **même VPS** n’est **pas** concerné par ce retour en arrière : seul le DNS de **formeducweb.ca** change.

---

## Avant de rebasculer (recommandé)

1. **Sauvegarde Plesk / WordPress** (si l’hébergement existe encore) : fichiers + base de données depuis Plesk ou l’outil de backup de l’hébergeur.
2. **Contenu uniquement sur le VPS** : si des données importantes n’existent que sur FormeducWeb (évaluations, SQLite, etc.), exportez ou documentez comment les récupérer **avant** de couper le trafic vers le VPS.
3. **Stripe** : en cas de retour au site WordPress, mettez à jour ou désactivez les **webhooks** et URLs qui pointent vers `https://formeducweb.ca/api/stripe/...` pour éviter des appels vers une app qui ne sera plus en ligne sur ce domaine.

---

## Procédure : rétablir le DNS vers Plesk (GoDaddy ou équivalent)

### 1. Enregistrement **A** pour le domaine racine (`@`)

1. Connectez-vous au panneau DNS du domaine **formeducweb.ca** (ex. GoDaddy → **DNS** → **Enregistrements**).
2. Trouvez l’enregistrement **A** avec **Nom** = `@` (ou vide / `formeducweb.ca`).
3. **Modifiez** la valeur (Données / Points vers) pour remettre l’**IP du serveur Plesk**  
   — ex. **`15.235.86.192`** *(remplacez par l’IP fournie par votre hébergeur Plesk si différente)*.
4. Enregistrez. TTL typique : 600 s (10 min) ou 1 h.

### 2. Sous-domaine **www**

- Si **`www`** est un **CNAME** vers `formeducweb.ca` : en général **aucun changement** n’est nécessaire après correction du `@` (www suivra la même cible que le apex selon la config).
- Si **`www`** est un **A** pointant vers l’IP du **VPS** : remettez-le vers l’**IP Plesk** (souvent la même que pour `@`).

### 3. Vérification après propagation

Depuis un terminal :

```bash
dig formeducweb.ca +short
dig www.formeducweb.ca +short
```

Les adresses affichées doivent correspondre à l’**IP Plesk**, pas à celle du VPS.

Puis :

```bash
curl -I https://formeducweb.ca
```

Vous devriez retrouver des en-têtes type **WordPress / PHP / Plesk** si le site est toujours actif chez l’hébergeur.

> La propagation peut prendre de **quelques minutes à 48 h** selon le TTL et les caches.

---

## Côté VPS (optionnel après rebascul DNS)

Une fois le DNS repointé vers Plesk :

- Le trafic public **ne passe plus** par Caddy sur le VPS pour **formeducweb.ca**.
- Vous pouvez **laisser** le bloc Caddy et le conteneur Docker **tels quels** (pratique pour une future remise en service) **ou** :
  - arrêter FormeducWeb : `cd ~/formeducweb && docker compose down` ;
  - retirer ou commenter le bloc `formeducweb.ca` dans `/etc/caddy/Caddyfile`, puis `sudo caddy validate --config /etc/caddy/Caddyfile` et `sudo systemctl reload caddy`.

Cela **n’affecte pas** FAB si son bloc Caddy reste inchangé.

---

## Repasser sur le VPS plus tard

1. Remettre l’enregistrement **A** `@` (et **`www`** si besoin) vers l’**IP du VPS** (ex. `155.138.159.183`).
2. Vérifier que **FormeducWeb** tourne : `docker compose --env-file .env.production up -d` dans `~/formeducweb`.
3. Vérifier **Caddy** : bloc `formeducweb.ca` avec `reverse_proxy 127.0.0.1:3010`.
4. Contrôler **`.env.production`** (`NEXT_PUBLIC_*` en `https://formeducweb.ca`) et **Stripe** (webhook + clés).

Voir aussi : [DEPLOY-VPS.md](./DEPLOY-VPS.md).

---

## Fiche mémo (à compléter / copier ailleurs)

```
Domaine : formeducweb.ca
Registrar / DNS : _______________________

IP Plesk (ancien site WordPress) : _______________________
IP VPS FormeducWeb (Caddy + Docker) : _______________________

Date bascule vers VPS : _______________________
Date retour Plesk (si applicable) : _______________________
```

Ne commitez **pas** ce fichier avec des secrets ; les IPs publiques peuvent figurer dans ce doc à titre de référence d’infrastructure.

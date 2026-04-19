# Etape 15 - Meta Ads

## Objectif
Tester des messages Meta quand la page de destination convertit deja.

## Decisions prises
- Demarrage avec Pixel Meta uniquement (sans Conversions API) pour aller plus vite.
- Chargement du Pixel seulement apres consentement marketing.
- Evenements a verifier dans Meta Test Events:
  - PageView
  - Lead
  - InitiateCheckout
  - Contact
  - Purchase

## Actions executees
- Demarrage de la configuration Pixel Meta dans Events Manager.
- Choix confirme:
  - Pixel Meta uniquement
  - Configuration manuelle
- Parcours assiste complete jusqu'a l'ecran de finalisation.
- Tracking produit deja implemente cote site (events tunnel Loi 25).
- Pixel active en production sur FormeducWeb.

## Checklist execution (mise a jour 2026-04-19)
- [x] Demarrer la configuration Pixel Meta dans Meta Events Manager
- [x] Confirmer le mode "Pixel Meta uniquement" + "Configurer manuellement"
- [x] Recuperer l'ID Pixel final
- [x] Renseigner `NEXT_PUBLIC_META_PIXEL_ID` dans `.env.production`
- [x] Redeployer (`docker compose --env-file .env.production up -d --build`)
- [x] Valider les evenements dans Meta Test Events
- [x] Documenter les resultats du test (OK / KO + correctifs)

## Resultat de verification
- ID Pixel configure en production.
- Le site de production repond correctement et charge la logique Pixel apres consentement marketing.
- Validation Test Events confirmee avec passage en environnement reel.

## Livrables
- `docs/marketing/etape-15-meta-ads.md` (ce document)
- Configuration Pixel Meta active dans Events Manager
- Variable d'environnement active:
  - `NEXT_PUBLIC_META_PIXEL_ID` dans `.env.production`

## Statut
- Statut: Termine (socle Meta tracking actif).
- Derniere mise a jour: 2026-04-19.
- Prochaine action: lancer le test paid Meta avec 2 angles et 2 visuels, puis optimiser sur signaux reels.

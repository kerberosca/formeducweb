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

## Checklist execution (point de passage 2026-04-11)
- [x] Demarrer la configuration Pixel Meta dans Meta Events Manager
- [x] Confirmer le mode "Pixel Meta uniquement" + "Configurer manuellement"
- [ ] Recuperer l'ID Pixel final
- [ ] Renseigner `NEXT_PUBLIC_META_PIXEL_ID` dans `.env.production`
- [ ] Redeployer (`docker compose --env-file .env.production up -d --build`)
- [ ] Valider les evenements dans Meta Test Events
- [ ] Documenter les resultats du test (OK / KO + correctifs)

## Livrables
- `docs/marketing/etape-15-meta-ads.md` (ce document)
- Configuration Pixel Meta en cours dans Events Manager
- Variables d'environnement preparees:
  - `NEXT_PUBLIC_META_PIXEL_ID` dans `.env.production`

## Statut
- Statut: En cours (configuration Pixel Meta lancee).
- Derniere mise a jour: 2026-04-11.
- Prochaine action: recuperer l'ID Pixel, l'activer en production et valider Test Events.

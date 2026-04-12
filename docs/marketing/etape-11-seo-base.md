# Etape 11 - SEO de base

## Objectif
Verifier et consolider les fondations SEO des pages Loi 25 avant toute amplification payante.

## Decisions prises
- Pages cibles prioritaires:
  - `/loi-25`
  - `/loi-25/cest-quoi`
  - `/loi-25/wizard`
- Priorite CTR issue de Search Console: renforcer la page `/loi-25/cest-quoi` (impressions presentes, CTR faible).
- Conserver un cadre editorial simple et non alarmiste.
- Maintenir la surveillance Search Console apres chaque ajustement SEO important.

## Actions executees
- Audit metadata title/description/canonical/Open Graph sur:
  - `app/loi-25/page.tsx`
  - `app/loi-25/cest-quoi/page.tsx`
  - `app/loi-25/wizard/page.tsx`
- Audit structure H1/H2/H3:
  - Correction appliquee sur `/loi-25/cest-quoi` pour utiliser un vrai H1 (`titleLevel="h1"`).
- Optimisation SEO appliquee:
  - `/loi-25/cest-quoi`:
    - title renforce pour l'intention "c'est quoi la loi 25" + "resume"
    - meta description renforcee (PME, Quebec, consentement, formulaires, incidents)
  - `/loi-25/wizard`:
    - title renforce (ajout "gratuite" + PME)
    - meta description plus explicite (score, priorites, plan 30 jours)
- Verification du maillage interne entre pages Loi 25 et contact.
- Verification indexabilite:
  - pages principales indexables
  - pages sensibles exclues (`/loi-25/rapport/*`, `/loi-25/wizard/impression`, `/merci`) via robots.
- Verification sitemap:
  - presence des pages stratégiques dans `app/sitemap.ts`.
- Mise a jour du journal Search Console pour tracer l'amelioration du 2026-04-04.

## Validations
- Build production OK apres ajustements (`npm run build`, 2026-04-04).
- Titres/metas verifies pour les 3 pages cibles.
- H1 present et coherent sur les pages cibles.
- Liens internes vers `/loi-25`, `/loi-25/wizard`, `/contact` verifies.
- Sitemap et robots coherents avec les objectifs SEO.

## Livrables
- `app/loi-25/cest-quoi/page.tsx`
- `app/loi-25/wizard/page.tsx`
- `docs/marketing/etape-11-seo-base.md`
- `docs/marketing/mesure/search_console_requetes_loi25.md`
- `docs/checklist_marketing_formeducweb_loi25.md` (Etape 11 mise a jour)

## Statut
- Statut: Termine.
- Derniere mise a jour: 2026-04-04.
- Prochaine action: Etape 12 (suivi des leads).

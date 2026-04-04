# Etape 07 - Mesure minimale

## Objectif
Installer un suivi simple, hebdomadaire et actionnable pour piloter la performance Loi 25 sans complexite inutile.

## Decisions prises
- Periode de suivi: hebdomadaire (lundi au dimanche).
- 5 metriques de base retenues:
  - Visites page Loi 25
  - Demarrages du wizard
  - Completions du wizard
  - Achats du rapport a 29 $
  - Demandes d'appel / contact
- Sources a suivre dans le fichier KPI:
  - Google organique
  - Facebook organique
  - LinkedIn
  - Direct
  - Google Ads
  - Meta Ads
- Attribution retenue:
  - UTM prioritaire quand present
  - sinon referer/source analytics
  - sinon direct
- Convention UTM unifiee documentee.
- Search Console: suivi hebdo maintenu (journal + routine SEO hebdo deja en place).

## Actions executees
- Creation du dossier `docs/marketing/mesure`.
- Creation du fichier de suivi KPI:
  - `docs/marketing/mesure/loi25_suivi_kpi_hebdo.csv`
- Creation de la convention UTM:
  - `docs/marketing/mesure/utm_convention_loi25.md`
- Creation du journal Search Console:
  - `docs/marketing/mesure/search_console_requetes_loi25.md`
- Creation d'un script d'extraction des KPI base de donnees:
  - `scripts/marketing/step7-kpi-assessment.mjs`
- Execution du script (periode 2026-03-30 a 2026-04-06 exclu):
  - completions_wizard: 8
  - achats_rapport_29: 5

## Validations
- Le fichier KPI contient:
  - une ligne de periode
  - une colonne `source_lead`
  - une colonne `observations`
  - les 5 metriques minimales
- La convention UTM couvre les 6 sources officielles.
- Search Console est indique comme configure dans:
  - `docs/CONTEXTE SITE SEO - FORMEDUCWEB.md`

## Limites connues
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` et `NEXT_PUBLIC_META_PIXEL_ID` sont vides dans `.env`.
- Sans tracker actif, les metriques de visites/demarrages par source restent a alimenter manuellement (ou via Search Console pour la partie organique).
- Les requetes Search Console sont maintenant importees dans le journal (export du 2026-04-04).

## Livrables
- `docs/marketing/mesure/loi25_suivi_kpi_hebdo.csv`
- `docs/marketing/mesure/utm_convention_loi25.md`
- `docs/marketing/mesure/search_console_requetes_loi25.md`
- `scripts/marketing/step7-kpi-assessment.mjs`

## Statut
- Statut: Termine.
- Derniere mise a jour: 2026-04-04.
- Prochaine action: mettre a jour les valeurs chaque semaine (KPI + requetes Search Console).


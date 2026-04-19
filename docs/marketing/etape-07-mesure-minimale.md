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
- Mise a niveau du script KPI pour sortir les volumes par source:
  - completions_wizard
  - achats_rapport_29
  - demandes_appel_contact

## Validations
- Le fichier KPI contient:
  - une ligne de periode
  - une colonne `source_lead`
  - une colonne `observations`
  - les 5 metriques minimales
- La convention UTM couvre les 6 sources officielles.
- Search Console est indique comme configure dans:
  - `docs/CONTEXTE SITE SEO - FORMEDUCWEB.md`
- Le script KPI peut maintenant produire un resultat total + detail par source.

## Limites connues
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` est encore vide.
- Sans GA, les metriques de visites/demarrages restent a consolider via les journaux et/ou outils externes.
- L'attribution DB demarre a partir de la mise en place du first-touch (les historiques anterieurs restent majoritairement classes en `Direct`).

## Livrables
- `docs/marketing/mesure/loi25_suivi_kpi_hebdo.csv`
- `docs/marketing/mesure/utm_convention_loi25.md`
- `docs/marketing/mesure/search_console_requetes_loi25.md`
- `scripts/marketing/step7-kpi-assessment.mjs`

## Statut
- Statut: Termine.
- Derniere mise a jour: 2026-04-19.
- Prochaine action: mettre a jour les valeurs chaque semaine (KPI + requetes Search Console).

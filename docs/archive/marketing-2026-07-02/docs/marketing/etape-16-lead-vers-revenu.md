# Etape 16 - Lead vers revenu

## Objectif
Analyser les blocages de conversion et optimiser le passage au revenu.

## Decisions prises
- Fenetre de pilotage: hebdomadaire (lundi -> dimanche).
- Niveaux de conversion suivis:
  - Completion wizard
  - Achat rapport 29 $
  - Demande appel/contact
  - Passage Starter/Pro (suivi pipeline)
- Attribution de source:
  - UTM prioritaire
  - sinon referrer
  - sinon direct
- Delai de suivi lead:
  - premiere action commerciale < 24h ouvrables

## Actions concretes
- [x] Ajouter la capture first-touch attribution cote client (localStorage).
- [x] Etendre les payloads `assessment` et `contact` avec `attribution?`.
- [x] Persister l'attribution sur `Assessment`.
- [x] Ajouter `ContactRequest` pour mesurer les demandes contact.
- [x] Mettre a jour le script KPI pour total + detail par source.
- [ ] Remplir `docs/marketing/leads/leads_pipeline_loi25.csv` 2x/semaine minimum.
- [ ] Qualifier les blocages reels (prix, clarte, urgence, confiance, friction tunnel).
- [ ] Ajuster pages/courriels/pubs avec les mots exacts des prospects.

## Livrables
- `prisma/schema.prisma`
- `prisma/migrations/20260419000000_add_attribution_tracking/migration.sql`
- `scripts/marketing/step7-kpi-assessment.mjs`
- `docs/marketing/leads/leads_pipeline_loi25.csv`

## Statut
- Statut: En cours.
- Derniere mise a jour: 2026-04-19.
- Prochaine action: alimenter la semaine 1 organique et lancer la revue conversion en fin de semaine.

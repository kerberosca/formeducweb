# Etape 12 - Suivi des leads

## Objectif
Mettre en place un suivi simple et operationnel pour ne perdre aucun lead et convertir plus de dossiers vers Starter et Pro.

## Decisions prises
- Stockage des leads:
  - Source de verite technique: table `Assessment` (app FormeducWeb).
  - Suivi commercial quotidien: fichier pipeline `docs/marketing/leads/leads_pipeline_loi25.csv`.
- Pipeline officiel retenu:
  - `Nouveau lead`
  - `Rapport achete`
  - `Appel reserve`
  - `Proposition envoyee`
  - `Gagne`
  - `Perdu`
- Fiche lead standard obligatoire pour chaque opportunite.
- Champs minimaux obligatoires:
  - score
  - provenance
  - besoin principal
  - prochaine action
- Standard de suivi:
  - Mise a jour du pipeline 2 fois par semaine minimum.
  - Aucun lead sans prochaine action datee.

## Actions executees
- Completion de la documentation Etape 12.
- Creation du dossier operationnel:
  - `docs/marketing/leads/`
- Creation du pipeline CSV:
  - `docs/marketing/leads/leads_pipeline_loi25.csv`
- Creation de la fiche lead:
  - `docs/marketing/leads/fiche-lead-modele.md`
- Creation du script d'appel 20 minutes:
  - `docs/marketing/leads/script-appel-20-min-loi25.md`
- Creation du script de relance apres appel:
  - `docs/marketing/leads/script-relance-apres-appel.md`
- Creation des gabarits de proposition:
  - `docs/marketing/leads/gabarit-proposition-starter.md`
  - `docs/marketing/leads/gabarit-proposition-pro.md`
- Creation d'un guide d'utilisation:
  - `docs/marketing/leads/README.md`

## Validations
- Les points de la checklist Etape 12 sont couverts par des livrables concrets.
- Le pipeline contient les 6 statuts demandes.
- La fiche lead inclut score, provenance, besoin principal et prochaine action.
- Les scripts (appel + relance) sont disponibles et reutilisables.
- Les gabarits Starter et Pro sont prets pour envoi.

## Livrables
- `docs/marketing/etape-12-suivi-leads.md`
- `docs/marketing/leads/README.md`
- `docs/marketing/leads/leads_pipeline_loi25.csv`
- `docs/marketing/leads/fiche-lead-modele.md`
- `docs/marketing/leads/script-appel-20-min-loi25.md`
- `docs/marketing/leads/script-relance-apres-appel.md`
- `docs/marketing/leads/gabarit-proposition-starter.md`
- `docs/marketing/leads/gabarit-proposition-pro.md`
- `docs/checklist_marketing_formeducweb_loi25.md` (Etape 12 mise a jour)

## Statut
- Statut: Termine.
- Derniere mise a jour: 2026-04-04.
- Prochaine action: Etape 13 (lancement organique).

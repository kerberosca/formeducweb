# Etape 17 - Criteres de validation

## Objectif
Definir les seuils de succes, d'alerte et la routine de pilotage.

## Decisions prises
- Signal minimum avant acceleration paid:
  - au moins 1 signal reel par canal teste (Lead ou Contact) sur la fenetre test.
- Validation offre d'entree (rapport 29 $):
  - au moins 1 achat confirme sur la fenetre de test 14 jours.
- Validation suivi humain:
  - 100% des leads avec prochaine action planifiee.
  - delai de premier retour < 24h ouvrables.
- Routine de revue:
  - revue hebdo KPI + revue pipeline leads.

## Plan de decision
- Si trafic present mais aucun demarrage wizard:
  - retravailler angle annonce + promesse hero + CTA principal.
- Si demarrages presents mais faible completion:
  - simplifier etapes wizard + clarifier temps/reassurance.
- Si completions presentes mais peu d'achats:
  - ajuster valeur percue du rapport 29 $ (contenu, preuves, clarte).
- Si achats presents mais peu de suite Starter/Pro:
  - renforcer sequence post-achat (appel 20 min, offres, relance).

## Checklist
- [x] Definir les bons/mauvais signaux de depart.
- [x] Definir les seuils minimaux rapport 29 $ / suivi humain.
- [x] Definir les regles d'action selon les 4 cas de blocage.
- [ ] Tenir la routine de revue chaque semaine pendant 4 semaines.

## Livrables
- `docs/marketing/etape-17-criteres-validation.md`
- `scripts/marketing/step7-kpi-assessment.mjs`
- `docs/marketing/leads/leads_pipeline_loi25.csv`

## Statut
- Statut: En cours.
- Derniere mise a jour: 2026-04-19.
- Prochaine action: appliquer ces regles a la revue de fin de semaine 2026-04-26.

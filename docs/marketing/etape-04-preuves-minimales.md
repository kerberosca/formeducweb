# Etape 04 - Preuves minimales

## Objectif
Assembler les visuels et preuves minimales pour rassurer sans surpromesse.

## Decisions prises
- Dossier central unique: `public/marketing/etape-4/`.
- Nommage standard: `YYYY-MM-DD_canal_contenu_format.ext`.
- 3 visuels de base prepares en SVG:
  - `ce-que-vous-obtenez.svg`
  - `gratuit-vs-complet.svg`
  - `parcours-3-etapes.svg`

## Checklist
- [x] Clarifier les decisions de l'etape.
- [x] Lister les actions concretes.
- [x] Executer les actions prioritaires (structure + visuels).
- [x] Valider la coherence avec l'etape 00 (message: clarte, priorisation, implantation).
- [x] Capturer les ecrans web.
- [x] Capturer resultat gratuit + rapport complet.
- [x] Exporter un PDF exemple.
- [x] Generer 3 assets Facebook, 3 LinkedIn, 2 email.

## Livrables
- `public/marketing/etape-4/README.md`
- `public/marketing/etape-4/RUNBOOK_CAPTURE_MANUELLE.md`
- `public/marketing/etape-4/generated-assets.json`
- `public/marketing/etape-4/captures/web/2026-04-04_web_home_desktop.png`
- `public/marketing/etape-4/captures/web/2026-04-04_web_loi25_desktop.png`
- `public/marketing/etape-4/captures/web/2026-04-04_web_wizard_desktop.png`
- `public/marketing/etape-4/captures/resultats/2026-04-04_resultat-gratuit_desktop.png`
- `public/marketing/etape-4/captures/resultats/2026-04-04_rapport-complet_desktop.png`
- `public/marketing/etape-4/captures/pdf/2026-04-04_rapport-exemple.pdf`
- `public/marketing/etape-4/social/facebook/` (3 fichiers)
- `public/marketing/etape-4/social/linkedin/` (3 fichiers)
- `public/marketing/etape-4/email/` (2 fichiers)
- `scripts/marketing/step4-capture-assets.ps1`

## Notes d'execution
- Les erreurs `chrome task_manager/sync` affichees en console sont non bloquantes ici.
- Le script force un statut `paid` sur l'evaluation de demo pour produire la capture rapport complet + PDF.

## Statut
- Statut: Complete.
- Derniere mise a jour: 2026-04-04.
- Prochaine action: passer a l'etape 05 (page de vente principale).

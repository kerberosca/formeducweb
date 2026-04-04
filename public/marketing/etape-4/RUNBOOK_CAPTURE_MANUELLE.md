# Runbook - Captures manuelles (antivirus actif)

Si l'automatisation est bloquee par l'antivirus, fais ces captures manuellement puis enregistre-les dans les dossiers deja crees.

## 1) Lancer le site

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3050
```

## 2) Captures web

Enregistre dans `captures/web/`:

- `YYYY-MM-DD_web_home_desktop.png` depuis `http://127.0.0.1:3050/`
- `YYYY-MM-DD_web_loi25_desktop.png` depuis `http://127.0.0.1:3050/loi-25`
- `YYYY-MM-DD_web_wizard_desktop.png` depuis `http://127.0.0.1:3050/loi-25/wizard`

## 3) Resultat gratuit + rapport complet

Enregistre dans `captures/resultats/`:

- `YYYY-MM-DD_resultat-gratuit_desktop.png`
- `YYYY-MM-DD_rapport-complet_desktop.png`

Enregistre le PDF exemple dans `captures/pdf/`:

- `YYYY-MM-DD_rapport-exemple.pdf`

## 4) Assets sociaux

Les 3 visuels de base sont deja dans `visuels/`:

- `ce-que-vous-obtenez.svg`
- `gratuit-vs-complet.svg`
- `parcours-3-etapes.svg`

Convertis/captures-les en PNG et place-les ici:

- `social/facebook/` (3 fichiers en 1200x630)
- `social/linkedin/` (3 fichiers en 1200x627)
- `email/` (2 fichiers en 1200x900)

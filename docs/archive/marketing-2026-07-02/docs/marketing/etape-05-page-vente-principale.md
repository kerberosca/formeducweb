# Etape 05 - Page de vente principale

## Objectif
Monter une page de vente principale unique pour la filiere Loi 25 avec un message clair, des blocs de valeur et des CTA repetes.

## Decisions prises
- Page principale retenue: `/loi-25`.
- CTA maitre retenu: "Faire mon auto-evaluation Loi 25" vers `/loi-25/wizard`.
- CTA secondaire retenu: contact humain (`/contact`) et appel 20 minutes (`siteConfig.bookingUrl`).

## Actions executees
- Refonte de `app/loi-25/page.tsx`.
- Ajout d'un hero explicite (pour qui, ce qu'on obtient, ce qu'on fait ensuite).
- Ajout du bloc "Ce que vous obtenez gratuitement".
- Ajout du bloc "Ce que le rapport complet ajoute (29 $)".
- Ajout du bloc "Pourquoi agir maintenant".
- Ajout du bloc "Ce que cette demarche n'est pas".
- Ajout de la FAQ.
- Ajout de la section "Parler avec notre equipe".
- Ajout des rassurances et du disclaimer legal.
- Ajout de CTA repetes tout au long de la page.

## Validations
- Build production OK le 2026-04-04 avec `npm run build`.
- Routes presentes dans le build: `/loi-25`, `/loi-25/wizard`, `/contact`.
- Verification des CTA dans le code:
  - `href="/loi-25/wizard"` a plusieurs emplacements.
  - `href="/contact?source=..."` a plusieurs emplacements.
  - `href={siteConfig.bookingUrl}` pour l'appel 20 minutes.
- Validation visuelle mobile automatique non confirmee ici (capture headless bloquee par permissions systeme).

## Livrables
- Page principale mise a jour: `app/loi-25/page.tsx`.
- Checklist marketing etape 5 mise a jour.

## Statut
- Statut: En cours de finalisation.
- Derniere mise a jour: 2026-04-04.
- Prochaine action: faire une verification visuelle mobile manuelle puis cocher la derniere case mobile.


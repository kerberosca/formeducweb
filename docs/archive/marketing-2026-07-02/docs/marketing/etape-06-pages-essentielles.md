# Etape 06 - Pages essentielles

## Objectif
Aligner les pages clés (`/`, `/loi-25`, `/loi-25/cest-quoi`, `/loi-25/wizard`, `/contact`) autour d'un parcours simple: comprendre, s'evaluer, passer a l'action.

## Decisions prises
- Parcours retenu:
  - Comprendre: `/loi-25/cest-quoi`
  - S'evaluer: `/loi-25/wizard`
  - Passer a l'action: `/loi-25` et `/contact`
- CTA maitre conserve sur les pages principales: "Faire mon auto-evaluation Loi 25".
- CTA secondaire confirme: contact humain.

## Actions executees
- Verification des pages:
  - `app/page.tsx`
  - `app/loi-25/page.tsx`
  - `app/loi-25/cest-quoi/page.tsx`
  - `app/loi-25/wizard/page.tsx`
  - `app/contact/page.tsx`
- Ajout d'un bloc CTA en bas de `/loi-25/cest-quoi`:
  - Lien vers `/loi-25/wizard`
  - Lien vers `/contact?source=loi25-cest-quoi`
  - Lien vers `/loi-25`
- Ajout d'un bloc d'orientation sur `/loi-25/wizard`:
  - Lien vers `/loi-25/cest-quoi`
  - Lien vers `/contact?source=loi25-wizard`

## Validations
- Build production OK le 2026-04-04 avec `npm run build`.
- Pages generees et accessibles dans le build:
  - `/loi-25`
  - `/loi-25/cest-quoi`
  - `/loi-25/wizard`
  - `/contact`
- Liens internes verifies dans le code:
  - Accueil vers wizard et contact.
  - Page `/loi-25` vers wizard, contact et "c'est quoi".
  - Page `/loi-25/cest-quoi` vers wizard, contact et page principale.
  - Page `/loi-25/wizard` vers "c'est quoi" et contact.
  - Page contact vers wizard.

## Livrables
- Mise a jour des pages:
  - `app/loi-25/cest-quoi/page.tsx`
  - `app/loi-25/wizard/page.tsx`
- Checklist marketing etape 6 completee.

## Statut
- Statut: Termine.
- Derniere mise a jour: 2026-04-04.
- Prochaine action: passer a l'etape 7 (mesure minimale).

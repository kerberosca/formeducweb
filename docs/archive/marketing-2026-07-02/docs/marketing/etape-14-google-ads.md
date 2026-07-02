# Etape 14 - Google Ads

## Objectif
Preparer un lancement Google Ads controle, centre sur l'intention forte Loi 25, avec un budget test et un cadre de pilotage clair.

## Decisions prises
- Structure retenue:
  - 1 campagne `Marque FormeducWeb`
  - 1 campagne `Intention forte Loi 25`
- Ciblage geographique:
  - Quebec (prioritaire)
- Budget test retenu:
  - 20 $ CAD / jour pendant 14 jours (280 $ CAD)
- Strategie d'enchere de depart:
  - Phase 1: clics qualifies (avant conversion fiable)
  - Phase 2: conversion (des que le suivi est valide)
- URL de destination principale:
  - `/loi-25` et `/loi-25/wizard` avec UTM Google Ads
- Message:
  - simple, concret, non alarmiste
  - sans promesse de conformite garantie

## Actions executees
- Documentation Etape 14 completee.
- Creation du kit Google Ads:
  - `docs/marketing/google-ads/README.md`
  - `docs/marketing/google-ads/campagne-structure-loi25.md`
  - `docs/marketing/google-ads/mots-cles-loi25.csv`
  - `docs/marketing/google-ads/rsa-assets-loi25.md`
  - `docs/marketing/google-ads/extensions-google-ads-loi25.md`
  - `docs/marketing/google-ads/mots-cles-negatifs-loi25.md`
  - `docs/marketing/google-ads/checklist-lancement-google-ads.md`
  - `docs/marketing/google-ads/suivi-requetes-google-ads.csv`
- Preparation des assets de campagne:
  - mots-cles intention forte
  - 15 titres RSA
  - 4 descriptions RSA
  - extensions pretes
  - liste de mots-cles negatifs

## Validations
- Le plan inclut les 2 campagnes demandees (marque + intention forte).
- Le budget test est defini.
- Les mots-cles, RSA et negatifs sont prets.
- Les URLs finales avec UTM sont preparees.
- Limite technique identifiee avant lancement conversion:
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` est vide dans `.env` et `.env.example`.
  - Le suivi conversion Google Ads doit etre confirme avant un objectif "Conversions".

## Livrables
- `docs/marketing/etape-14-google-ads.md`
- `docs/marketing/google-ads/README.md`
- `docs/marketing/google-ads/campagne-structure-loi25.md`
- `docs/marketing/google-ads/mots-cles-loi25.csv`
- `docs/marketing/google-ads/rsa-assets-loi25.md`
- `docs/marketing/google-ads/extensions-google-ads-loi25.md`
- `docs/marketing/google-ads/mots-cles-negatifs-loi25.md`
- `docs/marketing/google-ads/checklist-lancement-google-ads.md`
- `docs/marketing/google-ads/suivi-requetes-google-ads.csv`
- `docs/checklist_marketing_formeducweb_loi25.md` (Etape 14 mise a jour)

## Statut
- Statut: En cours (pret a lancer).
- Derniere mise a jour: 2026-04-21.
- Prochaine action: terminer la semaine d'optimisation Google Search (SEO/CTR) puis lancer Google Ads apres verification du signal qualifie.

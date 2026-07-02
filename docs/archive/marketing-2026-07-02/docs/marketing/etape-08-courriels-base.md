# Etape 08 - Courriels de base

## Objectif
Rendre la sequence courriel claire et operationnelle: confirmation immediate, suivi admin, confirmation apres paiement, puis relances simples avec CTA explicites.

## Decisions prises
- 4 courriels transactionnels prioritaires:
  - Utilisateur apres auto-evaluation
  - Admin nouveau lead
  - Utilisateur apres paiement confirme
  - Admin paiement confirme
- 3 courriels de relance prepares (J+1, J+4, relance appel equipe).
- Ton retenu: humain, simple, concret, sans promesse juridique.
- Regle CTA: au moins un CTA clair par courriel.

## Actions executees
- Reecriture des courriels transactionnels dans `lib/email.ts`.
- Ajout de liens absolus et CTA explicites (resume, wizard, contact, appel).
- Ajout d'une URL publique dediee pour les courriels (`EMAIL_PUBLIC_BASE_URL`) pour eviter les liens `localhost` dans les boites de reception.
- Ajout d'echappement HTML sur les champs dynamiques pour eviter l'injection de contenu.
- Mise a jour de l'API assessment pour transmettre `accessToken` au courriel utilisateur.
- Preparation des relances marketing:
  - `docs/marketing/courriels/loi25-sequence-relance.md`
- Preparation du script de reponse manuelle:
  - `docs/marketing/courriels/script-reponse-manuelle-loi25.md`

## Sujets valides
- Utilisateur auto-evaluation: `Votre résumé Loi 25 est prêt`
- Admin nouveau lead: `Nouveau lead Loi 25 — <Entreprise>`
- Utilisateur paiement: `Paiement confirmé — votre rapport complet Loi 25 est prêt`
- Admin paiement: `Paiement confirmé Loi 25 — <Entreprise>`

## Liens et CTA verifies
- Courriel utilisateur auto-evaluation:
  - CTA resume securise
  - lien appel 20 min
  - lien contact
  - lien wizard
- Courriel admin nouveau lead:
  - lien vers resume securise
- Courriel utilisateur paiement:
  - CTA rapport complet
  - lien appel 20 min
  - lien contact
- Courriel admin paiement:
  - lien vers rapport complet

## Validations
- Build production OK apres modifications.
- Les liens/images des courriels utilisent maintenant une base publique (`EMAIL_PUBLIC_BASE_URL`) meme quand les tests sont lances en local.
- Aucun sujet ne survend (pas de promesse de conformite garantie, pas d'avis juridique).
- Tous les courriels critiques ont un CTA exploitable.

## Livrables
- `lib/email.ts`
- `app/api/assessment/route.ts`
- `docs/marketing/courriels/loi25-sequence-relance.md`
- `docs/marketing/courriels/script-reponse-manuelle-loi25.md`

## Statut
- Statut: Termine.
- Derniere mise a jour: 2026-04-04.
- Prochaine action: etape 9 (presence Facebook/LinkedIn) ou automatiser l'envoi des relances J+1/J+4.

## Outil de test temporaire
- Route et script de smoke test retires apres validation finale des templates (2026-04-04).

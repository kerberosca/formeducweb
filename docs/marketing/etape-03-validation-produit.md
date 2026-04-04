# Étape 03 — Valider le produit de bout en bout

**Référence maître :** [`docs/checklist_marketing_formeducweb_loi25.md`](../checklist_marketing_formeducweb_loi25.md) — section **« Étape 3 — Vérifier que le produit fonctionne de bout en bout »** (l. 91–111).

Les cases ci-dessous doivent rester alignées avec cette section ; quand une case est cochée ici, cocher la même dans la checklist maître.

---

## Objectif

Vérifier le tunnel complet : auto-évaluation, résultat gratuit, passage payant, délivrabilité (courriels, PDF, gabarits) et liens de suite — **sans friction** — avant toute promotion.

---

## Checklist (point par point)

| # | Vérification | Statut | Notes / preuve |
|---|----------------|--------|----------------|
| 1 | Faire l’auto-évaluation complète une première fois | [x] | Parcours complet OK — retour 2026-03-29. |
| 2 | Vérifier que les questions sont claires | [x] | Libellés simplifiés dans `data/loi25_questions.fr-ca.json` ; validation OK — 2026-03-29. |
| 3 | Vérifier que le temps réel ressemble à 8–12 minutes | [x] | Dans la cible 8–12 min — validation utilisateur 2026-03-29. |
| 4 | Vérifier que le résultat gratuit s’affiche bien | [ ] | |
| 5 | Vérifier que le score a du sens | [ ] | |
| 6 | Vérifier que les 3 priorités sont cohérentes | [ ] | |
| 7 | Vérifier que le plan 30 jours est compréhensible | [ ] | |
| 8 | Vérifier que les disclaimers apparaissent bien | [ ] | |
| 9 | Tester le passage vers le rapport complet | [ ] | |
| 10 | Tester le paiement Stripe | [ ] | |
| 11 | Vérifier que le rapport complet se débloque réellement | [ ] | |
| 12 | Vérifier que le PDF est téléchargeable | [ ] | |
| 13 | Vérifier que les gabarits sont bien accessibles | [ ] | |
| 14 | Vérifier le courriel utilisateur après auto-évaluation | [ ] | |
| 15 | Vérifier le courriel admin nouveau lead | [ ] | |
| 16 | Vérifier le courriel utilisateur après paiement | [ ] | |
| 17 | Vérifier le courriel admin paiement confirmé | [ ] | |
| 18 | Vérifier que le lien vers contact / appel fonctionne | [ ] | |

**Synthèse finale**

- [ ] Corriger tout ce qui crée de la friction avant de promouvoir

---

## Journal (détail par point)

### Point 1 — Faire l’auto-évaluation complète une première fois

- **À faire :** parcourir le wizard du début à la fin (environnement proche de la prod : staging ou prod), sans raccourcir les étapes.
- **Critère de fait :** parcours terminé jusqu’à l’écran de résultat gratuit (et noter tout blocage).
- **Notes :** parcours mené jusqu’au bout ; rien de bloquant signalé ; impression globale positive.

### Point 2 — Vérifier que les questions sont claires

- **À faire :** relire mentalement ou à froid les libellés ; noter toute question ambiguë ou trop technique.
- **Critère de fait :** une personne PME / marketing comprend chaque question sans aide externe.
- **Notes :** libellés revus (sections A–F + questions) pour un ton plus simple ; validé pour l’étape 03.

### Point 3 — Vérifier que le temps réel ressemble à 8–12 minutes

- **À faire :** chronométrer un parcours complet (lecture normale, sans se presser), du début du wizard jusqu’au résultat gratuit.
- **Critère de fait :** durée entre **8 et 12 minutes** (cible marketing documentée).
- **Notes :** chronométrage OK ; durée perçue conforme à la fourchette 8–12 minutes.

### Point 4 — Vérifier que le résultat gratuit s’affiche bien

- **À faire :** après le wizard, vérifier l’écran résultat gratuit : mise en page, mobile, textes lisibles, rien de coupé ou d’erreur visible.
- **Critère de fait :** score / niveau / priorités / plan 30 jours (selon l’offre) apparaissent clairement sans bug d’affichage.
- **Notes :** *(à remplir)*

---

## Décisions prises (étape 03)

- À documenter au fil des correctifs ou choix produit.

## Livrables

- Tunnel validé ou liste de correctifs prioritaires avant promotion.
- Cases Étape 3 cochées dans la checklist maître.

## Statut global

- **Statut :** en cours — point 4.
- **Dernière mise à jour :** 2026-03-29.
- **Prochaine action :** valider l’**affichage du résultat gratuit** (**point 4**) — desktop + mobile si possible.

# Etape 12 - Kit suivi des leads

Ce dossier regroupe les outils operationnels pour suivre les leads Loi 25 et convertir vers Starter/Pro.

## Fichiers
- `leads_pipeline_loi25.csv`: pipeline principal de suivi.
- `fiche-lead-modele.md`: fiche complete pour qualifier un lead.
- `script-appel-20-min-loi25.md`: trame d'appel de qualification.
- `script-relance-apres-appel.md`: trame de relance J+1 et J+4.
- `gabarit-proposition-starter.md`: proposition Starter prete a adapter.
- `gabarit-proposition-pro.md`: proposition Pro prete a adapter.

## Routine conseillee
1. Ajouter chaque nouveau lead du wizard dans `leads_pipeline_loi25.csv`.
2. Completer la fiche lead avant ou juste apres l'appel.
3. Mettre a jour le statut pipeline apres chaque action.
4. Ne jamais laisser un lead sans `prochaine_action` et `date_prochaine_action`.
5. Mettre le pipeline a jour au minimum 2 fois par semaine.

## Regle de mapping rapide
- Auto-evaluation soumise + `paymentStatus=unpaid` -> `Nouveau lead`
- Rapport debloque + `paymentStatus=paid` -> `Rapport achete`
- Appel confirme -> `Appel reserve`
- Offre envoyee -> `Proposition envoyee`
- Signature/accord -> `Gagne`
- Refus/inactif > 30 jours -> `Perdu`

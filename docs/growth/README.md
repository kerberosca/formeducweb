# Distribution low-ticket — mode d’emploi

Ce dossier transforme le plan de relance en routine exécutable pendant 45 jours,
sans publicité, prospection automatisée ni nouvelle série d’articles génériques.

## Ordre de marche

1. Lire [le playbook](./playbook-distribution.md).
2. Préparer les 18 contenus à partir du
   [calendrier](./calendrier-45-jours.csv), une semaine à la fois.
3. Générer le lien de chaque publication avec
   `node scripts/growth/generate-utm.mjs`.
4. Publier manuellement sur YouTube Shorts, LinkedIn et Facebook.
5. Consacrer 15 minutes par jour aux réponses publiques utiles.
6. Exporter uniquement des événements agrégables, sans données personnelles,
   puis produire le rapport avec `node scripts/growth/aggregate-funnel.mjs`.
7. N’envisager OpenClaw qu’après la première semaine manuelle et uniquement
   selon [le guide supervisé](./openclaw-supervise.md).

## Garde-fous non négociables

- Aucun scraping.
- Aucun message privé automatisé.
- Aucun commentaire ou réponse automatisé.
- Aucun accès OpenClaw à Stripe, au courriel, aux comptes sociaux ou aux
  données client.
- Une personne relit et approuve chaque publication.
- Un seul appel à l’action par publication : le diagnostic IA.
- Aucun nouvel article générique pendant les six semaines.

## Commandes hors ligne

```powershell
node scripts/growth/generate-utm.mjs --source linkedin --week 2 --slot lundi
node scripts/growth/aggregate-funnel.mjs .\export-evenements.csv
node --test scripts/growth/growth-tools.node-test.mjs
```

Les scripts ne publient rien, ne se connectent à aucun service et n’envoient
aucune donnée sur Internet.

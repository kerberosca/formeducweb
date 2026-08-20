# Contexte de la revue de durcissement

- Analyse : `hardening_final`
- Scan Codex Security : `4febef57-4e2a-4fb8-8469-5b7387db3657`
- Révision Git observée : `e487cda3045c55ae9f9de1db358bb4fa954c6bef`
- Empreinte de l'instantané : `codex-security-snapshot/v1:sha256:be0f8b949ccb41d17e4c190bcb29a366c9e13c8aaa88fde79177e62170c39347`
- Dossier local du scan : `C:\Users\dbouc\AppData\Local\Temp\codex-security-scans-7znjfb\FormeducWeb\e487cda3045c55ae9f9de1db358bb4fa954c6bef_20260808T221940Z_odhbmwff`
- Couverture : complète; dix constats validés, aucun travail différé.

Le scan a couvert l'authentification par lien courriel, les rôles, les parcours
apprenants et administratifs, les ressources protégées, les quiz et certificats,
les diagnostics historiques, Stripe, les formulaires publics, le rendu JSON-LD,
la version historique de Demo839, Prisma/SQLite et l'isolation Docker locale.

Les constats se répartissent entre autorisation, révocation, intégrité des états
de paiement, validation de documents Office, sérialisation HTML sûre et limites
de consommation. Le portefeuille dérivé recommande des correctifs locaux
centralisés; il ne modifie pas et ne remplace pas les artefacts scellés du scan.

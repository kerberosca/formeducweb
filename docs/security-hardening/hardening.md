# Security Hardening Review: FormeducWeb

## Evidence Basis

Cette revue dérive du scan Codex Security complet
`4febef57-4e2a-4fb8-8469-5b7387db3657`, scellé sur l'instantané de travail
`be0f8b94…c39347`. J'ai relu les frontières concernées : authentification et
rôles, autorisation des ressources LMS, quiz et certificats, documents Office,
checkout historique, états Stripe, formulaires anonymes, limitation de débit et
JSON-LD. Le code de travail a ensuite commencé à évoluer pour les correctifs;
`sourceDrift` est donc volontairement marqué `present`.

## Constraints

Nous devons préserver SQLite, le commerce historique et tous ses identifiants,
prix, jetons et URL. Le profil local reste sur loopback avec Stripe et Resend
désactivés. Aucun résultat de performance n'est inventé : les changements
recommandés n'ajoutent ni service, ni hop réseau, ni copie de données générale.

## Opportunity Portfolio

Aucune transformation architecturale distincte ne se justifie. Les dix constats
se ferment complètement aux frontières déjà propriétaires du contrôle : un
normaliseur d'identité réseau partagé, une sérialisation JSON-LD sûre, une
validation OOXML commune, des prédicats d'autorisation complets et une machine
d'état de paiement monotone. Nous pouvons ainsi réduire le risque de dérive sans
introduire de nouveau composant opérationnel.

## Recommendation Summary

Je recommande la remédiation locale centralisée. Son attrait est qu'elle rend les
invariants explicites exactement là où les effets privilégiés se produisent,
tout en conservant les contrats publics et les données historiques. Une passerelle
de sécurité, un service de fichiers séparé ou une nouvelle plateforme de paiement
ne deviendraient préférables que si FormeducWeb passait à plusieurs instances,
à plusieurs proxys ou à un stockage distribué; rien dans le périmètre local actuel
ne justifie ce coût de migration.

La validation doit prouver les déclencheurs malveillants et les contrôles légitimes
sur les mêmes interfaces, puis repasser les tests globaux, le build et les parcours
Docker. Cette analyse ne prétend pas, à elle seule, que les constats sont corrigés.

## Next Decisions

Avant un déploiement public futur, il faudra choisir et documenter le proxy de
confiance, le stockage partagé des ressources et le moteur de files/limites pour
un environnement multi-instance. Pour le portail local demandé, les correctifs
ciblés et leurs tests constituent la solution proportionnée.

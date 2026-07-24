# OpenClaw — guide d’utilisation supervisée

OpenClaw n’est pas requis pour lancer la campagne. La première semaine doit être
réalisée manuellement afin d’établir le ton, les sources acceptables et le temps
réel de production. Ce guide n’installe ni ne configure OpenClaw.

Documentation de référence :

- [documentation OpenClaw](https://docs.openclaw.ai/)
- [sécurité](https://docs.openclaw.ai/security)
- [coûts d’utilisation](https://docs.openclaw.ai/reference/api-usage-costs)

Vérifier ces pages avant toute expérimentation, car le produit et ses options
peuvent évoluer.

## Périmètre permis après la semaine 1

Un seul agent isolé peut :

- surveiller une liste blanche de sources officielles publiques;
- proposer un brouillon de script écran + voix;
- décliner un brouillon pour les trois plateformes;
- préparer les liens UTM avec le script local;
- résumer un export de tunnel déjà anonymisé et agrégé;
- produire une liste de contenus à faire approuver.

Toute sortie est un brouillon. Une personne vérifie la source, les faits, le ton,
le CTA et l’absence de renseignements sensibles avant publication.

## Périmètre interdit

L’agent ne reçoit jamais :

- de nom, courriel, téléphone, entreprise ou réponse de diagnostic;
- d’accès Stripe, Resend, boîte courriel ou CRM;
- de cookie, session, mot de passe ou clé de réseau social;
- de droit de publication, commentaire, réaction ou message privé;
- de permission de scraper des profils, groupes ou discussions;
- d’accès en écriture au site de production;
- d’instruction visant à contourner une limite de plateforme.

Il ne doit jamais générer de témoignage, résultat client, expertise, source ou
statistique fictive.

## Budget et isolement

- Budget maximal : 20 $ CAD par mois, alerte à 15 $ et arrêt à 20 $.
- Un seul agent et une seule file de travail.
- Modèle le moins coûteux donnant une qualité acceptable.
- Limite stricte du nombre de brouillons par semaine.
- Dossier de travail distinct ne contenant que les sources publiques, les
  gabarits et les agrégats autorisés.
- Aucun secret dans les invites, fichiers, journaux ou variables de
  l’environnement de l’agent.
- Journaux conservés sans données personnelles et revus chaque semaine.

## Liste blanche de sources initiale

- [Guide canadien sur l’IA générative](https://www.canada.ca/fr/gouvernement/systeme/gouvernement-numerique/innovations-gouvernementales-numeriques/utilisation-responsable-ai/guide-utilisation-intelligence-artificielle-generative.html)
- [Protection et sécurité des applications d’aide à l’IA — Canada.ca](https://conception.canada.ca/directives/ia/protection-securite.html)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [Centre canadien pour la cybersécurité](https://www.cyber.gc.ca/fr/)
- [Commission d’accès à l’information du Québec](https://www.cai.gouv.qc.ca/)
- [Règles de la LCAP — CRTC](https://crtc.gc.ca/eng/internet/anti/reg.htm)

Toute nouvelle source doit être ajoutée manuellement à la liste blanche.

## Flux d’approbation

```text
Source officielle autorisée
  → brouillon OpenClaw
  → vérification humaine de la source
  → retrait des données sensibles
  → validation du CTA et des UTM
  → approbation explicite
  → publication manuelle
```

Une absence de réponse humaine équivaut à un refus de publication.

## Critères d’arrêt

Suspendre immédiatement l’agent s’il :

- demande ou tente d’utiliser un accès interdit;
- dépasse l’alerte budgétaire sans explication;
- cite une source introuvable;
- produit du contenu au nom d’un client;
- tente une publication ou une interaction automatisée;
- inclut une donnée identifiable dans un journal ou un brouillon.

Après un arrêt, examiner les journaux, supprimer les données interdites,
révoquer tout secret potentiellement exposé et ne reprendre qu’après une
validation humaine du périmètre.

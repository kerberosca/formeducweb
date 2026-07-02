# Convention UTM - Loi 25

## Regle simple
- Toujours en minuscules.
- Toujours avec des tirets (pas d'espaces, pas d'accents).
- 3 champs minimum: `utm_source`, `utm_medium`, `utm_campaign`.
- 2 champs optionnels: `utm_content`, `utm_term`.

## Mapping officiel des sources
- Google organique: pas de UTM (la source remonte automatiquement via analytics/search console).
- Facebook organique: `utm_source=facebook` `utm_medium=organic-social`
- LinkedIn: `utm_source=linkedin` `utm_medium=organic-social`
- Direct: pas de UTM.
- Google Ads: `utm_source=google` `utm_medium=cpc`
- Meta Ads: `utm_source=meta` `utm_medium=cpc`

## Format campagne
`utm_campaign=loi25-<canal>-<objectif>-<aaaa-mm>`

Exemples:
- `loi25-facebook-decouverte-2026-04`
- `loi25-linkedin-generation-leads-2026-04`
- `loi25-googleads-intention-forte-2026-04`
- `loi25-metaads-diagnostic-2026-04`

## Exemples d'URL
Facebook organique:
`/loi-25?utm_source=facebook&utm_medium=organic-social&utm_campaign=loi25-facebook-decouverte-2026-04&utm_content=post-epingle`

LinkedIn organique:
`/loi-25?utm_source=linkedin&utm_medium=organic-social&utm_campaign=loi25-linkedin-generation-leads-2026-04&utm_content=post-faq-01`

Google Ads:
`/loi-25?utm_source=google&utm_medium=cpc&utm_campaign=loi25-googleads-intention-forte-2026-04&utm_term=loi-25-pme`

Meta Ads:
`/loi-25?utm_source=meta&utm_medium=cpc&utm_campaign=loi25-metaads-diagnostic-2026-04&utm_content=visuel-gratuit-vs-complet`

## Regle d'attribution pratique (hebdo)
- Si UTM present: utiliser `utm_source`.
- Si pas de UTM et referer Google: `Google organique`.
- Si pas de UTM et referer Facebook: `Facebook organique`.
- Si pas de UTM et referer LinkedIn: `LinkedIn`.
- Si pas de referer: `Direct`.
- Si `utm_medium=cpc` avec source Google: `Google Ads`.
- Si `utm_medium=cpc` avec source Meta/Facebook/Instagram: `Meta Ads`.

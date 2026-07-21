function looksMojibake(value: string) {
  // Markers seen in single and double UTF-8 mis-decoding.
  return /(?:\u00C3|\u00C2|\uFFFD|\u00E2\u20AC)/.test(value);
}

function decodeLatin1AsUtf8(value: string) {
  const bytes = Uint8Array.from(
    Array.from(value).map((character) => character.charCodeAt(0))
  );
  return new TextDecoder("utf-8").decode(bytes);
}

const frenchTextReplacements: Array<[RegExp, string]> = [
  [/entr\?es/g, "entrées"],
  [/entr\?e/g, "entrée"],
  [/param\?tres/g, "paramètres"],
  [/entra\?nement/g, "entraînement"],
  [/p\?riodique/g, "périodique"],
  [/dat\?es/g, "datées"],
  [/dat\?e/g, "datée"],
  [/d\?cision/g, "décision"],
  [/\?tre/g, "être"],
  [/m\?canismes/g, "mécanismes"],
  [/r\?sultat/g, "résultat"],
  [/enqu\?tes/g, "enquêtes"],
  [/probl\?mes/g, "problèmes"],
  [/sauvégarde/g, "sauvegarde"],
  [/reçuperer/g, "récupérer"],
  [/\bDefinir\b/g, "Définir"],
  [/\bRediger\b/g, "Rédiger"],
  [/\bRedigez\b/g, "Rédigez"],
  [/\bVerifiez\b/g, "Vérifiez"],
  [/\bVerifier\b/g, "Vérifier"],
  [/\bDesignez\b/g, "Désignez"],
  [/\bDefaut\b/g, "Défaut"],
  [/\bsecurite\b/g, "sécurité"],
  [/\bSecurite\b/g, "Sécurité"],
  [/\bSECURITE\b/g, "SÉCURITÉ"],
  [/\bconfidentialite\b/g, "confidentialité"],
  [/\bConfidentialite\b/g, "Confidentialité"],
  [/\bCONFIDENTIALITE\b/g, "CONFIDENTIALITÉ"],
  [/\bdonnees\b/g, "données"],
  [/\bDonnees\b/g, "Données"],
  [/\bDONNEES\b/g, "DONNÉES"],
  [/\bparametres\b/g, "paramètres"],
  [/\bParametres\b/g, "Paramètres"],
  [/\bentrainement\b/g, "entraînement"],
  [/\butilises\b/g, "utilisés"],
  [/\butilisees\b/g, "utilisées"],
  [/\brésultat IA utilise avec\b/g, "résultat IA utilisé avec"],
  [/\bentrees\b/g, "entrées"],
  [/\bentree\b/g, "entrée"],
  [/\bemployes\b/g, "employés"],
  [/\bapprouve\b/g, "approuvé"],
  [/\bapprouves\b/g, "approuvés"],
  [/\bperiodique\b/g, "périodique"],
  [/\bregulierement\b/g, "régulièrement"],
  [/\bdatee\b/g, "datée"],
  [/\bdatees\b/g, "datées"],
  [/\bdecision\b/g, "décision"],
  [/\bdecisions\b/g, "décisions"],
  [/\bqualite\b/g, "qualité"],
  [/\bprobleme\b/g, "problème"],
  [/\bproblemes\b/g, "problèmes"],
  [/\bcritere\b/g, "critère"],
  [/\bsucces\b/g, "succès"],
  [/\bdedie\b/g, "dédié"],
  [/\bnumeros\b/g, "numéros"],
  [/\bdetails\b/g, "détails"],
  [/\bverifie\b/g, "vérifié"],
  [/\bverifiee\b/g, "vérifiée"],
  [/\bverifiees\b/g, "vérifiées"],
  [/\bverifies\b/g, "vérifiés"],
  [/\bmethode\b/g, "méthode"],
  [/\banonymises\b/g, "anonymisés"],
  [/\bnecessaire\b/g, "nécessaire"],
  [/\bfantome\b/g, "fantôme"],
  [/\bcout\b/g, "coût"],
  [/\bcouts\b/g, "coûts"],
  [/\bgeres\b/g, "gérés"],
  [/\bdeparts\b/g, "départs"],
  [/\brecu\b/g, "reçu"],
  [/\brealite\b/g, "réalité"],
  [/\bsauve\b/g, "sauvé"],
  [/\bdetecte\b/g, "détecté"],
  [/\bdetectes\b/g, "détectés"],
  [/\becart\b/g, "écart"],
  [/\becarts\b/g, "écarts"],
  [/\bpriorite\b/g, "priorité"],
  [/\bpriorites\b/g, "priorités"],
  [/\bPRIORITES\b/g, "PRIORITÉS"],
  [/\bmecanisme\b/g, "mécanisme"],
  [/\bmecanismes\b/g, "mécanismes"],
  [/\bMECANISMES\b/g, "MÉCANISMES"],
  [/\bcontrole\b/g, "contrôle"],
  [/\bcontroles\b/g, "contrôles"],
  [/\bdegrader\b/g, "dégrader"],
  [/\bresultat\b/g, "résultat"],
  [/\bresultats\b/g, "résultats"],
  [/\bacces\b/g, "accès"],
  [/\bACCES\b/g, "ACCÈS"],
  [/\breduire\b/g, "réduire"],
  [/\bReduire\b/g, "Réduire"],
  [/\betre\b/g, "être"],
  [/\ba ne\b/g, "à ne"],
  [/\ba resoudre\b/g, "à résoudre"],
  [/\ba changer\b/g, "à changer"],
  [/\ba fermer\b/g, "à fermer"],
  [/\ba recuperer\b/g, "à récupérer"],
  [/\ba verifier\b/g, "à vérifier"],
  [/\ba eviter\b/g, "à éviter"],
  [/\b1 a 3\b/g, "1 à 3"],
  [/ \? /g, " à "]
];

function repairFrenchText(value: string) {
  return frenchTextReplacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    value
  );
}

export function repairText(value: string) {
  let current = value;

  if (!looksMojibake(value)) {
    return repairFrenchText(current);
  }

  try {
    // Multi-pass decode for double-encoded content.
    for (let pass = 0; pass < 5; pass += 1) {
      if (!looksMojibake(current)) break;
      const decoded = decodeLatin1AsUtf8(current);
      if (decoded === current) break;
      current = decoded;
    }

    return repairFrenchText(current);
  } catch {
    return repairFrenchText(value);
  }
}

export function deepRepairText<T>(value: T): T {
  if (typeof value === "string") {
    return repairText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepRepairText(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepRepairText(item)])
    ) as T;
  }

  return value;
}

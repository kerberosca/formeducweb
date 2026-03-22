function looksMojibake(value: string) {
  // Markers seen in single and double UTF-8 mis-decoding.
  return /(?:\u00C3|\u00C2|\uFFFD|\u00E2\u20AC)/.test(value);
}

function decodeLatin1AsUtf8(value: string) {
  const bytes = Uint8Array.from(Array.from(value).map((character) => character.charCodeAt(0)));
  return new TextDecoder("utf-8").decode(bytes);
}

export function repairText(value: string) {
  if (!looksMojibake(value)) {
    return value;
  }

  try {
    let current = value;

    // Multi-pass decode for double-encoded content.
    for (let pass = 0; pass < 5; pass += 1) {
      if (!looksMojibake(current)) break;
      const decoded = decodeLatin1AsUtf8(current);
      if (decoded === current) break;
      current = decoded;
    }

    return current;
  } catch {
    return value;
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

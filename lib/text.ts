function looksMojibake(value: string) {
  return /Ã|Â|â€™|â€“|â€œ|â€/.test(value);
}

export function repairText(value: string) {
  if (!looksMojibake(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(Array.from(value).map((character) => character.charCodeAt(0)));
    return new TextDecoder("utf-8").decode(bytes);
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

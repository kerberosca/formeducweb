type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type JsonLdProps = {
  id: string;
  value: JsonLdValue;
};

const HTML_UNSAFE_JSON_CHARACTERS = /[<>&\u2028\u2029]/g;
const HTML_SAFE_JSON_ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};

export function serializeJsonLd(value: JsonLdValue) {
  return JSON.stringify(value).replace(
    HTML_UNSAFE_JSON_CHARACTERS,
    (character) => HTML_SAFE_JSON_ESCAPES[character]
  );
}

export function JsonLd({ id, value }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }}
    />
  );
}

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type JsonLdProps = {
  id: string;
  value: JsonLdValue;
};

export function JsonLd({ id, value }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // JSON-LD payload is static content, serialized once on render.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }}
    />
  );
}

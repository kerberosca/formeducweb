import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JsonLd } from "@/components/seo/json-ld";

describe("JsonLd", () => {
  it("conserve les données tout en neutralisant les délimiteurs HTML", () => {
    const dangerousName =
      "</script><script>globalThis.__jsonLdInjected = true</script>&\u2028\u2029";
    const markup = renderToStaticMarkup(
      <JsonLd id="security-regression" value={{ name: dangerousName }} />
    );

    expect(markup.match(/<script/g)).toHaveLength(1);
    expect(markup).not.toContain("</script><script>");
    expect(markup).toContain("\\u003c/script\\u003e");
    expect(markup).toContain("\\u003cscript\\u003e");
    expect(markup).toContain("\\u0026");
    expect(markup).toContain("\\u2028\\u2029");

    const serialized = markup.match(/<script[^>]*>([\s\S]*)<\/script>/)?.[1];
    expect(serialized).toBeTruthy();
    expect(JSON.parse(serialized!)).toEqual({ name: dangerousName });
  });
});

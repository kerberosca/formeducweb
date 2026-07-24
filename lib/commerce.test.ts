import { describe, expect, it } from "vitest";

import {
  ACCESS_DURATION_DAYS,
  getDefaultProductCode,
  getEntitlementTypes,
  getProduct,
  isProductCode,
  resolveProductCode,
  validateProductForAssessment
} from "@/lib/commerce";

describe("commerce product catalog", () => {
  it("uses the public CAD amounts", () => {
    expect(getProduct("loi25_kit").amountCents).toBe(2900);
    expect(getProduct("cyber_kit").amountCents).toBe(2900);
    expect(getProduct("ai_kit").amountCents).toBe(2900);
    expect(getProduct("digital_hygiene_trio").amountCents).toBe(5900);
    expect(getProduct("trio_upgrade").amountCents).toBe(3000);
    expect(ACCESS_DURATION_DAYS).toBe(730);
  });

  it("keeps backward-compatible kit defaults", () => {
    expect(getDefaultProductCode("loi25")).toBe("loi25_kit");
    expect(getDefaultProductCode("cybersecurity")).toBe("cyber_kit");
    expect(getDefaultProductCode("ai")).toBe("ai_kit");
    expect(resolveProductCode(undefined, "ai")).toBe("ai_kit");
  });

  it("rejects unknown codes and mismatched individual kits", () => {
    expect(isProductCode("digital_hygiene_trio")).toBe(true);
    expect(isProductCode("free_report")).toBe(false);
    expect(() =>
      validateProductForAssessment("ai_kit", "cybersecurity")
    ).toThrow("PRODUCT_ASSESSMENT_MISMATCH");
  });

  it("grants one individual right, three trio rights and two upgrade rights", () => {
    expect(
      getEntitlementTypes({
        productCode: "cyber_kit",
        assessmentType: "cybersecurity"
      })
    ).toEqual(["cybersecurity"]);
    expect(
      getEntitlementTypes({
        productCode: "digital_hygiene_trio",
        assessmentType: "ai"
      })
    ).toEqual(["loi25", "cybersecurity", "ai"]);
    expect(
      getEntitlementTypes({
        productCode: "trio_upgrade",
        assessmentType: "ai"
      })
    ).toEqual(["loi25", "cybersecurity"]);
  });
});

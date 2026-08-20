import { readFile } from "node:fs/promises";

import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { LmsError } from "@/lib/lms/errors";
import {
  type AllowedResourceExtension,
  validateResourceFileContents
} from "@/lib/lms/resources";

const officeKinds = [
  {
    extension: ".docx",
    mainPath: "word/document.xml",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"
  },
  {
    extension: ".xlsx",
    mainPath: "xl/workbook.xml",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"
  },
  {
    extension: ".pptx",
    mainPath: "ppt/presentation.xml",
    contentType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"
  }
] as const;

function minimalOfficeArchive(input: (typeof officeKinds)[number]) {
  return Buffer.from(
    zipSync({
      "[Content_Types].xml": strToU8(
        `<Types><Override PartName="/${input.mainPath}" ContentType="${input.contentType}"/></Types>`
      ),
      "_rels/.rels": strToU8("<Relationships />"),
      [input.mainPath]: strToU8("<document />")
    })
  );
}

describe("validateResourceFileContents", () => {
  it.each(officeKinds)(
    "accepte un véritable conteneur $extension minimal",
    (officeKind) => {
      expect(() =>
        validateResourceFileContents(
          minimalOfficeArchive(officeKind),
          officeKind.extension
        )
      ).not.toThrow();
    }
  );

  it("refuse un ZIP générique renommé en XLSX", () => {
    const genericArchive = Buffer.from(
      zipSync({ "notes.txt": strToU8("Ce fichier n'est pas un classeur.") })
    );

    expect(() =>
      validateResourceFileContents(genericArchive, ".xlsx")
    ).toThrowError(
      expect.objectContaining<Partial<LmsError>>({
        code: "resource_content_mismatch",
        status: 415
      })
    );
  });

  it("refuse un conteneur Office qui embarque un exécutable", () => {
    const officeKind = officeKinds[1];
    const maliciousArchive = Buffer.from(
      zipSync({
        "[Content_Types].xml": strToU8(
          `<Types><Override PartName="/${officeKind.mainPath}" ContentType="${officeKind.contentType}"/></Types>`
        ),
        "_rels/.rels": strToU8("<Relationships />"),
        [officeKind.mainPath]: strToU8("<workbook />"),
        "xl/embeddings/payload.exe": new Uint8Array([0x4d, 0x5a])
      })
    );

    expect(() =>
      validateResourceFileContents(
        maliciousArchive,
        ".xlsx" as AllowedResourceExtension
      )
    ).toThrowError(/type permis/i);
  });

  it("accepte le classeur de pratique livré par le dépôt", async () => {
    const workbook = await readFile(
      "data/lms-resources/excel-essentiel-pratique.xlsx"
    );

    expect(() => validateResourceFileContents(workbook, ".xlsx")).not.toThrow();
  });

  it("refuse toute relation OOXML externe", () => {
    const officeKind = officeKinds[1];
    const maliciousArchive = Buffer.from(
      zipSync({
        "[Content_Types].xml": strToU8(
          `<Types><Override PartName="/${officeKind.mainPath}" ContentType="${officeKind.contentType}"/></Types>`
        ),
        "_rels/.rels": strToU8(
          '<Relationships><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com/payload" TargetMode="External"/></Relationships>'
        ),
        [officeKind.mainPath]: strToU8("<workbook />")
      })
    );

    expect(() =>
      validateResourceFileContents(maliciousArchive, officeKind.extension)
    ).toThrowError(/type permis/i);
  });

  it.each([
    "xl/embeddings/payload.bin",
    "xl/activeX/activeX1.bin",
    "customUI/customUI.xml",
    "word/embeddings/package.xlsx"
  ])("refuse le composant OOXML actif ou embarqué %s", (entryName) => {
    const officeKind = officeKinds[1];
    const maliciousArchive = Buffer.from(
      zipSync({
        "[Content_Types].xml": strToU8(
          `<Types><Override PartName="/${officeKind.mainPath}" ContentType="${officeKind.contentType}"/></Types>`
        ),
        "_rels/.rels": strToU8("<Relationships />"),
        [officeKind.mainPath]: strToU8("<workbook />"),
        [entryName]: strToU8("payload")
      })
    );

    expect(() =>
      validateResourceFileContents(maliciousArchive, officeKind.extension)
    ).toThrowError(/type permis/i);
  });

  it("refuse un manifeste qui déclare un objet OLE ou un paquet embarqué", () => {
    const officeKind = officeKinds[0];
    const maliciousArchive = Buffer.from(
      zipSync({
        "[Content_Types].xml": strToU8(
          `<Types><Override PartName="/${officeKind.mainPath}" ContentType="${officeKind.contentType}"/><Override PartName="/word/payload.bin" ContentType="application/vnd.openxmlformats-officedocument.oleObject"/></Types>`
        ),
        "_rels/.rels": strToU8("<Relationships />"),
        [officeKind.mainPath]: strToU8("<document />"),
        "word/payload.bin": strToU8("payload")
      })
    );

    expect(() =>
      validateResourceFileContents(maliciousArchive, officeKind.extension)
    ).toThrowError(/type permis/i);
  });

  it("refuse tout XML OOXML mal formé", () => {
    const officeKind = officeKinds[2];
    const malformedArchive = Buffer.from(
      zipSync({
        "[Content_Types].xml": strToU8(
          `<Types><Override PartName="/${officeKind.mainPath}" ContentType="${officeKind.contentType}"/></Types>`
        ),
        "_rels/.rels": strToU8("<Relationships>"),
        [officeKind.mainPath]: strToU8("<presentation />")
      })
    );

    expect(() =>
      validateResourceFileContents(malformedArchive, officeKind.extension)
    ).toThrowError(/type permis/i);
  });
});

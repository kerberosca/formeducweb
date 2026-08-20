import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";

import { unzipSync } from "fflate";

import { db } from "@/lib/db";
import {
  ALLOWED_RESOURCE_MIME_TYPES,
  MAX_RESOURCE_BYTES
} from "@/lib/lms/constants";
import { requireActiveEnrollment } from "@/lib/lms/enrollments";
import { LmsError } from "@/lib/lms/errors";

export type AllowedResourceExtension = keyof typeof ALLOWED_RESOURCE_MIME_TYPES;

function getResourceRoot() {
  const configuredRoot = process.env.LMS_RESOURCE_ROOT?.trim();
  if (configuredRoot) {
    return path.resolve(/*turbopackIgnore: true*/ configuredRoot);
  }

  return process.env.NODE_ENV === "production"
    ? "/data/lms-resources"
    : path.join(process.cwd(), "data", "lms-resources");
}

function isInside(parent: string, candidate: string) {
  const relative = path.relative(parent, candidate);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

function validateStorageKey(storageKey: string) {
  if (
    !storageKey ||
    storageKey.length > 512 ||
    storageKey.includes("\0") ||
    storageKey.includes("\\") ||
    path.isAbsolute(storageKey)
  ) {
    throw new LmsError(
      409,
      "La ressource est mal configurée.",
      "invalid_storage_key"
    );
  }

  const segments = storageKey.split("/");
  if (
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new LmsError(
      409,
      "La ressource est mal configurée.",
      "invalid_storage_key"
    );
  }
}

function isPrivateOrLocalHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal") ||
    normalized === "::1" ||
    (normalized.includes(":") &&
      (normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe80:")))
  ) {
    return true;
  }

  const ipv4 = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return !normalized.includes(".") && !normalized.includes(":");
  const octets = ipv4.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return true;
  return (
    octets[0] === 0 ||
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

export function getSafeExternalResourceUrl(value: string | null) {
  if (!value || value.length > 2_000) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !url.hostname ||
      isPrivateOrLocalHostname(url.hostname)
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function normalizedMimeType(value: string) {
  return value.split(";", 1)[0].trim().toLowerCase();
}

function startsWithBytes(data: Buffer, signature: readonly number[]) {
  return signature.every((byte, index) => data[index] === byte);
}

const OFFICE_MAIN_PARTS: Partial<
  Record<AllowedResourceExtension, { path: string; contentType: string }>
> = {
  ".docx": {
    path: "word/document.xml",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"
  },
  ".xlsx": {
    path: "xl/workbook.xml",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"
  },
  ".pptx": {
    path: "ppt/presentation.xml",
    contentType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"
  }
};

const BLOCKED_ARCHIVE_ENTRY =
  /(?:^|\/)(?:[^/]+\.)?(?:exe|dll|com|bat|cmd|ps1|msi|js|mjs|cjs|html?|svg|zip|rar|7z|tar|gz|bz2|xz)$/i;
const BLOCKED_OFFICE_PART =
  /(?:^|\/)(?:activex|customui|embeddings|externallinks)(?:\/|$)/i;
const BLOCKED_OFFICE_CONTENT_TYPE =
  /(?:activex|oleobject|vbaproject|customui|vnd\.ms-package|officedocument\.package)/i;
const BLOCKED_OFFICE_RELATIONSHIP_TYPE =
  /(?:oleobject|package|control|activex|customui|vbaproject|externallink|attachedtemplate)/i;
const MAX_OFFICE_XML_BYTES = 64 * 1024 * 1024;
const XML_DECODER = new TextDecoder("utf-8", { fatal: true });

type XmlElementVisitor = (
  name: string,
  attributes: ReadonlyMap<string, string>,
  depth: number
) => void;

function xmlLocalName(name: string) {
  return name.slice(name.lastIndexOf(":") + 1);
}

function isXmlNameStart(character: string | undefined) {
  return Boolean(character && /[A-Za-z_:]/.test(character));
}

function isXmlNameCharacter(character: string | undefined) {
  return Boolean(character && /[A-Za-z0-9_.:-]/.test(character));
}

function readXmlName(xml: string, start: number) {
  if (!isXmlNameStart(xml[start])) throw new Error("invalid_xml_name");
  let end = start + 1;
  while (isXmlNameCharacter(xml[end])) end += 1;
  return { name: xml.slice(start, end), end };
}

function isValidXmlCodePoint(codePoint: number) {
  return (
    codePoint === 0x09 ||
    codePoint === 0x0a ||
    codePoint === 0x0d ||
    (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
    (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
    (codePoint >= 0x10000 && codePoint <= 0x10ffff)
  );
}

function decodeXmlEntities(value: string) {
  let decoded = "";
  let position = 0;

  while (position < value.length) {
    const ampersand = value.indexOf("&", position);
    if (ampersand === -1) return decoded + value.slice(position);
    decoded += value.slice(position, ampersand);
    const semicolon = value.indexOf(";", ampersand + 1);
    if (semicolon === -1) throw new Error("invalid_xml_entity");
    const entity = value.slice(ampersand + 1, semicolon);
    const predefined: Record<string, string> = {
      amp: "&",
      lt: "<",
      gt: ">",
      apos: "'",
      quot: '"'
    };

    if (entity in predefined) {
      decoded += predefined[entity];
    } else if (/^#\d+$/.test(entity) || /^#x[0-9a-f]+$/i.test(entity)) {
      const codePoint =
        entity[1]?.toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      if (!isValidXmlCodePoint(codePoint)) {
        throw new Error("invalid_xml_code_point");
      }
      decoded += String.fromCodePoint(codePoint);
    } else {
      throw new Error("invalid_xml_entity");
    }
    position = semicolon + 1;
  }

  return decoded;
}

function decodeOfficeXml(data: Uint8Array) {
  const decoded = XML_DECODER.decode(data);
  if (decoded.includes("\0")) throw new Error("invalid_xml_character");
  return decoded.charCodeAt(0) === 0xfeff ? decoded.slice(1) : decoded;
}

function validateXmlDocument(xml: string, visit?: XmlElementVisitor) {
  const stack: string[] = [];
  let index = 0;
  let rootSeen = false;
  let rootClosed = false;
  let xmlDeclarationSeen = false;

  const skipWhitespace = () => {
    while (/\s/.test(xml[index] ?? "")) index += 1;
  };

  const validateText = (value: string) => {
    if (value.includes("]]>")) throw new Error("invalid_cdata_terminator");
    decodeXmlEntities(value);
    if (stack.length === 0 && value.trim()) {
      throw new Error("text_outside_root");
    }
  };

  while (index < xml.length) {
    const opening = xml.indexOf("<", index);
    if (opening === -1) {
      validateText(xml.slice(index));
      index = xml.length;
      break;
    }
    validateText(xml.slice(index, opening));
    index = opening;

    if (xml.startsWith("<!--", index)) {
      const end = xml.indexOf("-->", index + 4);
      if (end === -1 || xml.slice(index + 4, end).includes("--")) {
        throw new Error("invalid_xml_comment");
      }
      index = end + 3;
      continue;
    }

    if (xml.startsWith("<![CDATA[", index)) {
      if (stack.length === 0) throw new Error("cdata_outside_root");
      const end = xml.indexOf("]]>", index + 9);
      if (end === -1) throw new Error("invalid_xml_cdata");
      index = end + 3;
      continue;
    }

    if (xml.startsWith("<?", index)) {
      const end = xml.indexOf("?>", index + 2);
      if (end === -1) throw new Error("invalid_xml_processing_instruction");
      const body = xml.slice(index + 2, end).trim();
      const target = readXmlName(body, 0).name;
      if (target.toLowerCase() === "xml") {
        if (rootSeen || xmlDeclarationSeen || stack.length > 0) {
          throw new Error("invalid_xml_declaration");
        }
        xmlDeclarationSeen = true;
      }
      index = end + 2;
      continue;
    }

    if (xml.startsWith("<!", index)) {
      // OOXML never requires DTDs; rejecting all declarations also prevents XXE.
      throw new Error("xml_declaration_not_allowed");
    }

    if (xml.startsWith("</", index)) {
      index += 2;
      const closing = readXmlName(xml, index);
      index = closing.end;
      skipWhitespace();
      if (xml[index] !== ">" || stack.pop() !== closing.name) {
        throw new Error("mismatched_xml_element");
      }
      index += 1;
      if (stack.length === 0) rootClosed = true;
      continue;
    }

    index += 1;
    if (rootClosed) throw new Error("multiple_xml_roots");
    const openingName = readXmlName(xml, index);
    const name = openingName.name;
    index = openingName.end;
    const attributes = new Map<string, string>();
    let selfClosing = false;

    while (index < xml.length) {
      const beforeWhitespace = index;
      skipWhitespace();
      const hadWhitespace = index > beforeWhitespace;

      if (xml.startsWith("/>", index)) {
        selfClosing = true;
        index += 2;
        break;
      }
      if (xml[index] === ">") {
        index += 1;
        break;
      }
      if (!hadWhitespace) throw new Error("invalid_xml_attribute_spacing");

      const attributeName = readXmlName(xml, index);
      index = attributeName.end;
      skipWhitespace();
      if (xml[index] !== "=") throw new Error("invalid_xml_attribute");
      index += 1;
      skipWhitespace();
      const quote = xml[index];
      if (quote !== '"' && quote !== "'") {
        throw new Error("unquoted_xml_attribute");
      }
      index += 1;
      const end = xml.indexOf(quote, index);
      if (end === -1) throw new Error("unterminated_xml_attribute");
      const rawValue = xml.slice(index, end);
      if (rawValue.includes("<")) throw new Error("invalid_xml_attribute");
      if (attributes.has(attributeName.name)) {
        throw new Error("duplicate_xml_attribute");
      }
      attributes.set(attributeName.name, decodeXmlEntities(rawValue));
      index = end + 1;
    }

    if (index > xml.length) throw new Error("unterminated_xml_element");
    if (!rootSeen) rootSeen = true;
    visit?.(name, attributes, stack.length);
    if (!selfClosing) stack.push(name);
    else if (stack.length === 0) rootClosed = true;
  }

  if (!rootSeen || stack.length !== 0) throw new Error("invalid_xml_document");
}

function getXmlAttribute(
  attributes: ReadonlyMap<string, string>,
  expectedName: string
) {
  for (const [name, value] of attributes) {
    if (xmlLocalName(name).toLowerCase() === expectedName.toLowerCase()) {
      return value;
    }
  }
  return undefined;
}

function isExternalRelationshipTarget(target: string) {
  const normalized = target.trim();
  return (
    normalized.startsWith("//") ||
    normalized.startsWith("\\\\") ||
    /^[a-z][a-z0-9+.-]*:/i.test(normalized)
  );
}

function validateOfficeOpenXml(
  data: Buffer,
  extension: AllowedResourceExtension
) {
  const expected = OFFICE_MAIN_PARTS[extension];
  if (!expected) return false;

  const entryNames = new Set<string>();
  const caseInsensitiveEntryNames = new Set<string>();
  let totalExpandedBytes = 0;
  let totalXmlBytes = 0;
  let entryCount = 0;

  let selected: Record<string, Uint8Array>;
  try {
    selected = unzipSync(data, {
      filter(file) {
        entryCount += 1;
        totalExpandedBytes += file.originalSize;
        const normalizedName = file.name.replace(/\\/g, "/");
        const caseInsensitiveName = normalizedName.toLowerCase();

        if (
          entryCount > 10_000 ||
          totalExpandedBytes > 250 * 1024 * 1024 ||
          normalizedName.startsWith("/") ||
          normalizedName.includes("\0") ||
          normalizedName.split("/").some((segment) => segment === "..") ||
          BLOCKED_ARCHIVE_ENTRY.test(normalizedName) ||
          BLOCKED_OFFICE_PART.test(normalizedName) ||
          /(?:^|\/)vbaProject\.bin$/i.test(normalizedName)
        ) {
          throw new Error("blocked_office_archive");
        }

        if (caseInsensitiveEntryNames.has(caseInsensitiveName)) {
          throw new Error("duplicate_office_archive_entry");
        }

        entryNames.add(normalizedName);
        caseInsensitiveEntryNames.add(caseInsensitiveName);
        const isXml =
          normalizedName === "[Content_Types].xml" ||
          normalizedName.endsWith(".xml") ||
          normalizedName.endsWith(".rels");
        if (!isXml) return false;
        totalXmlBytes += file.originalSize;
        if (totalXmlBytes > MAX_OFFICE_XML_BYTES) {
          throw new Error("office_xml_too_large");
        }
        return true;
      }
    });
  } catch {
    return false;
  }

  const contentTypes = selected["[Content_Types].xml"];
  if (!contentTypes) return false;
  let expectedMainPartDeclared = false;

  try {
    for (const [entryName, contents] of Object.entries(selected)) {
      const normalizedName = entryName.replace(/\\/g, "/");
      let rootElement: string | null = null;
      validateXmlDocument(
        decodeOfficeXml(contents),
        (name, attributes, depth) => {
          const localName = xmlLocalName(name);
          if (depth === 0) rootElement = localName;

          if (
            normalizedName === "[Content_Types].xml" &&
            (localName === "Override" || localName === "Default")
          ) {
            const contentType =
              getXmlAttribute(attributes, "ContentType") ?? "";
            if (BLOCKED_OFFICE_CONTENT_TYPE.test(contentType)) {
              throw new Error("blocked_office_content_type");
            }
            if (
              localName === "Override" &&
              getXmlAttribute(attributes, "PartName") === `/${expected.path}` &&
              contentType === expected.contentType
            ) {
              expectedMainPartDeclared = true;
            }
            if (
              localName === "Default" &&
              getXmlAttribute(attributes, "Extension")?.toLowerCase() ===
                expected.path.split(".").at(-1)?.toLowerCase() &&
              contentType === expected.contentType
            ) {
              expectedMainPartDeclared = true;
            }
          }

          if (
            normalizedName.endsWith(".rels") &&
            localName === "Relationship"
          ) {
            const targetMode = getXmlAttribute(attributes, "TargetMode");
            const target = getXmlAttribute(attributes, "Target") ?? "";
            const relationshipType = getXmlAttribute(attributes, "Type") ?? "";
            if (
              targetMode?.trim().toLowerCase() === "external" ||
              isExternalRelationshipTarget(target) ||
              BLOCKED_OFFICE_RELATIONSHIP_TYPE.test(relationshipType)
            ) {
              throw new Error("blocked_office_relationship");
            }
          }
        }
      );

      if (normalizedName === "[Content_Types].xml" && rootElement !== "Types") {
        throw new Error("invalid_content_types_root");
      }
      if (normalizedName.endsWith(".rels") && rootElement !== "Relationships") {
        throw new Error("invalid_relationships_root");
      }
    }
  } catch {
    return false;
  }

  return (
    entryNames.has("[Content_Types].xml") &&
    entryNames.has("_rels/.rels") &&
    entryNames.has(expected.path) &&
    expectedMainPartDeclared
  );
}

export function validateResourceFileContents(
  data: Buffer,
  extension: AllowedResourceExtension
) {
  const isExecutable =
    startsWithBytes(data, [0x4d, 0x5a]) ||
    startsWithBytes(data, [0x7f, 0x45, 0x4c, 0x46]);
  if (isExecutable) {
    throw new LmsError(
      415,
      "Les fichiers exécutables ne sont pas permis.",
      "resource_content_not_allowed"
    );
  }

  let valid = true;
  if (extension === ".pdf") {
    valid = data.subarray(0, 5).toString("ascii") === "%PDF-";
  } else if (extension === ".png") {
    valid = startsWithBytes(
      data,
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    );
  } else if (extension === ".jpg" || extension === ".jpeg") {
    valid = startsWithBytes(data, [0xff, 0xd8, 0xff]);
  } else if ([".docx", ".xlsx", ".pptx"].includes(extension)) {
    valid = validateOfficeOpenXml(data, extension);
  } else if (extension === ".txt" || extension === ".csv") {
    const sample = data.subarray(0, Math.min(data.byteLength, 8_192));
    const text = sample
      .toString("utf8")
      .replace(/^\uFEFF/, "")
      .trimStart();
    valid =
      !sample.includes(0) &&
      !/^<!doctype\s+html[\s>]/i.test(text) &&
      !/^<html[\s>]/i.test(text) &&
      !/^<svg[\s>]/i.test(text);
  }

  if (!valid) {
    throw new LmsError(
      415,
      "Le contenu du fichier ne correspond pas au type permis.",
      "resource_content_mismatch"
    );
  }
}

function validateFileMetadata(input: {
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
}) {
  if (!input.fileName || !input.mimeType) {
    throw new LmsError(
      409,
      "La ressource est incomplète.",
      "resource_not_ready"
    );
  }
  const extension = path
    .extname(input.fileName)
    .toLowerCase() as AllowedResourceExtension;
  const allowedMimeTypes = ALLOWED_RESOURCE_MIME_TYPES[extension] as
    | readonly string[]
    | undefined;
  const mimeType = normalizedMimeType(input.mimeType);

  if (!allowedMimeTypes?.includes(mimeType)) {
    throw new LmsError(
      415,
      "Ce type de fichier n’est pas permis.",
      "resource_type_not_allowed"
    );
  }
  if (
    input.sizeBytes !== null &&
    (input.sizeBytes < 0 || input.sizeBytes > MAX_RESOURCE_BYTES)
  ) {
    throw new LmsError(
      413,
      "Cette ressource dépasse la limite de 25 Mo.",
      "resource_too_large"
    );
  }
  return { extension, mimeType, fileName: path.basename(input.fileName) };
}

export async function getResourceForUser(userId: string, resourceId: string) {
  const resource = await db.courseResource.findFirst({
    where: {
      id: resourceId,
      archivedAt: null,
      OR: [
        { lessonId: null },
        {
          lesson: {
            status: "published",
            archivedAt: null,
            module: { archivedAt: null }
          }
        }
      ]
    },
    include: {
      lesson: {
        select: { module: { select: { courseId: true } } }
      }
    }
  });

  // Deliberately use the same response for missing resources and guessed IDs.
  if (!resource) {
    throw new LmsError(
      404,
      "La ressource est introuvable.",
      "resource_not_found"
    );
  }
  await requireActiveEnrollment(userId, resource.courseId);

  if (
    resource.lesson &&
    resource.lesson.module.courseId !== resource.courseId
  ) {
    throw new LmsError(
      409,
      "La ressource est mal configurée.",
      "resource_course_mismatch"
    );
  }

  if (resource.kind === "link") {
    const url = getSafeExternalResourceUrl(resource.externalUrl);
    if (!url) {
      throw new LmsError(
        409,
        "Le lien de la ressource est invalide.",
        "unsafe_resource_url"
      );
    }
    return { kind: "redirect" as const, url };
  }

  if (resource.kind !== "file" || !resource.storageKey) {
    throw new LmsError(
      409,
      "La ressource est incomplète.",
      "resource_not_ready"
    );
  }

  validateStorageKey(resource.storageKey);
  const metadata = validateFileMetadata(resource);
  if (path.extname(resource.storageKey).toLowerCase() !== metadata.extension) {
    throw new LmsError(
      409,
      "La ressource est mal configurée.",
      "resource_extension_mismatch"
    );
  }
  const configuredRoot = getResourceRoot();
  const candidate = path.resolve(
    configuredRoot,
    ...resource.storageKey.split("/")
  );
  if (!isInside(configuredRoot, candidate)) {
    throw new LmsError(
      409,
      "La ressource est mal configurée.",
      "invalid_storage_key"
    );
  }

  let resolvedRoot: string;
  let resolvedFile: string;
  try {
    [resolvedRoot, resolvedFile] = await Promise.all([
      realpath(/*turbopackIgnore: true*/ configuredRoot),
      realpath(/*turbopackIgnore: true*/ candidate)
    ]);
  } catch {
    throw new LmsError(
      404,
      "Le fichier est introuvable.",
      "resource_file_missing"
    );
  }
  if (!isInside(resolvedRoot, resolvedFile)) {
    throw new LmsError(
      409,
      "La ressource est mal configurée.",
      "resource_path_escape"
    );
  }

  const fileStat = await stat(/*turbopackIgnore: true*/ resolvedFile);
  if (!fileStat.isFile()) {
    throw new LmsError(
      404,
      "Le fichier est introuvable.",
      "resource_file_missing"
    );
  }
  if (fileStat.size > MAX_RESOURCE_BYTES) {
    throw new LmsError(
      413,
      "Cette ressource dépasse la limite de 25 Mo.",
      "resource_too_large"
    );
  }
  if (resource.sizeBytes !== null && resource.sizeBytes !== fileStat.size) {
    throw new LmsError(
      409,
      "L’intégrité de la ressource ne peut pas être confirmée.",
      "resource_size_mismatch"
    );
  }

  const data = await readFile(/*turbopackIgnore: true*/ resolvedFile);
  validateResourceFileContents(data, metadata.extension);

  return {
    kind: "file" as const,
    data,
    fileName: metadata.fileName,
    mimeType: metadata.mimeType,
    sizeBytes: fileStat.size
  };
}

export function contentDispositionAttachment(fileName: string) {
  const ascii =
    fileName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9._-]/g, "_")
      .slice(0, 180) || "ressource";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

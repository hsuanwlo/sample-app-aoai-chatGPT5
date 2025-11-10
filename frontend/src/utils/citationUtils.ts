import { Citation } from "../api";

const urlPropertyNames = ["url", "Url", "URL", "source", "Source", "SOURCE", "href", "Href", "HREF", "link", "Link", "LINK"];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const findUrlInObject = (value: unknown): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (urlPropertyNames.includes(key) && typeof nestedValue === "string" && nestedValue.startsWith("http")) {
      return nestedValue;
    }

    if (typeof nestedValue === "string" && nestedValue.startsWith("http")) {
      return nestedValue;
    }

    const nestedResult = findUrlInObject(nestedValue);
    if (nestedResult) {
      return nestedResult;
    }
  }

  return null;
};

const extractUrlFromString = (value: string): string | null => {
  const urlMatch = value.match(/https?:\/\/[^\s"')]+/);
  return urlMatch ? urlMatch[0] : null;
};

const tryParseJson = (value: string): unknown | null => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const deriveCitationUrl = (citation: Citation): string | null => {
  if (citation.url && citation.url.startsWith("http")) {
    return citation.url;
  }

  if (citation.metadata) {
    const parsedMetadata = tryParseJson(citation.metadata);
    const metadataUrl = isRecord(parsedMetadata) ? findUrlInObject(parsedMetadata) : null;
    if (metadataUrl) {
      return metadataUrl;
    }

    const fallbackUrl = extractUrlFromString(citation.metadata);
    if (fallbackUrl) {
      return fallbackUrl;
    }
  }

  if (citation.content) {
    const parsedContent = tryParseJson(citation.content);
    const contentUrl = isRecord(parsedContent) ? findUrlInObject(parsedContent) : null;
    if (contentUrl) {
      return contentUrl;
    }

    const fallbackUrl = extractUrlFromString(citation.content);
    if (fallbackUrl) {
      return fallbackUrl;
    }
  }

  if (citation.filepath && citation.filepath.startsWith("http")) {
    return citation.filepath;
  }

  return null;
};

export const buildCitationDisplayText = (
  citation: Citation,
  partIndex: number,
  truncateLimit: number,
  truncate: boolean
): string => {
  const derivedUrl = deriveCitationUrl(citation);
  if (derivedUrl) {
    return derivedUrl;
  }

  if (citation.filepath) {
    if (truncate && citation.filepath.length > truncateLimit) {
      const citationLength = citation.filepath.length;
      return `${citation.filepath.substring(0, 20)}...${citation.filepath.substring(citationLength - 20)} - Part ${partIndex}`;
    }

    return `${citation.filepath} - Part ${partIndex}`;
  }

  if (citation.title) {
    return `${citation.title} - Part ${partIndex}`;
  }

  return `Citation ${partIndex}`;
};

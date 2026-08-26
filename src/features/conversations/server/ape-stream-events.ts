export type ApeSourceKind = "knowledge" | "web";

export type ApeSourceProvenance =
  | "knowledge"
  | "web"
  | "knowledge_and_web"
  | "none";

export type ApeClaimEvidence = {
  citation_index: number;
  chunk_id?: string | null;
};

export type ApeAnswerClaim = {
  claim_id: string;
  text: string;
  grounded: boolean;
  verification: "supported" | "unverified" | "unsupported";
  evidence?: ApeClaimEvidence[];
};

export type ApeCitationSnapshot = {
  chunk_id?: string | null;
  document_id?: string | null;
  filename: string;
  excerpt?: string | null;
  page_number?: number | null;
  chunk_index?: number | null;
  source_title?: string | null;
  source_type?: string | null;
  source_published_date?: string | null;
  source_kind?: ApeSourceKind;
  web_title?: string | null;
  web_url?: string | null;
  web_retrieved_at?: string | null;
  web_provider?: string | null;
};

export type ApeDoneEvent = {
  event?: "done";
  assistant_message_id: string;
  citations: ApeCitationSnapshot[];
  claims: ApeAnswerClaim[];
  grounded: boolean;
  insufficient_evidence_reason: string | null;
  source_provenance: ApeSourceProvenance;
};

export type ApeTokenEvent = {
  event?: string;
  delta?: string;
};

export type ApeErrorEvent = {
  event?: string;
  message?: string;
};

export type ApeEnvelope<T> = {
  success?: boolean;
  data?: T | null;
  error?: { code?: string; message?: string; request_id?: string };
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function asApeDoneEvent(data: unknown): ApeDoneEvent | undefined {
  if (
    !isRecord(data) ||
    (data.event !== undefined && data.event !== "done") ||
    typeof data.assistant_message_id !== "string" ||
    !UUID_PATTERN.test(data.assistant_message_id) ||
    !Array.isArray(data.citations) ||
    !data.citations.every(isApeCitationSnapshot) ||
    !Array.isArray(data.claims) ||
    !data.claims.every(isApeAnswerClaim) ||
    typeof data.grounded !== "boolean" ||
    !isNullableString(data.insufficient_evidence_reason) ||
    !isApeSourceProvenance(data.source_provenance)
  ) {
    return undefined;
  }

  return data as ApeDoneEvent;
}

export function tokenDeltaFrom(data: unknown): string | undefined {
  if (!isRecord(data) || typeof data.delta !== "string") {
    return undefined;
  }

  return data.delta;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CLAIM_VERIFICATIONS = new Set([
  "supported",
  "unverified",
  "unsupported",
]);

const SOURCE_PROVENANCE = new Set([
  "knowledge",
  "web",
  "knowledge_and_web",
  "none",
]);

function isApeSourceProvenance(value: unknown): value is ApeSourceProvenance {
  return typeof value === "string" && SOURCE_PROVENANCE.has(value);
}

function isApeCitationSnapshot(value: unknown): value is ApeCitationSnapshot {
  if (!isRecord(value) || typeof value.filename !== "string") {
    return false;
  }

  if (
    value.source_kind !== undefined &&
    value.source_kind !== "knowledge" &&
    value.source_kind !== "web"
  ) {
    return false;
  }

  return (
    isOptionalNullableString(value.chunk_id) &&
    isOptionalNullableString(value.document_id) &&
    isOptionalNullableString(value.excerpt) &&
    isOptionalNullableNumber(value.page_number) &&
    isOptionalNullableNumber(value.chunk_index) &&
    isOptionalNullableString(value.source_title) &&
    isOptionalNullableString(value.source_type) &&
    isOptionalNullableString(value.source_published_date) &&
    isOptionalNullableString(value.web_title) &&
    isOptionalNullableString(value.web_url) &&
    isOptionalNullableString(value.web_retrieved_at) &&
    isOptionalNullableString(value.web_provider)
  );
}

function isApeAnswerClaim(value: unknown): value is ApeAnswerClaim {
  return (
    isRecord(value) &&
    typeof value.claim_id === "string" &&
    typeof value.text === "string" &&
    typeof value.grounded === "boolean" &&
    typeof value.verification === "string" &&
    CLAIM_VERIFICATIONS.has(value.verification) &&
    (value.evidence === undefined ||
      (Array.isArray(value.evidence) &&
        value.evidence.every(isApeClaimEvidence)))
  );
}

function isApeClaimEvidence(value: unknown): value is ApeClaimEvidence {
  return (
    isRecord(value) &&
    Number.isInteger(value.citation_index) &&
    typeof value.citation_index === "number" &&
    value.citation_index >= 1 &&
    isOptionalNullableString(value.chunk_id)
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isOptionalNullableString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === "string";
}

function isOptionalNullableNumber(value: unknown): boolean {
  return value === undefined || value === null || typeof value === "number";
}

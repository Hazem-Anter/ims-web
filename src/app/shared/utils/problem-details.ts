export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  extensions?: {
    errors?: Record<string, string[]>;
    [key: string]: unknown;
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

export function toErrorMessage(errBody: unknown): string {
  const bodyRecord = asRecord(errBody);
  const title = bodyRecord?.['title'];
  const detail = bodyRecord?.['detail'];

  if (typeof title === 'string' && typeof detail === 'string') {
    const combined = `${title}: ${detail}`;
    return combined.length > 220 ? title : combined;
  }
  if (typeof title === 'string') return title;
  if (typeof detail === 'string') {
    const detailMessage = detail;
    return detailMessage.length > 220 ? 'Request failed. Please try again.' : detailMessage;
  }

  // sometimes backend returns plain string (e.g. Unauthorized("Invalid setup key."))
  if (typeof errBody === 'string') {
    if (errBody.length > 220) return 'Request failed. Please try again.';
    return errBody;
  }

  return 'Unexpected error occurred.';
}

export function getValidationErrors(errBody: unknown): Record<string, string[]> | null {
  const bodyRecord = asRecord(errBody);
  const extensions = asRecord(bodyRecord?.['extensions']);
  const errors = extensions?.['errors'];

  if (typeof errors !== 'object' || errors === null) {
    return null;
  }

  const normalized: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      normalized[key] = value.map((item) => String(item));
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

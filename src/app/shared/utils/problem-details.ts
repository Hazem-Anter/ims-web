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

export function toErrorMessage(errBody: any): string {
  const title = errBody?.title;
  const detail = errBody?.detail;

  if (title && detail) return `${title}: ${detail}`;
  if (title) return title;
  if (detail) return detail;

  // sometimes backend returns plain string (e.g. Unauthorized("Invalid setup key."))
  if (typeof errBody === 'string') return errBody;

  return 'Unexpected error occurred.';
}

export function getValidationErrors(errBody: any): Record<string, string[]> | null {
  return errBody?.extensions?.errors ?? null;
}

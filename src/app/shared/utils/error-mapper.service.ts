import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toErrorMessage } from './problem-details';

@Injectable({ providedIn: 'root' })
export class ErrorMapper {
  toMessage(err: unknown, fallback = 'Request failed.'): string {
    if (err instanceof Error && err.message) return err.message;

    if (err instanceof HttpErrorResponse) {
      return toErrorMessage(err.error);
    }

    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'error' in (err as Record<string, unknown>)) {
      const value = (err as { error: unknown }).error;
      const mapped = toErrorMessage(value);
      return mapped || fallback;
    }

    return fallback;
  }
}

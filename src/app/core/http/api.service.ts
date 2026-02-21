import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { API_BASE } from '../config/api.config';

type ApiOptions = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  context?: HttpContext;
  withCredentials?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = API_BASE;

  constructor(private http: HttpClient) {}

  get<T>(path: string, options?: ApiOptions) {
    return this.http.get<T>(this.resolve(path), options);
  }

  post<T>(path: string, body?: unknown, options?: ApiOptions) {
    return this.http.post<T>(this.resolve(path), body, options);
  }

  put<T>(path: string, body?: unknown, options?: ApiOptions) {
    return this.http.put<T>(this.resolve(path), body, options);
  }

  patch<T>(path: string, body?: unknown, options?: ApiOptions) {
    return this.http.patch<T>(this.resolve(path), body, options);
  }

  delete<T>(path: string, options?: ApiOptions) {
    return this.http.delete<T>(this.resolve(path), options);
  }

  private resolve(path: string) {
    if (path.startsWith('http')) return path;
    const separator = path.startsWith('/') ? '' : '/';
    return `${this.baseUrl}${separator}${path}`;
  }
}

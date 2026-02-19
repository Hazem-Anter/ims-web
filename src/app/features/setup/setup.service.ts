import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { InitializeSystemRequest } from './setup.models';

@Injectable({ providedIn: 'root' })
export class SetupService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  initialize(req: InitializeSystemRequest, setupKey: string) {
    const key = setupKey?.trim();
    const headers = new HttpHeaders().set('X-Setup-Key', key);
    return this.http.post<boolean>(`${this.base}/api/setup/initialize`, req, { headers });
  }
}

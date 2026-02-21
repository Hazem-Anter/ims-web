import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { InitializeSystemRequest } from './setup.models';
import { ApiService } from '../../core/http/api.service';
import { API_ENDPOINTS } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class SetupService {
  constructor(private api: ApiService) {}

  initialize(req: InitializeSystemRequest, setupKey: string) {
    const key = setupKey?.trim();
    const headers = new HttpHeaders().set('X-Setup-Key', key);
    return this.api.post<boolean>(API_ENDPOINTS.auth.setup, req, { headers });
  }
}

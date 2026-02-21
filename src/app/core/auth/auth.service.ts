import { Injectable } from '@angular/core';
import { tap, mapTo } from 'rxjs';
import { SessionStore } from './session.store';
import { AuthResponse, MeResponse } from './auth.models';
import { ApiService } from '../http/api.service';
import { API_ENDPOINTS } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private session: SessionStore) {}

  login(email: string, password: string) {
    return this.api
      .post<AuthResponse>(API_ENDPOINTS.auth.login, { email, password })
      .pipe(tap(res => this.session.setFromLogin(res)));
  }

  loadMe() {
    return this.api
      .get<MeResponse>(API_ENDPOINTS.auth.me)
      .pipe(
        tap(me => this.session.setMe(me)),
        mapTo(true)
      );
  }

  getToken() {
    return this.session.token();
  }

  getUser() {
    return this.session.me();
  }

  getRoles() {
    return this.session.roles();
  }

  isAuthenticated() {
    return this.session.isAuthenticated();
  }

  hasRole(...roles: string[]) {
    return this.session.hasRole(...roles);
  }

  logout() {
    this.session.clear();
  }
}

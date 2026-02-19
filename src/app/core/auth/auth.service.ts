import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, mapTo } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionStore } from './session.store';
import { AuthResponse, MeResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private session: SessionStore) {}

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/api/auth/login`, { email, password })
      .pipe(tap(res => this.session.setFromLogin(res)));
  }

  loadMe() {
    return this.http
      .get<MeResponse>(`${this.base}/api/auth/me`)
      .pipe(tap(me => this.session.setMe(me)), mapTo(true));
  }

  logout() {
    this.session.clear();
  }
}

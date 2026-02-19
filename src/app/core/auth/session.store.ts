import { Injectable, signal, computed } from '@angular/core';
import { AuthResponse, MeResponse } from './auth.models';

const TOKEN_KEY = 'ims_token';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private _token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));
  private _me = signal<MeResponse | null>(null);
  private _roles = signal<string[]>([]);

  token = computed(() => this._token());
  me = computed(() => this._me());
  roles = computed(() => this._roles());

  isAuthenticated(): boolean {
    return !!this._token();
  }

  hasRole(...roles: string[]): boolean {
    const mine = this._roles();
    return roles.some(r => mine.includes(r));
  }

  setFromLogin(res: AuthResponse) {
    sessionStorage.setItem(TOKEN_KEY, res.accessToken);
    this._token.set(res.accessToken);

    const me: MeResponse = {
      userId: res.userId,
      email: res.email,
      roles: res.roles ?? []
    };

    this._me.set(me);
    this._roles.set(me.roles);
  }

  setMe(me: MeResponse) {
    this._me.set(me);
    this._roles.set(me.roles ?? []);
  }

  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._me.set(null);
    this._roles.set([]);
  }
}

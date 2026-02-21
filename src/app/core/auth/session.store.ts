import { Injectable, signal, computed } from '@angular/core';
import { AuthResponse, MeResponse } from './auth.models';

const TOKEN_KEY = 'ims_token';
const ME_KEY = 'ims_me';
const ROLES_KEY = 'ims_roles';

function parseMe(value: string | null): MeResponse | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && 'email' in parsed) {
      return {
        userId: String((parsed as MeResponse).userId),
        email: String((parsed as MeResponse).email),
        roles: Array.isArray((parsed as MeResponse).roles) ? (parsed as MeResponse).roles.map(String) : []
      };
    }
  } catch {
    return null;
  }
  return null;
}

function parseRoles(value: string | null, fallback?: string[]): string[] {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* ignore */
    }
  }
  return fallback ?? [];
}

function deriveMeFromToken(token: string | null): MeResponse | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    const roles =
      Array.isArray(payload['role']) ? payload['role'].map(String) :
      Array.isArray(payload['roles']) ? payload['roles'].map(String) : [];

    const userId = payload['sub'] ?? payload['userId'] ?? payload['nameid'];
    const email = payload['email'] ?? payload['unique_name'] ?? payload['upn'];

    if (!userId && !email) return null;

    return {
      userId: String(userId ?? email),
      email: String(email ?? userId),
      roles
    };
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly initialToken = localStorage.getItem(TOKEN_KEY);
  private readonly initialMe = parseMe(localStorage.getItem(ME_KEY)) ?? deriveMeFromToken(this.initialToken);
  private readonly initialRoles = parseRoles(localStorage.getItem(ROLES_KEY), this.initialMe?.roles);

  private _token = signal<string | null>(this.initialToken);
  private _me = signal<MeResponse | null>(this.initialMe);
  private _roles = signal<string[]>(this.initialRoles);

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
    const me: MeResponse = {
      userId: res.userId,
      email: res.email,
      roles: res.roles ?? []
    };

    this.persist(res.accessToken, me);
  }

  setMe(me: MeResponse) {
    this.persist(this._token(), me);
  }

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ME_KEY);
    localStorage.removeItem(ROLES_KEY);

    this._token.set(null);
    this._me.set(null);
    this._roles.set([]);
  }

  private persist(token: string | null, me: MeResponse | null) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      this._token.set(token);
    }

    if (me) {
      localStorage.setItem(ME_KEY, JSON.stringify(me));
      localStorage.setItem(ROLES_KEY, JSON.stringify(me.roles ?? []));
      this._me.set(me);
      this._roles.set(me.roles ?? []);
    }
  }
}

import { Injectable } from '@angular/core';
import { CanMatch, Route, Router } from '@angular/router';
import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanMatch {
  constructor(private session: SessionStore, private router: Router) {}

  canMatch(route: Route) {
    const roles = (route.data?.['roles'] as string[] | undefined) ?? [];
    if (roles.length === 0) return true;

    if (this.session.hasRole(...roles)) return true;

    this.router.navigateByUrl('/dashboard');
    return false;
  }
}

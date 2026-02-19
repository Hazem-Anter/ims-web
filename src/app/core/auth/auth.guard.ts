import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionStore } from './session.store';
import { AuthService } from './auth.service';
import { of, catchError, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private session: SessionStore,
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate() {
    if (!this.session.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return false;
    }

    if (this.session.me()) return true;

    return this.auth.loadMe().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigateByUrl('/login');
        return of(false);
      })
    );
  }
}

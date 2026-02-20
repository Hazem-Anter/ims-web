import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { toErrorMessage } from '../../shared/utils/problem-details';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const isLoginRequest = req.url.endsWith('/api/auth/login');

        if (isLoginRequest && (err.status === 400 || err.status === 401)) {
          return throwError(() => new Error('Invalid email or password.'));
        }

        if (err.status === 401 && !req.url.endsWith('/api/setup/initialize')) {
          this.auth.logout();
          this.router.navigateByUrl('/login');
        }

        return throwError(() => new Error(toErrorMessage(err.error)));
      })
    );
  }
}

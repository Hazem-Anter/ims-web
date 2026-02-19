import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { SessionStore } from '../auth/session.store';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private session: SessionStore) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.session.token();
    if (!token) return next.handle(req);

    return next.handle(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    );
  }
}

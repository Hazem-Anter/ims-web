import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { PagedResult } from '../../shared/utils/paging';
import { Observable, catchError, shareReplay, throwError, tap } from 'rxjs';
import { ApiService } from '../../core/http/api.service';

export interface UserListItemDto {
  id: number;
  email: string;
  userName: string;
  lockoutEnabled: boolean;
  lockoutEnd?: string | null;
}

export interface UserDetailsDto extends UserListItemDto {
  roles: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private rolesRequest$?: Observable<string[]>;

  constructor(private api: ApiService) {}

  list(search = '', page = 1, pageSize = 10) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.api.get<PagedResult<UserListItemDto>>(API_ENDPOINTS.admin.users, { params });
  }

  get(userId: number) {
    return this.api.get<UserDetailsDto>(`${API_ENDPOINTS.admin.users}/${userId}`);
  }

  create(req: CreateUserRequest) {
    return this.api.post(API_ENDPOINTS.admin.users, req);
  }

  assignRole(userId: number, role: string) {
    return this.api.post(`${API_ENDPOINTS.admin.users}/${userId}/roles/assign`, { role });
  }

  removeRole(userId: number, role: string) {
    return this.api.post(`${API_ENDPOINTS.admin.users}/${userId}/roles/remove`, { role });
  }

  resetPassword(userId: number, newPassword: string) {
    return this.api.post(`${API_ENDPOINTS.admin.users}/${userId}/password/reset`, { newPassword });
  }

  deactivate(userId: number) {
    return this.api.patch(`${API_ENDPOINTS.admin.users}/${userId}/deactivate`, {});
  }

  activate(userId: number) {
    return this.api.patch(`${API_ENDPOINTS.admin.users}/${userId}/activate`, {});
  }

  listRoles(forceRefresh = false) {
    if (forceRefresh || !this.rolesRequest$) {
      this.rolesRequest$ = this.api.get<string[]>(API_ENDPOINTS.admin.roles).pipe(
        shareReplay(1),
        catchError((error) => {
          this.rolesRequest$ = undefined;
          return throwError(() => error);
        })
      );
    }

    return this.rolesRequest$;
  }

  createRole(roleName: string) {
    return this.api.post(API_ENDPOINTS.admin.roles, { roleName }).pipe(
      tap(() => {
        this.rolesRequest$ = undefined;
      })
    );
  }

  deleteRole(roleName: string) {
    return this.api.delete(`${API_ENDPOINTS.admin.roles}/${encodeURIComponent(roleName)}`).pipe(
      tap(() => {
        this.rolesRequest$ = undefined;
      })
    );
  }
}

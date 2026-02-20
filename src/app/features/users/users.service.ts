import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE } from '../../core/config/api.config';
import { PagedResult } from '../../shared/utils/paging';

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
  constructor(private http: HttpClient) {}

  list(search = '', page = 1, pageSize = 10) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<PagedResult<UserListItemDto>>(`${API_BASE}/api/admin/users`, { params });
  }

  get(userId: number) {
    return this.http.get<UserDetailsDto>(`${API_BASE}/api/admin/users/${userId}`);
  }

  create(req: CreateUserRequest) {
    return this.http.post(`${API_BASE}/api/admin/users`, req);
  }

  assignRole(userId: number, role: string) {
    return this.http.post(`${API_BASE}/api/admin/users/${userId}/roles/assign`, { role });
  }

  removeRole(userId: number, role: string) {
    return this.http.post(`${API_BASE}/api/admin/users/${userId}/roles/remove`, { role });
  }

  resetPassword(userId: number, newPassword: string) {
    return this.http.post(`${API_BASE}/api/admin/users/${userId}/password/reset`, { newPassword });
  }

  deactivate(userId: number) {
    return this.http.patch(`${API_BASE}/api/admin/users/${userId}/deactivate`, {});
  }

  activate(userId: number) {
    return this.http.patch(`${API_BASE}/api/admin/users/${userId}/activate`, {});
  }

  listRoles() {
    return this.http.get<string[]>(`${API_BASE}/api/admin/roles`);
  }

  createRole(roleName: string) {
    return this.http.post(`${API_BASE}/api/admin/roles`, { roleName });
  }

  deleteRole(roleName: string) {
    return this.http.delete(`${API_BASE}/api/admin/roles/${encodeURIComponent(roleName)}`);
  }
}

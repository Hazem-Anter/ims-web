import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE } from '../../core/config/api.config';
import { PagedResult } from '../../shared/utils/paging';

export interface UserRow {
  id: string;
  email: string;
  userName: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  list(page = 1, pageSize = 10, search = '') {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<UserRow>>(`${API_BASE}/api/admin/users`, { params });
  }
}

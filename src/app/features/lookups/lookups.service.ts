import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { API_ENDPOINTS } from '../../core/config/api.config';

export interface LookupItem {
  id: number;
  name: string;
  code?: string | null;
}

export interface ProductLookupDto extends LookupItem {
  sku?: string | null;
}
export type WarehouseLookupDto = LookupItem;
export type LocationLookupDto = LookupItem;

@Injectable({ providedIn: 'root' })
export class LookupsService {
  private readonly cache = new Map<string, Observable<LookupItem[]>>();

  constructor(private api: ApiService) {}

  private getCached<T extends LookupItem>(key: string, factory: () => Observable<T[]>, forceRefresh = false) {
    if (forceRefresh) {
      this.cache.delete(key);
    }

    const cached = this.cache.get(key);
    if (cached) {
      return cached as Observable<T[]>;
    }

    const request$ = factory().pipe(
      shareReplay(1),
      catchError((error) => {
        this.cache.delete(key);
        return throwError(() => error);
      })
    );

    this.cache.set(key, request$ as Observable<LookupItem[]>);
    return request$;
  }

  products(search?: string, isActive?: boolean | null, take = 200, forceRefresh = false) {
    let params = new HttpParams().set('take', take);
    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('activeOnly', isActive);

    const key = `products|${search?.trim() ?? ''}|${String(isActive)}|${take}`;
    return this.getCached(
      key,
      () => this.api.get<ProductLookupDto[]>(API_ENDPOINTS.lookups.products, { params }),
      forceRefresh
    );
  }

  warehouses(isActive?: boolean | null, take = 200, forceRefresh = false) {
    let params = new HttpParams().set('take', take);
    if (isActive !== null && isActive !== undefined) params = params.set('activeOnly', isActive);

    const key = `warehouses|${String(isActive)}|${take}`;
    return this.getCached(
      key,
      () => this.api.get<WarehouseLookupDto[]>(API_ENDPOINTS.lookups.warehouses, { params }),
      forceRefresh
    );
  }

  locations(warehouseId: number, search?: string, isActive?: boolean | null, take = 200, forceRefresh = false) {
    let params = new HttpParams().set('take', take);
    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('activeOnly', isActive);

    const key = `locations|${warehouseId}|${search?.trim() ?? ''}|${String(isActive)}|${take}`;
    return this.getCached(
      key,
      () => this.api.get<LocationLookupDto[]>(`${API_ENDPOINTS.lookups.warehouses}/${warehouseId}/locations`, { params }),
      forceRefresh
    );
  }
}

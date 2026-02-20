import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ProductLookupDto {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
}

export interface WarehouseLookupDto {
  id: number;
  name: string;
  code: string;
}

export interface LocationLookupDto {
  id: number;
  code: string;
}

@Injectable({ providedIn: 'root' })
export class LookupsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  products(search?: string, activeOnly = true, take = 20) {
    let params = new HttpParams().set('activeOnly', activeOnly).set('take', take);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<ProductLookupDto[]>(`${this.base}/api/lookups/products`, { params });
  }

  warehouses(activeOnly = true) {
    const params = new HttpParams().set('activeOnly', activeOnly);
    return this.http.get<WarehouseLookupDto[]>(`${this.base}/api/lookups/warehouses`, { params });
  }

  locations(warehouseId: number, search?: string, activeOnly = true, take = 50) {
    let params = new HttpParams().set('activeOnly', activeOnly).set('take', take);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<LocationLookupDto[]>(
      `${this.base}/api/lookups/warehouses/${warehouseId}/locations`,
      { params }
    );
  }
}

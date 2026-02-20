import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../shared/utils/paging';

export interface WarehouseListItemDto {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export type WarehouseDetailsDto = WarehouseListItemDto;

export interface CreateWarehouseRequest {
  name: string;
  code: string;
}

export interface UpdateWarehouseRequest extends CreateWarehouseRequest {}

export interface CreateWarehouseResponse {
  warehouseId: number;
}

export interface LocationListItemDto {
  id: number;
  warehouseId: number;
  code: string;
  isActive: boolean;
}

export type LocationDetailsDto = LocationListItemDto;

@Injectable({ providedIn: 'root' })
export class WarehousesService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(search?: string, isActive?: boolean | null, page = 1, pageSize = 10) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('isActive', isActive);

    return this.http.get<PagedResult<WarehouseListItemDto>>(`${this.base}/api/warehouses`, { params });
  }

  getById(id: number) {
    return this.http.get<WarehouseDetailsDto>(`${this.base}/api/warehouses/${id}`);
  }

  create(req: CreateWarehouseRequest) {
    return this.http.post<CreateWarehouseResponse>(`${this.base}/api/warehouses`, req);
  }

  update(id: number, req: UpdateWarehouseRequest) {
    return this.http.put<{ warehouseId: number }>(`${this.base}/api/warehouses/${id}`, req);
  }

  activate(id: number) {
    return this.http.patch<void>(`${this.base}/api/warehouses/${id}/activate`, {});
  }

  deactivate(id: number) {
    return this.http.patch<void>(`${this.base}/api/warehouses/${id}/deactivate`, {});
  }

  listLocations(warehouseId: number, search?: string, isActive?: boolean | null) {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('isActive', isActive);

    return this.http.get<LocationListItemDto[]>(
      `${this.base}/api/warehouses/${warehouseId}/locations`,
      { params }
    );
  }

  getLocation(warehouseId: number, locationId: number) {
    return this.http.get<LocationDetailsDto>(
      `${this.base}/api/warehouses/${warehouseId}/locations/${locationId}`
    );
  }

  createLocation(warehouseId: number, code: string) {
    return this.http.post<{ locationId: number }>(
      `${this.base}/api/warehouses/${warehouseId}/locations`,
      { code }
    );
  }

  updateLocation(warehouseId: number, locationId: number, code: string) {
    return this.http.put<{ locationId: number }>(
      `${this.base}/api/warehouses/${warehouseId}/locations/${locationId}`,
      { code }
    );
  }

  activateLocation(warehouseId: number, locationId: number) {
    return this.http.patch<void>(
      `${this.base}/api/warehouses/${warehouseId}/locations/${locationId}/activate`,
      {}
    );
  }

  deactivateLocation(warehouseId: number, locationId: number) {
    return this.http.patch<void>(
      `${this.base}/api/warehouses/${warehouseId}/locations/${locationId}/deactivate`,
      {}
    );
  }
}

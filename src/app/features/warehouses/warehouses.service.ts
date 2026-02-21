import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { PagedResult } from '../../shared/utils/paging';
import { ApiService } from '../../core/http/api.service';
import { API_ENDPOINTS } from '../../core/config/api.config';

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
  constructor(private api: ApiService) {}

  list(search?: string, isActive?: boolean | null, page = 1, pageSize = 10) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('isActive', isActive);

    return this.api.get<PagedResult<WarehouseListItemDto>>(API_ENDPOINTS.warehouses, { params });
  }

  getById(id: number) {
    return this.api.get<WarehouseDetailsDto>(`${API_ENDPOINTS.warehouses}/${id}`);
  }

  create(req: CreateWarehouseRequest) {
    return this.api.post<CreateWarehouseResponse>(API_ENDPOINTS.warehouses, req);
  }

  update(id: number, req: UpdateWarehouseRequest) {
    return this.api.put<{ warehouseId: number }>(`${API_ENDPOINTS.warehouses}/${id}`, req);
  }

  activate(id: number) {
    return this.api.patch<void>(`${API_ENDPOINTS.warehouses}/${id}/activate`, {});
  }

  deactivate(id: number) {
    return this.api.patch<void>(`${API_ENDPOINTS.warehouses}/${id}/deactivate`, {});
  }

  listLocations(
    warehouseId: number,
    search?: string,
    isActive?: boolean | null,
    page = 1,
    pageSize = 100
  ) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('isActive', isActive);

    return this.api.get<PagedResult<LocationListItemDto>>(
      `${API_ENDPOINTS.warehouses}/${warehouseId}/locations`,
      { params }
    );
  }

  getLocation(warehouseId: number, locationId: number) {
    return this.api.get<LocationDetailsDto>(
      `${API_ENDPOINTS.warehouses}/${warehouseId}/locations/${locationId}`
    );
  }

  createLocation(warehouseId: number, code: string) {
    return this.api.post<{ locationId: number }>(
      `${API_ENDPOINTS.warehouses}/${warehouseId}/locations`,
      { code }
    );
  }

  updateLocation(warehouseId: number, locationId: number, code: string) {
    return this.api.put<{ locationId: number }>(
      `${API_ENDPOINTS.warehouses}/${warehouseId}/locations/${locationId}`,
      { code }
    );
  }

  activateLocation(warehouseId: number, locationId: number) {
    return this.api.patch<void>(
      `${API_ENDPOINTS.warehouses}/${warehouseId}/locations/${locationId}/activate`,
      {}
    );
  }

  deactivateLocation(warehouseId: number, locationId: number) {
    return this.api.patch<void>(
      `${API_ENDPOINTS.warehouses}/${warehouseId}/locations/${locationId}/deactivate`,
      {}
    );
  }
}

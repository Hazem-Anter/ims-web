import { Injectable } from '@angular/core';
import { PagedResult } from '../../shared/utils/paging';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../core/http/api.service';
import { API_ENDPOINTS } from '../../core/config/api.config';

export interface ProductDetailsDto {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  minStockLevel: number;
  isActive: boolean;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string | null;
  minStockLevel?: number; // backend default 0
}

export interface CreateProductResponse {
  productId: number;
}

export interface UpdateProductRequest {
  name: string;
  sku: string;
  barcode?: string | null;
  minStockLevel: number;
}

export interface StockMovementDto {
  transactionId: number;
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseCode: string;
  locationId?: number | null;
  locationCode?: string | null;
  type: string;          // In / Out / Adjust
  quantityDelta: number; // + / -
  unitCost?: number | null;
  createAt: string;      // DateTime from API
  referenceType?: string | null;
  referenceId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private api: ApiService) {}

  list(search?: string, isActive?: boolean | null, page = 1, pageSize = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('isActive', isActive);

    return this.api.get<PagedResult<ProductDetailsDto>>(API_ENDPOINTS.products, { params });
  }

  getById(id: number) {
    return this.api.get<ProductDetailsDto>(`${API_ENDPOINTS.products}/${id}`);
  }

  getByBarcode(barcode: string) {
    return this.api.get<ProductDetailsDto>(`${API_ENDPOINTS.products}/by-barcode/${encodeURIComponent(barcode.trim())}`);
  }

  create(req: CreateProductRequest) {
    return this.api.post<CreateProductResponse>(API_ENDPOINTS.products, req);
  }

  update(id: number, req: UpdateProductRequest) {
    return this.api.put<{ productId: number }>(`${API_ENDPOINTS.products}/${id}`, req);
  }

  activate(id: number) {
    return this.api.patch<void>(`${API_ENDPOINTS.products}/${id}/activate`, {});
  }

  deactivate(id: number) {
    return this.api.patch<void>(`${API_ENDPOINTS.products}/${id}/deactivate`, {});
  }

  timeline(productId: number, fromUtc?: string, toUtc?: string, warehouseId?: number | null, page = 1, pageSize = 50) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (fromUtc) params = params.set('fromUtc', fromUtc);
    if (toUtc) params = params.set('toUtc', toUtc);
    if (warehouseId) params = params.set('warehouseId', warehouseId);

    return this.api.get<PagedResult<StockMovementDto>>(
      `${API_ENDPOINTS.products}/${productId}/timeline`,
      { params }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../shared/utils/paging';

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
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(search?: string, isActive?: boolean | null, page = 1, pageSize = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search?.trim()) params = params.set('search', search.trim());
    if (isActive !== null && isActive !== undefined) params = params.set('isActive', isActive);

    return this.http.get<PagedResult<ProductDetailsDto>>(`${this.base}/api/products`, { params });
  }

  getById(id: number) {
    return this.http.get<ProductDetailsDto>(`${this.base}/api/products/${id}`);
  }

  getByBarcode(barcode: string) {
    return this.http.get<ProductDetailsDto>(`${this.base}/api/products/by-barcode/${encodeURIComponent(barcode.trim())}`);
  }

  create(req: CreateProductRequest) {
    return this.http.post<CreateProductResponse>(`${this.base}/api/products`, req);
  }

  update(id: number, req: UpdateProductRequest) {
    return this.http.put<{ productId: number }>(`${this.base}/api/products/${id}`, req);
  }

  activate(id: number) {
    return this.http.patch<void>(`${this.base}/api/products/${id}/activate`, {});
  }

  deactivate(id: number) {
    return this.http.patch<void>(`${this.base}/api/products/${id}/deactivate`, {});
  }

  timeline(productId: number, fromUtc?: string, toUtc?: string, warehouseId?: number | null, page = 1, pageSize = 50) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (fromUtc) params = params.set('fromUtc', fromUtc);
    if (toUtc) params = params.set('toUtc', toUtc);
    if (warehouseId) params = params.set('warehouseId', warehouseId);

    return this.http.get<PagedResult<StockMovementDto>>(
      `${this.base}/api/products/${productId}/timeline`,
      { params }
    );
  }
}

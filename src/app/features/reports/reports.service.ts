import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../shared/utils/paging';

export interface StockMovementDto {
  transactionId: number;
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseCode: string;
  locationId?: number | null;
  locationCode?: string | null;
  type: string;
  quantityDelta: number;
  unitCost?: number | null;
  createAt: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface LowStockItemDto {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseCode: string;
  locationId?: number | null;
  locationCode?: string | null;
  quantityOnHand: number;
  minStockLevel: number;
  shortage: number;
}

export interface DeadStockItemDto {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseCode: string;
  quantityOnHand: number;
  lastMovementAtUtc?: string | null;
  daysSinceLastMovement: number;
}

export interface StockValuationItemDto {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseCode: string;
  locationId?: number | null;
  locationCode?: string | null;
  quantityOnHand: number;
  unitCost?: number | null;
  totalValue: number;
}

export type StockValuationMode = 'WeightedAverage' | 'Fifo';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  stockMovements(params: {
    fromUtc: string;
    toUtc: string;
    warehouseId?: number | null;
    productId?: number | null;
    page?: number;
    pageSize?: number;
  }) {
    let p = new HttpParams()
      .set('fromUtc', params.fromUtc)
      .set('toUtc', params.toUtc)
      .set('page', params.page ?? 1)
      .set('pageSize', params.pageSize ?? 50);

    if (params.warehouseId) p = p.set('warehouseId', params.warehouseId);
    if (params.productId) p = p.set('productId', params.productId);

    return this.http.get<PagedResult<StockMovementDto>>(`${this.base}/api/reports/stock-movements`, { params: p });
  }

  lowStock(warehouseId?: number | null, productId?: number | null) {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    if (productId) params = params.set('productId', productId);

    return this.http.get<LowStockItemDto[]>(`${this.base}/api/reports/low-stock`, { params });
  }

  deadStock(days = 30, warehouseId?: number | null) {
    let params = new HttpParams().set('days', days);
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.http.get<DeadStockItemDto[]>(`${this.base}/api/reports/dead-stock`, { params });
  }

  stockValuation(mode: StockValuationMode = 'Fifo', warehouseId?: number | null, productId?: number | null) {
    let params = new HttpParams().set('mode', mode);
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    if (productId) params = params.set('productId', productId);
    return this.http.get<StockValuationItemDto[]>(`${this.base}/api/reports/stock-valuation`, { params });
  }
}

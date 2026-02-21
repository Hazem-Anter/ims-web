import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../core/http/api.service';
import { API_ENDPOINTS } from '../../core/config/api.config';

export interface StockOverviewItemDto {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseCode: string;
  locationId?: number | null;
  locationCode?: string | null;
  quantityOnHand: number;
}

export interface ReceiveStockRequest {
  productId: number;
  warehouseId: number;
  locationId?: number | null;
  quantity: number;
  unitCost?: number | null;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface IssueStockRequest {
  productId: number;
  warehouseId: number;
  locationId?: number | null;
  quantity: number;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface TransferStockRequest {
  productId: number;
  fromWarehouseId: number;
  fromLocationId?: number | null;
  toWarehouseId: number;
  toLocationId?: number | null;
  quantity: number;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface AdjustStockRequest {
  productId: number;
  warehouseId: number;
  locationId?: number | null;
  deltaQuantity: number;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private api: ApiService) {}

  stockOverview(warehouseId?: number | null, productId?: number | null, lowStockOnly = false) {
    let params = new HttpParams().set('lowStockOnly', lowStockOnly);
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    if (productId) params = params.set('productId', productId);
    return this.api.get<StockOverviewItemDto[]>(API_ENDPOINTS.inventory.overview, { params });
  }

  receive(req: ReceiveStockRequest) {
    return this.api.post<{ transactionId: number }>(API_ENDPOINTS.inventory.receive, req);
  }

  issue(req: IssueStockRequest) {
    return this.api.post<{ transactionId: number }>(API_ENDPOINTS.inventory.issue, req);
  }

  transfer(req: TransferStockRequest) {
    return this.api.post<{ transactionId: number }>(API_ENDPOINTS.inventory.transfer, req);
  }

  adjust(req: AdjustStockRequest) {
    return this.api.post<{ transactionId: number }>(API_ENDPOINTS.inventory.adjust, req);
  }
}

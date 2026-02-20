import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DashboardSummaryDto {
  totalProducts: number;
  activeProducts: number;
  totalWarehouses: number;
  activeWarehouses: number;
  lowStockItems: number;
  deadStockItems: number;
  totalStockValue: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getSummary() {
    return this.http.get<DashboardSummaryDto>(`${this.base}/api/dashboard/summary`);
  }
}

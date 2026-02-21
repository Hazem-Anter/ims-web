import { Injectable } from '@angular/core';
import { Observable, shareReplay, throwError, timeout, catchError } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { API_ENDPOINTS } from '../../core/config/api.config';

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
  private summaryRequest$?: Observable<DashboardSummaryDto>;

  constructor(private api: ApiService) {}

  getSummary(forceRefresh = false) {
    if (forceRefresh || !this.summaryRequest$) {
      this.summaryRequest$ = this.api.get<DashboardSummaryDto>(API_ENDPOINTS.dashboard.summary).pipe(
        timeout(10000),
        catchError((error) => {
          this.summaryRequest$ = undefined;
          return throwError(() => error);
        }),
        shareReplay(1)
      );
    }

    return this.summaryRequest$;
  }
}

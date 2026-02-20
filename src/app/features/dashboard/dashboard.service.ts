import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay, throwError, timeout, catchError } from 'rxjs';

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
  private summaryRequest$?: Observable<DashboardSummaryDto>;

  constructor(private http: HttpClient) {}

  getSummary(forceRefresh = false) {
    if (forceRefresh || !this.summaryRequest$) {
      this.summaryRequest$ = this.http.get<DashboardSummaryDto>(`${this.base}/api/dashboard/summary`).pipe(
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

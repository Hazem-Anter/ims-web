import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService, DashboardSummaryDto } from './dashboard.service';
import { ReportsService, StockMovementDto } from '../reports/reports.service';
import { LoadingComponent } from '../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorMapper } from '../../shared/utils/error-mapper.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    LoadingComponent,
    EmptyStateComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly reports = inject(ReportsService);
  private readonly errors = inject(ErrorMapper);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly data = signal<DashboardSummaryDto | null>(null);
  readonly hasData = computed(() => this.data() !== null);

  readonly recentLoading = signal(true);
  readonly recentError = signal('');
  readonly recentMovements = signal<StockMovementDto[]>([]);

  constructor() {
    this.load();
  }

  load(forceRefresh = false) {
    this.loading.set(true);
    this.error.set('');
    this.dashboard.getSummary(forceRefresh).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.message ?? 'Failed to load dashboard.');
        this.loading.set(false);
      }
    });

    this.loadRecent();
  }

  loadRecent() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    this.recentLoading.set(true);
    this.recentError.set('');

    this.reports.stockMovements({
      fromUtc: weekAgo.toISOString(),
      toUtc: now.toISOString(),
      page: 1,
      pageSize: 10
    }).subscribe({
      next: (res) => {
        this.recentMovements.set(res.items);
        this.recentLoading.set(false);
      },
      error: (e) => {
        this.recentError.set(this.errors.toMessage(e, 'Failed to load recent movements.'));
        this.recentLoading.set(false);
      }
    });
  }
}

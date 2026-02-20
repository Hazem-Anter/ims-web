import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService, DashboardSummaryDto } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly dashboard = inject(DashboardService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly data = signal<DashboardSummaryDto | null>(null);
  readonly hasData = computed(() => this.data() !== null);

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
  }
}

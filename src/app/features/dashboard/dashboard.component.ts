import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService, DashboardSummaryDto } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  loading = true;
  error = '';
  data: DashboardSummaryDto | null = null;

  constructor(private dashboard: DashboardService) {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.dashboard.getSummary().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.message ?? 'Failed to load dashboard.';
        this.loading = false;
      }
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WarehousesService, WarehouseListItemDto } from '../warehouses.service';
import { WarehouseUpsertDialogComponent } from '../warehouse-upsert-dialog/warehouse-upsert-dialog.component';
import { PagedResult } from '../../../shared/utils/paging';
import { NotificationService } from '../../../shared/ui/notifications/notification.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { ErrorMapper } from '../../../shared/utils/error-mapper.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    EmptyStateComponent,
    LoadingComponent
  ],
  templateUrl: './warehouses-list.component.html',
  styleUrl: './warehouses-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehousesListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly warehouses = inject(WarehousesService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly errors = inject(ErrorMapper);
  private activeLoadId = 0;

  readonly loading = signal(false);
  readonly error = signal('');

  readonly rows = signal<WarehouseListItemDto[]>([]);
  readonly displayedColumns = ['name', 'code', 'status', 'actions'];

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      isActive: [null], // null = all
    });

    this.filterForm.get('search')?.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });

    this.load();
  }

  load() {
    const requestId = ++this.activeLoadId;
    this.loading.set(true);
    this.error.set('');

    const { search, isActive } = this.filterForm.getRawValue();

    this.warehouses.list(search, isActive, this.page(), this.pageSize()).subscribe({
      next: (res: PagedResult<WarehouseListItemDto>) => {
        if (requestId !== this.activeLoadId) return;
        this.rows.set(res.items);
        this.totalCount.set(res.totalCount);
        this.page.set(res.page);
        this.pageSize.set(res.pageSize);
        this.loading.set(false);
      },
      error: (e) => {
        if (requestId !== this.activeLoadId) return;
        this.loading.set(false);
        this.error.set(this.errors.toMessage(e, 'Failed to load warehouses.'));
      }
    });
  }

  applyFilters() {
    this.page.set(1);
    this.load();
  }

  clearFilters() {
    this.filterForm.reset({ search: '', isActive: null });
    this.page.set(1);
    this.load();
  }

  onPage(event: PageEvent) {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  openCreate() {
    const ref = this.dialog.open(WarehouseUpsertDialogComponent, {
      width: '480px',
      data: { mode: 'create' }
    });
    ref.afterClosed().subscribe((ok) => ok && this.load());
  }

  openEdit(row: WarehouseListItemDto) {
    const ref = this.dialog.open(WarehouseUpsertDialogComponent, {
      width: '480px',
      data: { mode: 'edit', warehouseId: row.id }
    });
    ref.afterClosed().subscribe((ok) => ok && this.load());
  }

  toggleActive(row: WarehouseListItemDto) {
    this.loading.set(true);
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: row.isActive ? 'Deactivate warehouse?' : 'Activate warehouse?',
        message: `${row.name} (${row.code}) will be ${row.isActive ? 'hidden' : 'available'} for transactions.`,
        confirmText: row.isActive ? 'Deactivate' : 'Activate'
      }
    });

    ref.afterClosed().subscribe((confirm) => {
      if (!confirm) {
        this.loading.set(false);
        return;
      }

      const req = row.isActive
        ? this.warehouses.deactivate(row.id)
        : this.warehouses.activate(row.id);

      req.subscribe({
        next: () => {
          this.loading.set(false);
          this.notifications.success(row.isActive ? 'Warehouse deactivated.' : 'Warehouse activated.');
          this.load();
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(this.errors.toMessage(e, 'Operation failed.'));
        }
      });
    });
  }

  goLocations(row: WarehouseListItemDto) {
    this.router.navigate(['/warehouses', row.id, 'locations']);
  }

  trackWarehouse(_: number, row: WarehouseListItemDto) {
    return row.id;
  }
}

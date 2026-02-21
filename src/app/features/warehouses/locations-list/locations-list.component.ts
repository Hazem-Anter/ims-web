import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WarehousesService, LocationListItemDto } from '../warehouses.service';
import { LocationUpsertDialogComponent } from '../location-upsert-dialog/location-upsert-dialog.component';
import { NotificationService } from '../../../shared/ui/notifications/notification.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { ErrorMapper } from '../../../shared/utils/error-mapper.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
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
  templateUrl: './locations-list.component.html',
  styleUrl: './locations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationsListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly warehouses = inject(WarehousesService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  private readonly errors = inject(ErrorMapper);
  private activeLoadId = 0;

  readonly warehouseId = Number(this.route.snapshot.paramMap.get('id'));
  readonly warehouseName = signal('');

  readonly loading = signal(false);
  readonly error = signal('');

  readonly rows = signal<LocationListItemDto[]>([]);
  readonly displayedColumns = ['code', 'status', 'actions'];

  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      isActive: [null]
    });

    this.filterForm.get('search')?.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.load());

    if (Number.isNaN(this.warehouseId) || this.warehouseId <= 0) {
      this.error.set('Invalid warehouse id.');
      return;
    }

    this.loadWarehouse();
    this.load();
  }

  loadWarehouse() {
    this.warehouses.getById(this.warehouseId).subscribe({
      next: (w) => this.warehouseName.set(w.name),
      error: () => {}
    });
  }

  load() {
    const requestId = ++this.activeLoadId;
    this.loading.set(true);
    this.error.set('');

    const { search, isActive } = this.filterForm.getRawValue();

    this.warehouses.listLocations(this.warehouseId, search, isActive, 1, 200).subscribe({
      next: (res) => {
        if (requestId !== this.activeLoadId) return;
        this.rows.set(res.items ?? []);
        this.loading.set(false);
      },
      error: (e) => {
        if (requestId !== this.activeLoadId) return;
        this.error.set(this.errors.toMessage(e, 'Failed to load locations.'));
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    this.load();
  }

  clearFilters() {
    this.filterForm.reset({ search: '', isActive: null });
    this.load();
  }

  openCreate() {
    const ref = this.dialog.open(LocationUpsertDialogComponent, {
      width: '420px',
      data: { mode: 'create', warehouseId: this.warehouseId }
    });
    ref.afterClosed().subscribe((ok) => ok && this.load());
  }

  openEdit(row: LocationListItemDto) {
    const ref = this.dialog.open(LocationUpsertDialogComponent, {
      width: '420px',
      data: { mode: 'edit', warehouseId: this.warehouseId, locationId: row.id }
    });
    ref.afterClosed().subscribe((ok) => ok && this.load());
  }

  toggleActive(row: LocationListItemDto) {
    this.loading.set(true);
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: row.isActive ? 'Deactivate location?' : 'Activate location?',
        message: `${row.code} will be ${row.isActive ? 'disabled' : 'enabled'} for transactions.`,
        confirmText: row.isActive ? 'Deactivate' : 'Activate'
      }
    });

    ref.afterClosed().subscribe((confirm) => {
      if (!confirm) {
        this.loading.set(false);
        return;
      }

      const req = row.isActive
        ? this.warehouses.deactivateLocation(this.warehouseId, row.id)
        : this.warehouses.activateLocation(this.warehouseId, row.id);

      req.subscribe({
        next: () => {
          this.loading.set(false);
          this.notifications.success(row.isActive ? 'Location deactivated.' : 'Location activated.');
          this.load();
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(this.errors.toMessage(e, 'Operation failed.'));
        }
      });
    });
  }

  back() {
    this.router.navigate(['/warehouses']);
  }

  trackLocation(_: number, row: LocationListItemDto) {
    return row.id;
  }
}

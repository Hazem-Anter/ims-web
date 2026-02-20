import { Component } from '@angular/core';
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
    MatTooltipModule
  ],
  templateUrl: './locations-list.component.html',
  styleUrl: './locations-list.component.scss'
})
export class LocationsListComponent {
  warehouseId!: number;
  warehouseName = '';

  loading = false;
  error = '';

  rows: LocationListItemDto[] = [];
  displayedColumns = ['code', 'status', 'actions'];

  filterForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private warehouses: WarehousesService,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      isActive: [null]
    });

    this.warehouseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadWarehouse();
    this.load();
  }

  loadWarehouse() {
    this.warehouses.getById(this.warehouseId).subscribe({
      next: (w) => this.warehouseName = w.name,
      error: () => {}
    });
  }

  load() {
    this.loading = true;
    this.error = '';

    const { search, isActive } = this.filterForm.getRawValue();

    this.warehouses.listLocations(this.warehouseId, search, isActive).subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.message ?? 'Failed to load locations.';
        this.loading = false;
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
    this.loading = true;
    const req = row.isActive
      ? this.warehouses.deactivateLocation(this.warehouseId, row.id)
      : this.warehouses.activateLocation(this.warehouseId, row.id);

    req.subscribe({
      next: () => { this.loading = false; this.load(); },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Operation failed.';
      }
    });
  }

  back() {
    this.router.navigate(['/warehouses']);
  }
}

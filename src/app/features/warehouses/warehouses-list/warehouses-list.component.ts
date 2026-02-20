import { Component } from '@angular/core';
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
    MatTooltipModule
  ],
  templateUrl: './warehouses-list.component.html',
  styleUrl: './warehouses-list.component.scss'
})
export class WarehousesListComponent {
  loading = false;
  error = '';

  rows: WarehouseListItemDto[] = [];
  displayedColumns = ['name', 'code', 'status', 'actions'];

  page = 1;
  pageSize = 10;
  totalCount = 0;

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private warehouses: WarehousesService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      isActive: [null], // null = all
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';

    const { search, isActive } = this.filterForm.getRawValue();

    this.warehouses.list(search, isActive, this.page, this.pageSize).subscribe({
      next: (res: PagedResult<WarehouseListItemDto>) => {
        this.rows = res.items;
        this.totalCount = res.totalCount;
        this.page = res.page;
        this.pageSize = res.pageSize;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Failed to load warehouses.';
      }
    });
  }

  applyFilters() {
    this.page = 1;
    this.load();
  }

  clearFilters() {
    this.filterForm.reset({ search: '', isActive: null });
    this.page = 1;
    this.load();
  }

  onPage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
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
    this.loading = true;
    const req = row.isActive
      ? this.warehouses.deactivate(row.id)
      : this.warehouses.activate(row.id);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Operation failed.';
      }
    });
  }

  goLocations(row: WarehouseListItemDto) {
    this.router.navigate(['/warehouses', row.id, 'locations']);
  }
}

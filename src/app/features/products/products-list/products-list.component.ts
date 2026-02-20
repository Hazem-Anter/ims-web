import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ProductsService, ProductDetailsDto } from '../products.service';
import { ProductUpsertDialogComponent } from '../product-upsert-dialog/product-upsert-dialog.component';

@Component({
  selector: 'app-products-list',
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
    MatDialogModule,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent {
  loading = false;
  error = '';

  displayedColumns = ['id', 'name', 'sku', 'barcode', 'minStockLevel', 'isActive', 'actions'];
  rows: ProductDetailsDto[] = [];

  page = 1;
  pageSize = 10;
  totalCount = 0;

  filterForm: FormGroup;
  barcodeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private products: ProductsService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      isActive: [null], // null = all, true, false
    });

    this.barcodeForm = this.fb.group({
      barcode: ['']
    });

    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';

    const { search, isActive } = this.filterForm.getRawValue();

    this.products.list(search, isActive, this.page, this.pageSize).subscribe({
      next: (res) => {
        this.rows = res.items;
        this.totalCount = res.totalCount;
        this.page = res.page;
        this.pageSize = res.pageSize;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Failed to load products.';
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

  onPage(ev: PageEvent) {
    this.page = ev.pageIndex + 1;
    this.pageSize = ev.pageSize;
    this.load();
  }

  openCreate() {
    const ref = this.dialog.open(ProductUpsertDialogComponent, {
      width: '520px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  openEdit(row: ProductDetailsDto) {
    const ref = this.dialog.open(ProductUpsertDialogComponent, {
      width: '520px',
      data: { mode: 'edit', productId: row.id }
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  toggleActive(row: ProductDetailsDto) {
    this.loading = true;

    const req = row.isActive
      ? this.products.deactivate(row.id)
      : this.products.activate(row.id);

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

  goTimeline(row: ProductDetailsDto) {
    this.router.navigate(['/products', row.id, 'timeline']);
  }

  findByBarcode() {
    const barcode = (this.barcodeForm.getRawValue().barcode ?? '').trim();
    if (!barcode) return;

    this.loading = true;
    this.error = '';

    this.products.getByBarcode(barcode).subscribe({
      next: (p) => {
        this.loading = false;
        this.router.navigate(['/products', p.id, 'timeline']);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Barcode not found.';
      }
    });
  }
}

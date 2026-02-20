import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { ProductsService, StockMovementDto } from '../products.service';
import { LookupsService, WarehouseLookupDto } from '../../lookups/lookups.service';

@Component({
  selector: 'app-product-timeline',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './product-timeline.component.html',
  styleUrl: './product-timeline.component.scss'
})
export class ProductTimelineComponent {
  productId!: number;

  loading = false;
  error = '';

  displayedColumns = ['createAt', 'type', 'qty', 'warehouse', 'location', 'unitCost', 'ref'];
  rows: StockMovementDto[] = [];

  page = 1;
  pageSize = 50;
  totalCount = 0;

  warehouses: WarehouseLookupDto[] = [];

  filterForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private products: ProductsService,
    private lookups: LookupsService
  ) {
    this.filterForm = this.fb.group({
      fromUtc: [''],
      toUtc: [''],
      warehouseId: [null],
    });

    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadWarehouses();
    this.load();
  }

  loadWarehouses() {
    this.lookups.warehouses().subscribe({
      next: (w) => this.warehouses = w,
      error: () => {}
    });
  }

  load() {
    this.loading = true;
    this.error = '';

    const v = this.filterForm.getRawValue();

    const fromUtc = v.fromUtc ? new Date(v.fromUtc).toISOString() : undefined;
    const toUtc = v.toUtc ? new Date(v.toUtc).toISOString() : undefined;

    this.products.timeline(this.productId, fromUtc, toUtc, v.warehouseId, this.page, this.pageSize).subscribe({
      next: (res) => {
        this.rows = res.items;
        this.totalCount = res.totalCount;
        this.page = res.page;
        this.pageSize = res.pageSize;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Failed to load timeline.';
      }
    });
  }

  apply() {
    this.page = 1;
    this.load();
  }

  clear() {
    this.filterForm.reset({ fromUtc: '', toUtc: '', warehouseId: null });
    this.page = 1;
    this.load();
  }

  onPage(ev: PageEvent) {
    this.page = ev.pageIndex + 1;
    this.pageSize = ev.pageSize;
    this.load();
  }
}

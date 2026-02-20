import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { ReportsService, StockMovementDto, LowStockItemDto, DeadStockItemDto, StockValuationItemDto, StockValuationMode } from '../reports.service';
import { LookupsService, ProductLookupDto, WarehouseLookupDto } from '../../lookups/lookups.service';
import { PagedResult } from '../../../shared/utils/paging';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  warehouses: WarehouseLookupDto[] = [];
  products: ProductLookupDto[] = [];

  // stock movements
  movementsForm: FormGroup;
  movementRows: StockMovementDto[] = [];
  movementColumns = ['createAt', 'type', 'qty', 'warehouse', 'location', 'ref'];
  mvPage = 1;
  mvPageSize = 50;
  mvTotal = 0;
  mvLoading = false;
  mvError = '';

  // low stock
  lowForm: FormGroup;
  lowRows: LowStockItemDto[] = [];
  lowColumns = ['product', 'warehouse', 'location', 'qty', 'shortage'];
  lowLoading = false;
  lowError = '';

  // dead stock
  deadForm: FormGroup;
  deadRows: DeadStockItemDto[] = [];
  deadColumns = ['product', 'warehouse', 'qty', 'lastMovement', 'days'];
  deadLoading = false;
  deadError = '';

  // valuation
  valuationForm: FormGroup;
  valRows: StockValuationItemDto[] = [];
  valColumns = ['product', 'warehouse', 'location', 'qty', 'unitCost', 'totalValue'];
  valLoading = false;
  valError = '';

  constructor(
    private fb: FormBuilder,
    private reports: ReportsService,
    private lookups: LookupsService
  ) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    this.movementsForm = this.fb.group({
      fromUtc: [weekAgo.toISOString().slice(0, 10)],
      toUtc: [today.toISOString().slice(0, 10)],
      warehouseId: [null],
      productId: [null]
    });

    this.lowForm = this.fb.group({
      warehouseId: [null],
      productId: [null]
    });

    this.deadForm = this.fb.group({
      days: [30],
      warehouseId: [null]
    });

    this.valuationForm = this.fb.group({
      mode: ['Fifo' as StockValuationMode],
      warehouseId: [null],
      productId: [null]
    });

    this.loadLookups();
    this.loadMovements();
    this.loadLowStock();
    this.loadDeadStock();
    this.loadValuation();
  }

  private loadLookups() {
    this.lookups.warehouses(true).subscribe({ next: (w) => this.warehouses = w });
    this.lookups.products(undefined, true, 200).subscribe({ next: (p) => this.products = p });
  }

  // Stock movements
  loadMovements() {
    const { fromUtc, toUtc, warehouseId, productId } = this.movementsForm.getRawValue();
    const today = new Date();
    const defaultFrom = new Date(today);
    defaultFrom.setDate(today.getDate() - 7);

    const fromIso = fromUtc ? new Date(fromUtc).toISOString() : defaultFrom.toISOString();
    const toIso = toUtc ? new Date(toUtc).toISOString() : today.toISOString();

    this.mvLoading = true;
    this.mvError = '';

    this.reports.stockMovements({
      fromUtc: fromIso,
      toUtc: toIso,
      warehouseId,
      productId,
      page: this.mvPage,
      pageSize: this.mvPageSize
    }).subscribe({
      next: (res: PagedResult<StockMovementDto>) => {
        this.movementRows = res.items;
        this.mvTotal = res.totalCount;
        this.mvPage = res.page;
        this.mvPageSize = res.pageSize;
        this.mvLoading = false;
      },
      error: (e) => { this.mvError = e?.message ?? 'Failed to load movements.'; this.mvLoading = false; }
    });
  }

  mvPageChange(ev: PageEvent) {
    this.mvPage = ev.pageIndex + 1;
    this.mvPageSize = ev.pageSize;
    this.loadMovements();
  }

  resetMovements() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    this.movementsForm.reset({
      fromUtc: weekAgo.toISOString().slice(0, 10),
      toUtc: today.toISOString().slice(0, 10),
      warehouseId: null,
      productId: null
    });
    this.mvPage = 1;
    this.loadMovements();
  }

  // Low stock
  loadLowStock() {
    const { warehouseId, productId } = this.lowForm.getRawValue();
    this.lowLoading = true;
    this.lowError = '';
    this.reports.lowStock(warehouseId, productId).subscribe({
      next: (rows) => { this.lowRows = rows; this.lowLoading = false; },
      error: (e) => { this.lowError = e?.message ?? 'Failed to load low stock.'; this.lowLoading = false; }
    });
  }

  resetLow() {
    this.lowForm.reset({ warehouseId: null, productId: null });
    this.loadLowStock();
  }

  // Dead stock
  loadDeadStock() {
    const { days, warehouseId } = this.deadForm.getRawValue();
    this.deadLoading = true;
    this.deadError = '';
    this.reports.deadStock(Number(days) || 30, warehouseId).subscribe({
      next: (rows) => { this.deadRows = rows; this.deadLoading = false; },
      error: (e) => { this.deadError = e?.message ?? 'Failed to load dead stock.'; this.deadLoading = false; }
    });
  }

  resetDead() {
    this.deadForm.reset({ days: 30, warehouseId: null });
    this.loadDeadStock();
  }

  // Valuation
  loadValuation() {
    const { mode, warehouseId, productId } = this.valuationForm.getRawValue();
    this.valLoading = true;
    this.valError = '';
    this.reports.stockValuation(mode, warehouseId, productId).subscribe({
      next: (rows) => { this.valRows = rows; this.valLoading = false; },
      error: (e) => { this.valError = e?.message ?? 'Failed to load valuation.'; this.valLoading = false; }
    });
  }

  resetValuation() {
    this.valuationForm.reset({ mode: 'Fifo', warehouseId: null, productId: null });
    this.loadValuation();
  }
}

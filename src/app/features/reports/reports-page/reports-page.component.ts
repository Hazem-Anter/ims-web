import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { ErrorMapper } from '../../../shared/utils/error-mapper.service';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

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
    MatIconModule,
    LoadingComponent,
    EmptyStateComponent
  ],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reports = inject(ReportsService);
  private readonly lookups = inject(LookupsService);
  private readonly errors = inject(ErrorMapper);

  readonly warehouses = signal<WarehouseLookupDto[]>([]);
  readonly products = signal<ProductLookupDto[]>([]);
  readonly selectedTab = signal(0);

  // stock movements
  movementsForm: FormGroup;
  readonly movementRows = signal<StockMovementDto[]>([]);
  readonly movementColumns = ['createAt', 'type', 'qty', 'warehouse', 'location', 'ref'];
  readonly mvPage = signal(1);
  readonly mvPageSize = signal(50);
  readonly mvTotal = signal(0);
  readonly mvLoading = signal(false);
  readonly mvError = signal('');

  // low stock
  lowForm: FormGroup;
  readonly lowRows = signal<LowStockItemDto[]>([]);
  readonly lowColumns = ['product', 'warehouse', 'location', 'qty', 'shortage'];
  readonly lowLoading = signal(false);
  readonly lowError = signal('');

  // dead stock
  deadForm: FormGroup;
  readonly deadRows = signal<DeadStockItemDto[]>([]);
  readonly deadColumns = ['product', 'warehouse', 'qty', 'lastMovement', 'days'];
  readonly deadLoading = signal(false);
  readonly deadError = signal('');

  // valuation
  valuationForm: FormGroup;
  readonly valRows = signal<StockValuationItemDto[]>([]);
  readonly valColumns = ['product', 'warehouse', 'location', 'qty', 'unitCost', 'totalValue'];
  readonly valLoading = signal(false);
  readonly valError = signal('');

  private lowLoaded = false;
  private deadLoaded = false;
  private valuationLoaded = false;

  constructor() {
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
  }

  onTabChange(index: number) {
    this.selectedTab.set(index);

    if (index === 1 && !this.lowLoaded) {
      this.loadLowStock();
    }

    if (index === 2 && !this.deadLoaded) {
      this.loadDeadStock();
    }

    if (index === 3 && !this.valuationLoaded) {
      this.loadValuation();
    }
  }

  private loadLookups() {
    this.lookups.warehouses(true).subscribe({ next: (w) => this.warehouses.set(w) });
    this.lookups.products(undefined, true, 200).subscribe({ next: (p) => this.products.set(p) });
  }

  // Stock movements
  loadMovements() {
    const { fromUtc, toUtc, warehouseId, productId } = this.movementsForm.getRawValue();
    const today = new Date();
    const defaultFrom = new Date(today);
    defaultFrom.setDate(today.getDate() - 7);

    const fromIso = fromUtc ? new Date(fromUtc).toISOString() : defaultFrom.toISOString();
    const toIso = toUtc ? new Date(toUtc).toISOString() : today.toISOString();

    this.mvLoading.set(true);
    this.mvError.set('');

    this.reports.stockMovements({
      fromUtc: fromIso,
      toUtc: toIso,
      warehouseId,
      productId,
      page: this.mvPage(),
      pageSize: this.mvPageSize()
    }).subscribe({
      next: (res: PagedResult<StockMovementDto>) => {
        this.movementRows.set(res.items);
        this.mvTotal.set(res.totalCount);
        this.mvPage.set(res.page);
        this.mvPageSize.set(res.pageSize);
        this.mvLoading.set(false);
      },
      error: (e) => {
        this.mvError.set(this.errors.toMessage(e, 'Failed to load movements.'));
        this.mvLoading.set(false);
      }
    });
  }

  mvPageChange(ev: PageEvent) {
    this.mvPage.set(ev.pageIndex + 1);
    this.mvPageSize.set(ev.pageSize);
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
    this.mvPage.set(1);
    this.loadMovements();
  }

  // Low stock
  loadLowStock() {
    const { warehouseId, productId } = this.lowForm.getRawValue();
    this.lowLoading.set(true);
    this.lowError.set('');
    this.reports.lowStock(warehouseId, productId).subscribe({
      next: (rows) => {
        this.lowRows.set(rows);
        this.lowLoaded = true;
        this.lowLoading.set(false);
      },
      error: (e) => {
        this.lowError.set(this.errors.toMessage(e, 'Failed to load low stock.'));
        this.lowLoading.set(false);
      }
    });
  }

  resetLow() {
    this.lowForm.reset({ warehouseId: null, productId: null });
    this.loadLowStock();
  }

  // Dead stock
  loadDeadStock() {
    const { days, warehouseId } = this.deadForm.getRawValue();
    this.deadLoading.set(true);
    this.deadError.set('');
    this.reports.deadStock(Number(days) || 30, warehouseId).subscribe({
      next: (rows) => {
        this.deadRows.set(rows);
        this.deadLoaded = true;
        this.deadLoading.set(false);
      },
      error: (e) => {
        this.deadError.set(this.errors.toMessage(e, 'Failed to load dead stock.'));
        this.deadLoading.set(false);
      }
    });
  }

  resetDead() {
    this.deadForm.reset({ days: 30, warehouseId: null });
    this.loadDeadStock();
  }

  // Valuation
  loadValuation() {
    const { mode, warehouseId, productId } = this.valuationForm.getRawValue();
    this.valLoading.set(true);
    this.valError.set('');
    this.reports.stockValuation(mode, warehouseId, productId).subscribe({
      next: (rows) => {
        this.valRows.set(rows);
        this.valuationLoaded = true;
        this.valLoading.set(false);
      },
      error: (e) => {
        this.valError.set(this.errors.toMessage(e, 'Failed to load valuation.'));
        this.valLoading.set(false);
      }
    });
  }

  resetValuation() {
    this.valuationForm.reset({ mode: 'Fifo', warehouseId: null, productId: null });
    this.loadValuation();
  }

  trackWarehouse(_: number, row: WarehouseLookupDto) {
    return row.id;
  }

  trackProduct(_: number, row: ProductLookupDto) {
    return row.id;
  }

  trackMovement(_: number, row: StockMovementDto) {
    return row.transactionId;
  }

  trackLow(_: number, row: LowStockItemDto) {
    return `${row.productId}-${row.warehouseId}-${row.locationId ?? 'x'}`;
  }

  trackDead(_: number, row: DeadStockItemDto) {
    return `${row.productId}-${row.warehouseId}`;
  }

  trackValuation(_: number, row: StockValuationItemDto) {
    return `${row.productId}-${row.warehouseId}-${row.locationId ?? 'x'}`;
  }
}

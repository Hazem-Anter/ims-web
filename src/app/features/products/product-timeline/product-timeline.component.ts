import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ErrorMapper } from '../../../shared/utils/error-mapper.service';

@Component({
  selector: 'app-product-timeline',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    LoadingComponent,
    EmptyStateComponent,
  ],
  templateUrl: './product-timeline.component.html',
  styleUrl: './product-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductTimelineComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly products = inject(ProductsService);
  private readonly lookups = inject(LookupsService);
  private readonly errors = inject(ErrorMapper);
  private activeLoadId = 0;

  readonly productId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly displayedColumns = ['createAt', 'type', 'qty', 'warehouse', 'location', 'unitCost', 'ref'];
  readonly rows = signal<StockMovementDto[]>([]);

  readonly page = signal(1);
  readonly pageSize = signal(50);
  readonly totalCount = signal(0);

  readonly warehouses = signal<WarehouseLookupDto[]>([]);

  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      fromUtc: [''],
      toUtc: [''],
      warehouseId: [null],
    });

    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = rawId ? Number(rawId) : NaN;

    if (Number.isNaN(parsedId) || parsedId <= 0) {
      this.error.set('Invalid product id.');
      return;
    }

    this.productId.set(parsedId);

    this.loadWarehouses();
    this.load();
  }

  loadWarehouses() {
    this.lookups.warehouses().subscribe({
      next: (w) => this.warehouses.set(w),
      error: () => {}
    });
  }

  load() {
    const id = this.productId();
    if (!id) {
      this.error.set('Product id is missing.');
      return;
    }

    const requestId = ++this.activeLoadId;
    this.loading.set(true);
    this.error.set('');

    const v = this.filterForm.getRawValue();

    const fromUtc = v.fromUtc ? new Date(v.fromUtc).toISOString() : undefined;
    const toUtc = v.toUtc ? new Date(v.toUtc).toISOString() : undefined;

    this.products.timeline(id, fromUtc, toUtc, v.warehouseId, this.page(), this.pageSize()).subscribe({
      next: (res) => {
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
        this.error.set(this.errors.toMessage(e, 'Failed to load timeline.'));
      }
    });
  }

  apply() {
    this.page.set(1);
    this.load();
  }

  clear() {
    this.filterForm.reset({ fromUtc: '', toUtc: '', warehouseId: null });
    this.page.set(1);
    this.load();
  }

  onPage(ev: PageEvent) {
    this.page.set(ev.pageIndex + 1);
    this.pageSize.set(ev.pageSize);
    this.load();
  }

  trackWarehouse(_: number, warehouse: WarehouseLookupDto) {
    return warehouse.id;
  }

  trackMovement(_: number, row: StockMovementDto) {
    return row.transactionId;
  }
}

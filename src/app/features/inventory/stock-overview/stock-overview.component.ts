import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { InventoryService, StockOverviewItemDto } from '../inventory.service';
import { LookupsService, ProductLookupDto, WarehouseLookupDto } from '../../lookups/lookups.service';

@Component({
  selector: 'app-stock-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './stock-overview.component.html',
  styleUrl: './stock-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockOverviewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryService);
  private readonly lookups = inject(LookupsService);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly rows = signal<StockOverviewItemDto[]>([]);
  readonly displayedColumns = ['product', 'warehouse', 'location', 'qty'];

  readonly products = signal<ProductLookupDto[]>([]);
  readonly warehouses = signal<WarehouseLookupDto[]>([]);

  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      warehouseId: [null],
      productId: [null],
      lowStockOnly: [false]
    });

    this.loadLookups();
    this.load();
  }

  loadLookups() {
    this.lookups.products(undefined, true, 200).subscribe({ next: (p) => this.products.set(p) });
    this.lookups.warehouses(true).subscribe({ next: (w) => this.warehouses.set(w) });
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    const { warehouseId, productId, lowStockOnly } = this.filterForm.getRawValue();
    this.inventory.stockOverview(warehouseId, productId, lowStockOnly).subscribe({
      next: (rows) => { this.rows.set(rows); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message ?? 'Failed to load overview.'); this.loading.set(false); }
    });
  }

  apply() { this.load(); }
  clear() {
    this.filterForm.reset({ warehouseId: null, productId: null, lowStockOnly: false });
    this.load();
  }

  trackWarehouse(_: number, row: WarehouseLookupDto) {
    return row.id;
  }

  trackProduct(_: number, row: ProductLookupDto) {
    return row.id;
  }

  trackOverview(_: number, row: StockOverviewItemDto) {
    return `${row.productId}-${row.warehouseId}-${row.locationId ?? 'x'}`;
  }
}

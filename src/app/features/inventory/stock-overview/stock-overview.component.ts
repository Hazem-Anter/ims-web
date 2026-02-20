import { Component } from '@angular/core';
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
  styleUrl: './stock-overview.component.scss'
})
export class StockOverviewComponent {
  loading = false;
  error = '';

  rows: StockOverviewItemDto[] = [];
  displayedColumns = ['product', 'warehouse', 'location', 'qty'];

  products: ProductLookupDto[] = [];
  warehouses: WarehouseLookupDto[] = [];

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inventory: InventoryService,
    private lookups: LookupsService
  ) {
    this.filterForm = this.fb.group({
      warehouseId: [null],
      productId: [null],
      lowStockOnly: [false]
    });

    this.loadLookups();
    this.load();
  }

  loadLookups() {
    this.lookups.products(undefined, true, 200).subscribe({ next: (p) => this.products = p });
    this.lookups.warehouses(true).subscribe({ next: (w) => this.warehouses = w });
  }

  load() {
    this.loading = true;
    this.error = '';
    const { warehouseId, productId, lowStockOnly } = this.filterForm.getRawValue();
    this.inventory.stockOverview(warehouseId, productId, lowStockOnly).subscribe({
      next: (rows) => { this.rows = rows; this.loading = false; },
      error: (e) => { this.error = e?.message ?? 'Failed to load overview.'; this.loading = false; }
    });
  }

  apply() { this.load(); }
  clear() {
    this.filterForm.reset({ warehouseId: null, productId: null, lowStockOnly: false });
    this.load();
  }
}

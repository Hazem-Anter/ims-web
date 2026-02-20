import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { InventoryService } from '../inventory.service';
import { LookupsService, ProductLookupDto, WarehouseLookupDto, LocationLookupDto } from '../../lookups/lookups.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryService);
  private readonly lookups = inject(LookupsService);

  readonly products = signal<ProductLookupDto[]>([]);
  readonly warehouses = signal<WarehouseLookupDto[]>([]);
  readonly fromLocations = signal<LocationLookupDto[]>([]);
  readonly toLocations = signal<LocationLookupDto[]>([]);
  readonly locations = signal<LocationLookupDto[]>([]);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  receiveForm: FormGroup;
  issueForm: FormGroup;
  transferForm: FormGroup;
  adjustForm: FormGroup;

  constructor() {
    this.receiveForm = this.fb.group({
      productId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      locationId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitCost: [null],
      referenceType: [''],
      referenceId: ['']
    });

    this.issueForm = this.fb.group({
      productId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      locationId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      referenceType: [''],
      referenceId: ['']
    });

    this.transferForm = this.fb.group({
      productId: [null, Validators.required],
      fromWarehouseId: [null, Validators.required],
      fromLocationId: [null],
      toWarehouseId: [null, Validators.required],
      toLocationId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      referenceType: [''],
      referenceId: ['']
    });

    this.adjustForm = this.fb.group({
      productId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      locationId: [null],
      deltaQuantity: [0, [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(3)]],
      referenceType: [''],
      referenceId: ['']
    });

    this.loadLookups();
    this.setupLocationWatchers();
  }

  private loadLookups() {
    this.lookups.products(undefined, true, 100).subscribe({
      next: (p) => this.products.set(p)
    });
    this.lookups.warehouses(true).subscribe({
      next: (w) => this.warehouses.set(w)
    });
  }

  private setupLocationWatchers() {
    this.receiveForm.get('warehouseId')?.valueChanges.subscribe((id) => this.loadLocationsFor(id, 'locations'));
    this.issueForm.get('warehouseId')?.valueChanges.subscribe((id) => this.loadLocationsFor(id, 'locations'));
    this.transferForm.get('fromWarehouseId')?.valueChanges.subscribe((id) => this.loadLocationsFor(id, 'from'));
    this.transferForm.get('toWarehouseId')?.valueChanges.subscribe((id) => this.loadLocationsFor(id, 'to'));
    this.adjustForm.get('warehouseId')?.valueChanges.subscribe((id) => this.loadLocationsFor(id, 'locations'));
  }

  private loadLocationsFor(warehouseId: number | null, target: 'from' | 'to' | 'locations') {
    if (!warehouseId) {
      if (target === 'from') this.fromLocations.set([]);
      else if (target === 'to') this.toLocations.set([]);
      else this.locations.set([]);
      return;
    }
    this.lookups.locations(warehouseId, undefined, true, 100).subscribe({
      next: (locs) => {
        if (target === 'from') this.fromLocations.set(locs);
        else if (target === 'to') this.toLocations.set(locs);
        else this.locations.set(locs);
      }
    });
  }

  private handleResult(successMsg: string) {
    this.message.set(successMsg);
    this.error.set('');
    this.loading.set(false);
  }

  private handleError(e: unknown) {
    const message =
      typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string'
        ? (e as { message: string }).message
        : 'Operation failed.';

    this.loading.set(false);
    this.message.set('');
    this.error.set(message);
  }

  submitReceive() {
    if (this.receiveForm.invalid) return;
    this.loading.set(true);
    const v = this.receiveForm.getRawValue();
    this.inventory.receive({
      ...v,
      quantity: Number(v.quantity),
      unitCost: v.unitCost !== null ? Number(v.unitCost) : null
    }).subscribe({
      next: () => this.handleResult('Stock received successfully.'),
      error: (e) => this.handleError(e)
    });
  }

  submitIssue() {
    if (this.issueForm.invalid) return;
    this.loading.set(true);
    const v = this.issueForm.getRawValue();
    this.inventory.issue({
      ...v,
      quantity: Number(v.quantity)
    }).subscribe({
      next: () => this.handleResult('Stock issued successfully.'),
      error: (e) => this.handleError(e)
    });
  }

  submitTransfer() {
    if (this.transferForm.invalid) return;
    this.loading.set(true);
    const v = this.transferForm.getRawValue();
    this.inventory.transfer({
      ...v,
      quantity: Number(v.quantity)
    }).subscribe({
      next: () => this.handleResult('Stock transferred successfully.'),
      error: (e) => this.handleError(e)
    });
  }

  submitAdjust() {
    if (this.adjustForm.invalid) return;
    this.loading.set(true);
    const v = this.adjustForm.getRawValue();
    this.inventory.adjust({
      ...v,
      deltaQuantity: Number(v.deltaQuantity)
    }).subscribe({
      next: () => this.handleResult('Stock adjusted successfully.'),
      error: (e) => this.handleError(e)
    });
  }

  trackProduct(_: number, item: ProductLookupDto) {
    return item.id;
  }

  trackWarehouse(_: number, item: WarehouseLookupDto) {
    return item.id;
  }

  trackLocation(_: number, item: LocationLookupDto) {
    return item.id;
  }
}

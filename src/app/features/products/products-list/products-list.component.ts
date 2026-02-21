import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { NotificationService } from '../../../shared/ui/notifications/notification.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ErrorMapper } from '../../../shared/utils/error-mapper.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-products-list',
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
    LoadingComponent,
    EmptyStateComponent
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly products = inject(ProductsService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly errors = inject(ErrorMapper);
  private activeLoadId = 0;

  readonly loading = signal(false);
  readonly error = signal('');

  readonly displayedColumns = ['id', 'name', 'sku', 'barcode', 'minStockLevel', 'isActive', 'actions'];
  readonly rows = signal<ProductDetailsDto[]>([]);

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  filterForm: FormGroup;
  barcodeForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      isActive: [null], // null = all, true, false
    });

    this.barcodeForm = this.fb.group({
      barcode: ['']
    });

    this.filterForm.get('search')?.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });

    this.load();
  }

  load() {
    const requestId = ++this.activeLoadId;
    this.loading.set(true);
    this.error.set('');

    const { search, isActive } = this.filterForm.getRawValue();

    this.products.list(search, isActive, this.page(), this.pageSize()).subscribe({
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
        this.error.set(this.errors.toMessage(e, 'Failed to load products.'));
      }
    });
  }

  applyFilters() {
    this.page.set(1);
    this.load();
  }

  clearFilters() {
    this.filterForm.reset({ search: '', isActive: null });
    this.page.set(1);
    this.load();
  }

  onPage(ev: PageEvent) {
    this.page.set(ev.pageIndex + 1);
    this.pageSize.set(ev.pageSize);
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
    this.loading.set(true);

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: row.isActive ? 'Deactivate product?' : 'Activate product?',
        message: `Are you sure you want to ${row.isActive ? 'deactivate' : 'activate'} ${row.name}?`,
        confirmText: row.isActive ? 'Deactivate' : 'Activate'
      }
    });

    ref.afterClosed().subscribe((confirm) => {
      if (!confirm) {
        this.loading.set(false);
        return;
      }

      const req = row.isActive
        ? this.products.deactivate(row.id)
        : this.products.activate(row.id);

      req.subscribe({
        next: () => {
          this.loading.set(false);
          this.notifications.success(row.isActive ? 'Product deactivated.' : 'Product activated.');
          this.load();
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(this.errors.toMessage(e, 'Operation failed.'));
        }
      });
    });
  }

  goTimeline(row: ProductDetailsDto) {
    this.router.navigate(['/products', row.id, 'timeline']);
  }

  findByBarcode() {
    const barcode = (this.barcodeForm.getRawValue().barcode ?? '').trim();
    if (!barcode) return;

    this.loading.set(true);
    this.error.set('');

    this.products.getByBarcode(barcode).subscribe({
      next: (p) => {
        this.loading.set(false);
        this.router.navigate(['/products', p.id, 'timeline']);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(this.errors.toMessage(e, 'Barcode not found.'));
      }
    });
  }

  trackProduct(_: number, row: ProductDetailsDto) {
    return row.id;
  }
}

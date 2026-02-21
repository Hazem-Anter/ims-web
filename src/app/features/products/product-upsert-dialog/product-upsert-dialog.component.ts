import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ProductsService } from '../products.service';
import { FormErrorsComponent } from '../../../shared/ui/form-errors/form-errors.component';
import { NotificationService } from '../../../shared/ui/notifications/notification.service';
import { ErrorMapper } from '../../../shared/utils/error-mapper.service';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';

type DialogData =
  | { mode: 'create' }
  | { mode: 'edit'; productId: number };

@Component({
  selector: 'app-product-upsert-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormErrorsComponent,
    LoadingComponent
  ],
  templateUrl: './product-upsert-dialog.component.html',
  styleUrl: './product-upsert-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductUpsertDialogComponent {
  readonly loading = signal(false);
  readonly error = signal('');

  form: FormGroup;

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  constructor(
    private fb: FormBuilder,
    private products: ProductsService,
    private ref: MatDialogRef<ProductUpsertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private notifications: NotificationService,
    private errors: ErrorMapper
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: ['', [Validators.required, Validators.minLength(2)]],
      barcode: [''],
      minStockLevel: [0, [Validators.required]],
    });

    if (this.data.mode === 'edit') {
      this.loadForEdit(this.data.productId);
    }
  }

  private loadForEdit(id: number) {
    this.loading.set(true);
    this.error.set('');

    this.products.getById(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          name: p.name,
          sku: p.sku,
          barcode: p.barcode ?? '',
          minStockLevel: p.minStockLevel
        });
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(this.errors.toMessage(e, 'Failed to load product.'));
      }
    });
  }

  save() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    // normalize payload (barcode can be null)
    const payload = {
      name: String(v.name ?? '').trim(),
      sku: String(v.sku ?? '').trim(),
      barcode: String(v.barcode ?? '').trim() ? String(v.barcode).trim() : null,
      minStockLevel: Number(v.minStockLevel ?? 0),
    };

    // ✅ Narrow union so TS knows productId exists
    if (this.data.mode === 'edit') {
      this.products.update(this.data.productId, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.notifications.success('Product updated.');
          this.ref.close(true);
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(this.errors.toMessage(e, 'Save failed.'));
        }
      });
      return;
    }

    // create
    this.products.create(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.notifications.success('Product created.');
        this.ref.close(true);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(this.errors.toMessage(e, 'Save failed.'));
      }
    });
  }

  close() {
    this.ref.close(false);
  }
}

import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { WarehousesService } from '../warehouses.service';
import { FormErrorsComponent } from '../../../shared/ui/form-errors/form-errors.component';
import { LoadingComponent } from '../../../shared/ui/loading/loading.component';
import { NotificationService } from '../../../shared/ui/notifications/notification.service';
import { ErrorMapper } from '../../../shared/utils/error-mapper.service';

type DialogData =
  | { mode: 'create' }
  | { mode: 'edit'; warehouseId: number };

@Component({
  selector: 'app-warehouse-upsert-dialog',
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
  templateUrl: './warehouse-upsert-dialog.component.html',
  styleUrl: './warehouse-upsert-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseUpsertDialogComponent {
  form: FormGroup;
  readonly loading = signal(false);
  readonly error = signal('');

  get isEdit() { return this.data.mode === 'edit'; }

  constructor(
    private fb: FormBuilder,
    private warehouses: WarehousesService,
    private ref: MatDialogRef<WarehouseUpsertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private notifications: NotificationService,
    private errors: ErrorMapper
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
    });

    if (this.data.mode === 'edit') {
      this.loadForEdit(this.data.warehouseId);
    }
  }

  private loadForEdit(id: number) {
    this.loading.set(true);
    this.warehouses.getById(id).subscribe({
      next: (w) => {
        this.form.patchValue(w);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(this.errors.toMessage(e, 'Failed to load warehouse.'));
        this.loading.set(false);
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const payload = this.form.getRawValue();

    if (this.data.mode === 'edit') {
      this.warehouses.update(this.data.warehouseId, payload).subscribe({
        next: () => { this.loading.set(false); this.notifications.success('Warehouse updated.'); this.ref.close(true); },
        error: (e) => { this.loading.set(false); this.error.set(this.errors.toMessage(e, 'Save failed.')); }
      });
      return;
    }

    this.warehouses.create(payload).subscribe({
      next: () => { this.loading.set(false); this.notifications.success('Warehouse created.'); this.ref.close(true); },
      error: (e) => { this.loading.set(false); this.error.set(this.errors.toMessage(e, 'Save failed.')); }
    });
  }

  close() { this.ref.close(false); }
}

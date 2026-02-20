import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { WarehousesService } from '../warehouses.service';

type DialogData =
  | { mode: 'create'; warehouseId: number }
  | { mode: 'edit'; warehouseId: number; locationId: number };

@Component({
  selector: 'app-location-upsert-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './location-upsert-dialog.component.html',
  styleUrl: './location-upsert-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationUpsertDialogComponent {
  form: FormGroup;
  readonly loading = signal(false);
  readonly error = signal('');

  get isEdit() { return this.data.mode === 'edit'; }

  constructor(
    private fb: FormBuilder,
    private warehouses: WarehousesService,
    private ref: MatDialogRef<LocationUpsertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(1)]],
    });

    if (this.data.mode === 'edit') {
      this.loadForEdit(this.data.warehouseId, this.data.locationId);
    }
  }

  private loadForEdit(warehouseId: number, locationId: number) {
    this.loading.set(true);
    this.warehouses.getLocation(warehouseId, locationId).subscribe({
      next: (loc) => { this.form.patchValue(loc); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message ?? 'Failed to load location.'); this.loading.set(false); }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const code = String(this.form.getRawValue().code ?? '').trim();

    if (this.data.mode === 'edit') {
      this.warehouses.updateLocation(this.data.warehouseId, this.data.locationId, code).subscribe({
        next: () => { this.loading.set(false); this.ref.close(true); },
        error: (e) => { this.loading.set(false); this.error.set(e?.message ?? 'Save failed.'); }
      });
      return;
    }

    this.warehouses.createLocation(this.data.warehouseId, code).subscribe({
      next: () => { this.loading.set(false); this.ref.close(true); },
      error: (e) => { this.loading.set(false); this.error.set(e?.message ?? 'Save failed.'); }
    });
  }

  close() { this.ref.close(false); }
}

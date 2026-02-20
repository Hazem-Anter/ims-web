import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { WarehousesService } from '../warehouses.service';

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
    MatInputModule
  ],
  templateUrl: './warehouse-upsert-dialog.component.html',
  styleUrl: './warehouse-upsert-dialog.component.scss'
})
export class WarehouseUpsertDialogComponent {
  form: FormGroup;
  loading = false;
  error = '';

  get isEdit() { return this.data.mode === 'edit'; }

  constructor(
    private fb: FormBuilder,
    private warehouses: WarehousesService,
    private ref: MatDialogRef<WarehouseUpsertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
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
    this.loading = true;
    this.warehouses.getById(id).subscribe({
      next: (w) => {
        this.form.patchValue(w);
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.message ?? 'Failed to load warehouse.';
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const payload = this.form.getRawValue();

    if (this.data.mode === 'edit') {
      this.warehouses.update(this.data.warehouseId, payload).subscribe({
        next: () => { this.loading = false; this.ref.close(true); },
        error: (e) => { this.loading = false; this.error = e?.message ?? 'Save failed.'; }
      });
      return;
    }

    this.warehouses.create(payload).subscribe({
      next: () => { this.loading = false; this.ref.close(true); },
      error: (e) => { this.loading = false; this.error = e?.message ?? 'Save failed.'; }
    });
  }

  close() { this.ref.close(false); }
}

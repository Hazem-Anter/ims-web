import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-user-upsert-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './user-upsert-dialog.component.html',
  styleUrl: './user-upsert-dialog.component.scss'
})
export class UserUpsertDialogComponent {
  form: FormGroup;
  loading = false;
  error = '';
  roles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private ref: MatDialogRef<UserUpsertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roles: [[], Validators.required]
    });

    this.loadRoles();
  }

  private loadRoles() {
    this.users.listRoles().subscribe({
      next: (r) => this.roles = r,
      error: () => {}
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { email, password, roles } = this.form.getRawValue();
    this.users.create({ email: email.trim(), password, roles }).subscribe({
      next: () => { this.loading = false; this.ref.close(true); },
      error: (e) => { this.error = e?.message ?? 'Create failed.'; this.loading = false; }
    });
  }

  close() { this.ref.close(false); }
}

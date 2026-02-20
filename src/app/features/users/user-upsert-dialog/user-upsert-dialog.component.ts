import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
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
  styleUrl: './user-upsert-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserUpsertDialogComponent {
  form: FormGroup;
  readonly loading = signal(false);
  readonly error = signal('');
  readonly roles = signal<string[]>([]);

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private ref: MatDialogRef<UserUpsertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, never> | null
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
      next: (r) => this.roles.set(r),
      error: () => {}
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password, roles } = this.form.getRawValue();
    this.users.create({ email: email.trim(), password, roles }).subscribe({
      next: () => { this.loading.set(false); this.ref.close(true); },
      error: (e) => { this.error.set(e?.message ?? 'Create failed.'); this.loading.set(false); }
    });
  }

  close() { this.ref.close(false); }
}

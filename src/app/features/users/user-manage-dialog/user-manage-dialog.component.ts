import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { UsersService, UserDetailsDto } from '../users.service';

@Component({
  selector: 'app-user-manage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './user-manage-dialog.component.html',
  styleUrl: './user-manage-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManageDialogComponent {
  readonly user = signal<UserDetailsDto | null>(null);
  readonly roles = signal<string[]>([]);
  readonly loading = signal(true);
  readonly actionBusy = signal(false);
  readonly error = signal('');

  roleForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private ref: MatDialogRef<UserManageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {
    this.roleForm = this.fb.group({ role: [null, Validators.required] });
    this.passwordForm = this.fb.group({ password: ['', [Validators.required, Validators.minLength(6)]] });
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.error.set('');

    this.users.listRoles().subscribe({
      next: (r) => this.roles.set(r),
      error: () => {}
    });

    this.users.get(this.data.userId).subscribe({
      next: (u) => { this.user.set(u); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message ?? 'Failed to load user.'); this.loading.set(false); }
    });
  }

  close(changed = false) { this.ref.close(changed); }

  addRole() {
    const currentUser = this.user();
    if (!currentUser || this.roleForm.invalid) return;
    const role = this.roleForm.getRawValue().role;
    this.actionBusy.set(true);
    this.users.assignRole(currentUser.id, role).subscribe({
      next: () => {
        const latest = this.user();
        if (latest && !latest.roles.includes(role)) {
          this.user.set({ ...latest, roles: [...latest.roles, role] });
        }
        this.roleForm.reset();
        this.actionBusy.set(false);
      },
      error: (e) => {
        this.error.set(e?.message ?? 'Failed to add role.');
        this.actionBusy.set(false);
      }
    });
  }

  removeRole(role: string) {
    const currentUser = this.user();
    if (!currentUser) return;
    this.actionBusy.set(true);
    this.users.removeRole(currentUser.id, role).subscribe({
      next: () => {
        const latest = this.user();
        if (latest) {
          this.user.set({ ...latest, roles: latest.roles.filter((r) => r !== role) });
        }
        this.actionBusy.set(false);
      },
      error: (e) => {
        this.error.set(e?.message ?? 'Failed to remove role.');
        this.actionBusy.set(false);
      }
    });
  }

  resetPassword() {
    const currentUser = this.user();
    if (!currentUser || this.passwordForm.invalid) return;
    const pwd = this.passwordForm.getRawValue().password;
    this.actionBusy.set(true);
    this.users.resetPassword(currentUser.id, pwd).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.actionBusy.set(false);
      },
      error: (e) => {
        this.error.set(e?.message ?? 'Failed to reset password.');
        this.actionBusy.set(false);
      }
    });
  }

  toggleActive() {
    const currentUser = this.user();
    if (!currentUser) return;
    this.actionBusy.set(true);
    const req = currentUser.lockoutEnd ? this.users.activate(currentUser.id) : this.users.deactivate(currentUser.id);
    req.subscribe({
      next: () => {
        const latest = this.user();
        if (latest) {
          this.user.set({
            ...latest,
            lockoutEnd: latest.lockoutEnd ? null : new Date().toISOString()
          });
        }
        this.actionBusy.set(false);
      },
      error: (e) => {
        this.error.set(e?.message ?? 'Failed to update status.');
        this.actionBusy.set(false);
      }
    });
  }
}

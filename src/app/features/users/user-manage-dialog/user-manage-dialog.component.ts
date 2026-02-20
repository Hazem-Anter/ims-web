import { Component, Inject } from '@angular/core';
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
  styleUrl: './user-manage-dialog.component.scss'
})
export class UserManageDialogComponent {
  user: UserDetailsDto | null = null;
  roles: string[] = [];
  loading = true;
  error = '';

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
    this.loading = true;
    this.error = '';

    this.users.listRoles().subscribe({
      next: (r) => this.roles = r,
      error: () => {}
    });

    this.users.get(this.data.userId).subscribe({
      next: (u) => { this.user = u; this.loading = false; },
      error: (e) => { this.error = e?.message ?? 'Failed to load user.'; this.loading = false; }
    });
  }

  close(changed = false) { this.ref.close(changed); }

  addRole() {
    if (!this.user || this.roleForm.invalid) return;
    const role = this.roleForm.getRawValue().role;
    this.users.assignRole(this.user.id, role).subscribe({
      next: () => { this.load(); this.roleForm.reset(); },
      error: (e) => { this.error = e?.message ?? 'Failed to add role.'; }
    });
  }

  removeRole(role: string) {
    if (!this.user) return;
    this.users.removeRole(this.user.id, role).subscribe({
      next: () => this.load(),
      error: (e) => { this.error = e?.message ?? 'Failed to remove role.'; }
    });
  }

  resetPassword() {
    if (!this.user || this.passwordForm.invalid) return;
    const pwd = this.passwordForm.getRawValue().password;
    this.users.resetPassword(this.user.id, pwd).subscribe({
      next: () => { this.passwordForm.reset(); },
      error: (e) => { this.error = e?.message ?? 'Failed to reset password.'; }
    });
  }

  toggleActive() {
    if (!this.user) return;
    const req = this.user.lockoutEnd ? this.users.activate(this.user.id) : this.users.deactivate(this.user.id);
    req.subscribe({
      next: () => this.load(),
      error: (e) => { this.error = e?.message ?? 'Failed to update status.'; }
    });
  }
}

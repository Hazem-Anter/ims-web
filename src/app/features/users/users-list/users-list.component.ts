import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { UsersService, UserListItemDto } from '../users.service';
import { PagedResult } from '../../../shared/utils/paging';
import { UserUpsertDialogComponent } from '../user-upsert-dialog/user-upsert-dialog.component';
import { UserManageDialogComponent } from '../user-manage-dialog/user-manage-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  loading = false;
  error = '';

  rows: UserListItemDto[] = [];
  displayedColumns = ['email', 'userName', 'status', 'actions'];

  page = 1;
  pageSize = 10;
  totalCount = 0;

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({ search: [''] });
    this.load();
  }

  getStatus(row: UserListItemDto): 'active' | 'locked' {
    return row.lockoutEnd ? 'locked' : 'active';
  }

  load() {
    this.loading = true;
    this.error = '';
    const search = (this.filterForm.getRawValue().search ?? '').trim();

    this.users.list(search, this.page, this.pageSize).subscribe({
      next: (res: PagedResult<UserListItemDto>) => {
        this.rows = res.items;
        this.totalCount = res.totalCount;
        this.page = res.page;
        this.pageSize = res.pageSize;
        this.loading = false;
      },
      error: (e) => { this.error = e?.message ?? 'Failed to load users.'; this.loading = false; }
    });
  }

  onPage(ev: PageEvent) {
    this.page = ev.pageIndex + 1;
    this.pageSize = ev.pageSize;
    this.load();
  }

  search() { this.page = 1; this.load(); }
  clear() { this.filterForm.reset({ search: '' }); this.page = 1; this.load(); }

  openCreate() {
    const ref = this.dialog.open(UserUpsertDialogComponent, { width: '520px' });
    ref.afterClosed().subscribe((ok) => ok && this.load());
  }

  openManage(row: UserListItemDto) {
    const ref = this.dialog.open(UserManageDialogComponent, {
      width: '600px',
      data: { userId: row.id }
    });
    ref.afterClosed().subscribe((changed) => changed && this.load());
  }
}

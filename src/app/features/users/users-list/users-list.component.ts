import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  styleUrl: './users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UsersService);
  private readonly dialog = inject(MatDialog);
  private activeLoadId = 0;

  readonly loading = signal(false);
  readonly error = signal('');

  readonly rows = signal<UserListItemDto[]>([]);
  readonly displayedColumns = ['email', 'userName', 'status', 'actions'];

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  filterForm: FormGroup;

  constructor() {
    this.filterForm = this.fb.group({ search: [''] });
    this.load();
  }

  getStatus(row: UserListItemDto): 'active' | 'locked' {
    return row.lockoutEnd ? 'locked' : 'active';
  }

  load() {
    const requestId = ++this.activeLoadId;
    this.loading.set(true);
    this.error.set('');
    const search = (this.filterForm.getRawValue().search ?? '').trim();

    this.users.list(search, this.page(), this.pageSize()).subscribe({
      next: (res: PagedResult<UserListItemDto>) => {
        if (requestId !== this.activeLoadId) return;
        this.rows.set(res.items);
        this.totalCount.set(res.totalCount);
        this.page.set(res.page);
        this.pageSize.set(res.pageSize);
        this.loading.set(false);
      },
      error: (e) => {
        if (requestId !== this.activeLoadId) return;
        this.error.set(e?.message ?? 'Failed to load users.');
        this.loading.set(false);
      }
    });
  }

  onPage(ev: PageEvent) {
    this.page.set(ev.pageIndex + 1);
    this.pageSize.set(ev.pageSize);
    this.load();
  }

  search() { this.page.set(1); this.load(); }
  clear() { this.filterForm.reset({ search: '' }); this.page.set(1); this.load(); }

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

  trackUser(_: number, row: UserListItemDto) {
    return row.id;
  }
}

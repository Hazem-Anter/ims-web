import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { UsersService, UserRow } from '../users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  rows: UserRow[] = [];
  page = 1;
  pageSize = 10;
  totalCount = 0;

  columns = [
    { key: 'email', header: 'Email' },
    { key: 'userName', header: 'Username' },
    { key: 'isActive', header: 'Active' },
  ];

  constructor(private users: UsersService) { this.load(); }

  load(search = '') {
    this.users.list(this.page, this.pageSize, search).subscribe(r => {
      this.rows = r.items; this.totalCount = r.totalCount; this.page = r.page; this.pageSize = r.pageSize;
    });
  }

  onPage(p: number) { this.page = p; this.load(); }
  onSearch(s: string) { this.page = 1; this.load(s); }
}

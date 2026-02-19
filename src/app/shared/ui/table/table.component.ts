import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent<T> {
  @Input() title = '';
  @Input() columns: { key: string; header: string }[] = [];
  @Input() items: T[] = [];
  @Input() totalCount = 0;
  @Input() page = 1;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();

  search = '';

  onSearch() { this.searchChange.emit(this.search); }
  prev() { if (this.page > 1) this.pageChange.emit(this.page - 1); }
  next() {
    const maxPage = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
    if (this.page < maxPage) this.pageChange.emit(this.page + 1);
  }
}

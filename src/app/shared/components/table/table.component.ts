import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
  
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class  TableComponent<T> {
  @Input() data: T[] = [];
  @Input() columns: { label: string;  key: keyof T}[] = [];
  @Input() pageSize: number = 5;
  @Input() customColumn!: TemplateRef<any>; 
  @Input() set totalCount(value: number) {
    this.totalCountRecords = value;
    this.totalPages = Math.ceil(this.totalCountRecords / this.pageSize);
  }
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<T>();

  totalCountRecords: number = 0;


  get totalCount(): number {
    return this.totalCountRecords;
  }

  currentPage: number = 1;
  totalPages: number = 0;
  sortColumn: keyof T | 'checkbox' | null = null;
  sortDirection: 'asc' | 'desc' = 'asc'; 
  
  getPaginatedData(): T[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.pageChange.emit(newPage);
    }
  }

  onSort(column: { label: string, key: keyof T }): void { // column.key is now keyof T
    if (this.sortColumn === column.key) {
      // Toggle sort direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column to sort by and default to ascending
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    this.sortData();
  }

  // Sort the data array
  sortData(): void {
    const isAsc = this.sortDirection === 'asc';
    this.data.sort((a: T, b: T) => {
      if (a[this.sortColumn as keyof T] < b[this.sortColumn as keyof T]) return isAsc ? -1 : 1;
      if (a[this.sortColumn as keyof T] > b[this.sortColumn as keyof T]) return isAsc ? 1 : -1;
      return 0;
    });
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  private debounceTimer: any;

  onPageSizeChange(event: Event): void {
    clearTimeout(this.debounceTimer);
    const newSize = +(event.target as HTMLSelectElement).value;
    this.debounceTimer = setTimeout(() => {
      this.pageSize = newSize;
      this.currentPage = 1; 
      this.totalPages = Math.ceil(this.totalCountRecords / this.pageSize); 
      this.pageSizeChange.emit(this.pageSize); 
      this.pageChange.emit(this.currentPage); 
    }, 300);
  }
}
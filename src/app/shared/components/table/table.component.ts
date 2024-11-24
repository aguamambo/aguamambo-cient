import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class  TableComponent<T> {
  @Input() data: T[] = [];
  @Input() columns: { key: keyof T; label: string }[] = [];
  @Input() pageSize: number = 5;

  totalCountRecords: number = 0;

  @Input() set totalCount(value: number) {
    this.totalCountRecords = value;
    this.totalPages = Math.ceil(this.totalCountRecords / this.pageSize);
  }

  get totalCount(): number {
    return this.totalCountRecords;
  }

  currentPage: number = 1;
  totalPages: number = 0;
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<T>();

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
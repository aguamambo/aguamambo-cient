import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent<T>  {

  @Input() data: T[] = [];
  @Input() columns: { key: keyof T; label: string }[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalPages: number = 0;
  @Input() hasNext: boolean = false;
  @Input() hasPrevious: boolean = false;
  @Input() totalCount: number = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<T>();  
  itemsPerPage: number = 10;

  constructor(private router: Router, private route: ActivatedRoute) {}

  getTotalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  changePage(newPageNumber: number): void {
    this.pageChange.emit(newPageNumber);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }
}
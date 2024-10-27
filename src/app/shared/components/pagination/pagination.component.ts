import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent  implements OnChanges{
  @Input() currentPage: number = 1;    
  @Input() pageSize: number = 10;      
  @Input() totalPages: number = 0;  
  @Input() hasNext: boolean = false;
  @Input() hasPrevious: boolean = false;
  @Input() totalCount: number = 0;  
  @Input() paginatedData: any[] = [];  
  
  @Output() pageChange = new EventEmitter<number>();

  currentItems: number = 0;
  
  ngOnChanges(changes: SimpleChanges): void {
   
    if (changes['paginatedData'] || changes['totalCount']) {
      this.updateCurrentItems();
    }
  }

  updateCurrentItems(): void {
    this.currentItems = this.paginatedData.length;
  }

 changePage(newPage: number): void {     
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }

  goToPreviousPage(): void {
    if (this.hasPrevious) {
      this.changePage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.hasNext) {
      this.changePage(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    this.changePage(page);
  }
}
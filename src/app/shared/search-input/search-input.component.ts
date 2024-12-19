import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.css'],
})
export class SearchInputComponent {
  @Input() placeholder: string = 'Pesquisar...'; 
  @Output() searchChange = new EventEmitter<string>();  

  displayLabel: string = ''; 

  onSearchInputChange(): void {
    this.searchChange.emit(this.displayLabel);  
  }

  clearInput(): void {
    this.displayLabel = ''; 
    this.searchChange.emit(this.displayLabel); 
  }

  onInputClick(): void {
     
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchChange.emit(this.displayLabel);  
    }
  }
}

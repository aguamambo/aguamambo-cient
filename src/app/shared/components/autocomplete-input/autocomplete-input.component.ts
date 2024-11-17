import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.css']
})
export class AutocompleteInputComponent {
  @Input() placeholder: string = 'Pesquisar';
  @Input() dataSource: Option[] = [];
  @Input() label: string = '';
  @Output() valueSelected = new EventEmitter<Option>();

  filteredData: Option[] = [];
  displayLabel: string = '';
  searchValue: string = '';
  highlightedIndex: number = -1;

  onSearchInputChange() {
    if (this.displayLabel) {
      this.filteredData = this.dataSource.filter(option =>
        option.label && option.label.toLowerCase().includes(this.displayLabel.toLowerCase())
      );
      this.highlightedIndex = -1;
    } else {
      this.filteredData = [];
    }
  }

  onInputClick() { 
    if (!this.displayLabel) {
      this.filteredData = this.dataSource;
    }
  }
  
  clearInput(): void {
    this.displayLabel = '';
    this.filteredData = [];
  }
  
  onSelect(option: Option) {
    this.displayLabel = option.label; 
    this.searchValue = option.value
    this.filteredData = []; 
    this.highlightedIndex = -1;  
    this.valueSelected.emit(option);   
  }
  

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' && this.highlightedIndex < this.filteredData.length - 1) {
      this.highlightedIndex++;
      event.preventDefault();
    } else if (event.key === 'ArrowUp' && this.highlightedIndex > 0) {
      this.highlightedIndex--;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
      this.onSelect(this.filteredData[this.highlightedIndex]);
      event.preventDefault();
    }
  }
}

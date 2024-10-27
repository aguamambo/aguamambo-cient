import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrl: './autocomplete-input.component.css'
})
export class AutocompleteInputComponent {
  @Input() placeholder: string = 'Pesquisar';
  @Input() dataSource: Option[] = [];
  @Input() label: string = '';
  @Output() valueSelected = new EventEmitter<Option>();

  filteredData: Option[] = [];
  searchTerm: string = '';


  onSearchInputChange() {
  
    if (this.searchTerm) {
      this.filteredData = this.dataSource.filter(option => { 
        return option.label && option.label.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    } else {
      this.filteredData = [];
    }
  }
  onSelect(option: Option) {
    this.searchTerm = option.label;  
    this.valueSelected.emit(option); 
    this.filteredData = []; 
  }
}
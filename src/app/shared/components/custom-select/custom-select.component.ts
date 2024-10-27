import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-select',  
  templateUrl: './custom-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    }
  ],
  styleUrls: ['./custom-select.component.css']
})
export class CustomSelectComponent implements OnInit, ControlValueAccessor {
  @Input() options: { label: string, value: any }[] = [];
  @Input() selectedValue: any;
  @Input() label: string = '';
  @Output() selectedValueChange = new EventEmitter<{ value: string, label: string }>();

  isDropdownOpen = false;
  selectedLabel: string  = 'Seleccione...';

  onChange = (value: any) => {};
  onTouched = () => {};

  constructor() { }

  ngOnInit(): void {
    this.updateSelectedLabel();
  }

  // Writes the external value to the component
  writeValue(value: any): void {
    this.selectedValue = value;
    this.updateSelectedLabel();
  }

  // Registers the onChange function provided by the ControlValueAccessor
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Registers the onTouched function provided by the ControlValueAccessor
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Handle selection change from the UI
  onSelectChange(option: { label: string, value: any }): void {
    const value = option.value; 
    this.onChange(value);
    this.onTouched();
    this.selectedValueChange.emit({ label: option.label, value: option.value });
    this.updateSelectedLabel();
  }

  // Toggles the dropdown open or closed
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Updates the label based on the current selected value
  updateSelectedLabel(): void {
    const selectedOption = this.options.find(option => option.value === this.selectedValue);
    this.selectedLabel = selectedOption ? selectedOption.label : 'Seleccione...';
  }

  selectOption(option: { label: string, value: any }): void {
    this.selectedValue = option.value;
    this.onChange(option.value);
    this.onTouched(); 
    this.selectedValueChange.emit({ label: option.label, value: option.value });
    this.isDropdownOpen = false;
    this.updateSelectedLabel();
}
}

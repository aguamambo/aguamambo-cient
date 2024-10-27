import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-drop-down',
  templateUrl: './custom-drop-down.component.html',
  styleUrl: './custom-drop-down.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropDownComponent),
      multi: true
    }
  ]
}) 
export class CustomDropDownComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: { value: string; label: string }[] = [];
  @Output() selectionChange = new EventEmitter<{ value: string; label: string }>();

  isOpen: boolean = false;
  selectedValue: string | null = null;
  selectedLabel: string | null = null;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  ngOnInit(): void {
    this.setCurrentMonth();
  }

 
  private setCurrentMonth(): void {
    const currentMonth = new Date().getMonth() + 1; // Get current month (0-based, so +1)
    const selectedOption = this.options.find(option => option.value === currentMonth.toString());

    if (selectedOption) {
      this.selectedValue = selectedOption.value;
      this.selectedLabel = selectedOption.label;
      this.onChange(selectedOption.value);
      this.selectionChange.emit(selectedOption);
    }
  }

 
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  } 

  selectOption(option: { value: string; label: string }) {
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.onChange(option.value);
    this.selectionChange.emit(option);
  }

 
  writeValue(value: any): void {
    if (value) {
      const selectedOption = this.options.find(option => option.value === value);
      if (selectedOption) {
        this.selectedValue = selectedOption.value;
        this.selectedLabel = selectedOption.label;
      }
    }
  }

 
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
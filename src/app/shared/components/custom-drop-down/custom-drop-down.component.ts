import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-drop-down',
  templateUrl: './custom-drop-down.component.html',
  styleUrls: ['./custom-drop-down.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropDownComponent),
      multi: true,
    },
  ],
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
    // No need to call setDefaultSelection here, it is handled by writeValue.
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: { value: string; label: string }, emitChange: boolean = true): void {
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;

    if (emitChange) {
      this.onChange(option.value);
      this.selectionChange.emit(option);
    }
  }

  writeValue(value: any): void {
    if (value) {
      const selectedOption = this.options.find(option => option.value === value);
      if (selectedOption) {
        this.selectOption(selectedOption, false);
      } else {
        this.setDefaultSelection();
      }
    } else {
      this.setDefaultSelection();
    }
  }

  private setDefaultSelection(): void {
    if (this.options.length > 0) {
      const firstOption = this.options[0];
      this.selectOption(firstOption, false);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
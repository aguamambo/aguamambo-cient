import { Component, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  styleUrls: ['./date-picker.component.css'],
})
export class DatePickerComponent implements ControlValueAccessor {
  showCalendar = false;
  isYearDropdownOpen = false;
  isMonthDropdownOpen = false;
  selectedDate: string | null = null;  // Date value in ISO format
  displayDate: string | null = null;    // Displayed in dd-MM-yyyy format
  days: number[] = [];
  months: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  years: number[] = [];
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  selectedMonth: number = new Date().getMonth();

  constructor(private cdr: ChangeDetectorRef) {
    this.generateDays(this.selectedYear, this.selectedMonth);
    this.generateYears();
  }

  generateDays(year: number, month: number): void { 
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    this.days = [];

    for (let i = start.getDate(); i <= end.getDate(); i++) {
      this.days.push(i);
    }
  }

  generateYears() {
    for (let i = this.currentYear; i >= 2000; i--) {
      this.years.push(i);
    }
  }

  selectDate(day: number) {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    this.selectedDate = date.toISOString(); // ISO format for sent value
    this.displayDate = this.formatDisplayDate(date); // dd-MM-yyyy format for display
    this.showCalendar = false;
    this.onChange(this.selectedDate);
    this.onTouched();
    this.cdr.detectChanges(); 
  }

  selectMonth(month: number) {
    this.selectedMonth = month;
    this.generateDays(this.selectedYear, this.selectedMonth);
    this.isMonthDropdownOpen = false;
  }

  selectYear(year: number) {
    this.selectedYear = year;
    this.generateDays(this.selectedYear, this.selectedMonth);
    this.isYearDropdownOpen = false;
  }

  toggleYearDropdown() {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    this.isMonthDropdownOpen = false;   
  }

  toggleMonthDropdown() {
    this.isMonthDropdownOpen = !this.isMonthDropdownOpen;
    this.isYearDropdownOpen = false;  
  } 

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  formatDisplayDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    if (value) {
      const date = new Date(value);
      this.selectedDate = value;
      this.displayDate = this.formatDisplayDate(date); // Display as dd-MM-yyyy
    } else {
      this.selectedDate = null;
      this.displayDate = null;
    }
    this.cdr.detectChanges(); 
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  } 
}

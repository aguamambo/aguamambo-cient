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
  selectedDate: string | null = null;
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
    if (!isNaN(month) && month >= 0 && month <= 11) { 
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      this.days = [];
      
      if (start && end) {   
        for (let i = start.getDate(); i <= end.getDate(); i++) {
          this.days.push(i);
        }
      }
    }
  }
  

  generateYears() {
    if (this.currentYear) {
      for (let i = this.currentYear; i >= 2000; i--) {
        this.years.push(i);
      }
    }
  }

  selectDate(day: number) {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    this.selectedDate = this.formatDate(date);
    this.showCalendar = false;
    this.onChange(this.selectedDate);
    this.onTouched();
    this.cdr.detectChanges(); 
  }

  selectMonth(month: number) {
    if (month >= 0 && month <= 11) {  
      this.selectedMonth = month;
      this.generateDays(this.selectedYear, this.selectedMonth);
      this.isMonthDropdownOpen = false;
    }
  }

  selectYear(year: number) {
    if (year) {   
      this.selectedYear = year;
      this.generateDays(this.selectedYear, this.selectedMonth);
      this.isYearDropdownOpen = false;
    }
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

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.selectedDate = value;
    this.cdr.detectChanges(); 
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  } 
}

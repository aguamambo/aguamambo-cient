import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Meter {
  meterId: string;
  installationDate: string;
  status: string;
  location: string;
}

@Component({
  selector: 'app-meter',
  templateUrl: './meter.component.html',
})
export class MeterComponent implements OnInit {
  meterForm: FormGroup;
  metersList: Meter[] = [];
  isEditing: boolean = false;
  editIndex: number | null = null;

  constructor(private fb: FormBuilder) {
    this.meterForm = this.fb.group({
      meterId: ['', [Validators.required, Validators.minLength(5)]],
      installationDate: ['', Validators.required],
      status: ['active', Validators.required],
      location: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadMeters();
  }

  loadMeters(): void {
    this.metersList = [
      { meterId: '12345', installationDate: '2024-01-01', status: 'active', location: 'Zone A' }
    ];
  }

  submitMeterForm(): void {
    if (this.meterForm.valid) {
      const formValue = this.meterForm.value;
      if (this.isEditing && this.editIndex !== null) {
        this.metersList[this.editIndex] = { ...formValue };
        this.isEditing = false;
        this.editIndex = null;
      } else {
        this.metersList.push({ ...formValue });
      }
      this.meterForm.reset();
    }
  }

  editMeter(index: number): void {
    this.isEditing = true;
    this.editIndex = index;
    this.meterForm.patchValue(this.metersList[index]);
  }

  deleteMeter(index: number): void {
    this.metersList.splice(index, 1);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/store';

interface InvoicePaymentInvoicePayment {
  description: string;
  minInvoicePayment: number;
  maxInvoicePayment: number;
}

@Component({
  selector: 'app-invoice-payment',
  templateUrl: './invoice-payment.component.html',
})
export class InvoicePaymentComponent implements OnInit {
  invoicePaymentForm: FormGroup;
  paymentInvoicePayments: InvoicePaymentInvoicePayment[] = [];
  isEditing: boolean = false;
  editIndex: number | null = null;

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.invoicePaymentForm = this.fb.group({
      description: new FormControl(null, Validators.required),
      minInvoicePayment: new FormControl(null, Validators.required),
      maxInvoicePayment: new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {
    this.loadInvoicePayments();
  }

  loadInvoicePayments(): void {
     
  }

  submitForm(): void {
    if (this.invoicePaymentForm.valid) {
      const formValue = this.invoicePaymentForm.value;
      if (this.isEditing && this.editIndex !== null) {
        this.paymentInvoicePayments[this.editIndex] = { ...formValue };
        this.isEditing = false;
        this.editIndex = null;
      } else {
        this.paymentInvoicePayments.push({ ...formValue });
      }
      this.invoicePaymentForm.reset();
    }
  }

  editInvoicePayment(index: number): void {
    this.isEditing = true;
    this.editIndex = index;
    this.invoicePaymentForm.patchValue(this.paymentInvoicePayments[index]);
  }

  deleteInvoicePayment(index: number): void {
    this.paymentInvoicePayments.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}

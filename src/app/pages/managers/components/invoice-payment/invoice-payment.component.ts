import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IInvoice } from 'src/app/models/invoice';
import { IAppState, listAllInvoices } from 'src/app/store';
import { selectInvoiceIsLoading, selectInvoiceIsSaving, selectSelectedInvoices } from 'src/app/store/selectors/invoice.selectors';

interface InvoicePayment {
  invoiceId: string;
  description: string;
  paymentMethod: string;
  limitDate: string;
  paymentStatus: boolean;
  paymentDate: string;
  amount:number;
  fineAmount:number;
  totalAmount:number;
  finePercentage:number;
  readingId: string;
}

@Component({
  selector: 'app-invoice-payment',
  templateUrl: './invoice-payment.component.html',
})
export class InvoicePaymentComponent implements OnInit {
  invoicePaymentForm: FormGroup;
  invoicePayments:InvoicePayment[] = [];
    invoicePayment!: InvoicePayment;
    isInvoicePaymentsLoading$: Observable<boolean>;
    isInvoicePaymentSaving$: Observable<boolean>;
  isEditing: boolean = false;
  editIndex: number | null = null;
  invoicePaymentsColumns: {key: keyof InvoicePayment;  label: string}[] = [];
 
  private destroy$ = new Subject<void>();
  getInvoices$ = this.store.pipe(select(selectSelectedInvoices));

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.invoicePaymentForm = this.fb.group({
      description: new FormControl(),
      minInvoicePayment: new FormControl(),
      maxInvoicePayment: new FormControl()
    });
    this.isInvoicePaymentsLoading$ = this.store.select(selectInvoiceIsLoading)
    this.isInvoicePaymentSaving$ = this.store.select(selectInvoiceIsSaving)

    this.invoicePaymentsColumns = [
      {key: 'invoiceId', label: 'ID'},
      {key: 'description', label: 'Descritivo'},
      {key: 'paymentMethod', label: 'Metodo de Pagamento'},
      {key: 'limitDate', label: 'Data Limite'},
      {key: 'paymentStatus', label: 'Estado'},
      {key: 'paymentDate', label: 'Data de Pagamento'},
      {key: 'amount', label: 'Valor da Leitura'},
      {key: 'fineAmount', label: 'Multa'},
      {key: 'totalAmount', label: 'Valor a Pagar'},
      {key: 'finePercentage', label: 'Multa (%)'},
      {key: 'readingId', label: 'Leitura'}
    ]
  }

  ngOnInit(): void {
    this.loadInvoicePayments();
  }

  loadInvoicePayments(): void {
     this.store.dispatch(listAllInvoices())
         this.getInvoices$.pipe(takeUntil(this.destroy$)).subscribe(invoicePayment => {
           if (invoicePayment) {
             this.invoicePayments =  invoicePayment;
           }
         })
  }

  submitForm(): void {
    if (this.invoicePaymentForm.valid) {
      const formValue = this.invoicePaymentForm.value;
      if (this.isEditing && this.editIndex !== null) {
        this.invoicePayments[this.editIndex] = { ...formValue };
        this.isEditing = false;
        this.editIndex = null;
      } else {
        this.invoicePayments.push({ ...formValue });
      }
      this.invoicePaymentForm.reset();
    }
  }

  editInvoicePayment(invoicePayment: any): void {
    this.isEditing = true;
    this.invoicePayment = invoicePayment;
    this.invoicePaymentForm.patchValue(invoicePayment);
  }

  deleteInvoicePayment(index: number): void {
    this.invoicePayments.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { IInvoice } from 'src/app/models/invoice';
import { DialogService } from 'src/app/services/dialog.service';
import { ToasterService } from 'src/app/services/toaster.service'; 
import { createInvoice, IAppState, listAllInvoices, updateInvoice } from 'src/app/store';
import { selectInvoiceErrorMessage, selectInvoiceIsLoading, selectInvoiceIsSaving, selectSelectedInvoices } from 'src/app/store/selectors/invoice.selectors';


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
  getInvoices$ = this._store.pipe(select(selectSelectedInvoices));

  constructor(
     private _fb: FormBuilder,
        private _store: Store<IAppState>,
        private _dialogService: DialogService,
        private _toaster: ToasterService
  ) {
    this.invoicePaymentForm = this._fb.group({
        invoiceId: new FormControl(),
        description: new FormControl(),
        paymentMethod: new FormControl(),
        limitDate: new FormControl(),
        paymentDate: new FormControl(),
        paymentStatus: new FormControl(),
        amount: new FormControl(),
        fineAmount: new FormControl(),
        totalAmount: new FormControl(),
        finePercentage: new FormControl(),
        receiptId: new FormControl(),
        readingId: new FormControl()
    });
    this.isInvoicePaymentsLoading$ = this._store.select(selectInvoiceIsLoading)
    this.isInvoicePaymentSaving$ = this._store.select(selectInvoiceIsSaving)

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
     this._store.dispatch(listAllInvoices())
         this.getInvoices$.pipe(takeUntil(this.destroy$)).subscribe(invoicePayment => {
           if (invoicePayment) {
             this.invoicePayments =  invoicePayment;
           }
         })
  }

  submitForm(): void {
    if (this.invoicePaymentForm.valid) {
   
         const payload = this.invoicePaymentForm.value;


   
         if (this.isEditing) {
   
           
           this._store.dispatch(updateInvoice({ invoiceId: payload.invoiceId, invoice: payload }));
   
   
           this._store.pipe(select(selectInvoiceErrorMessage)).subscribe(
             error => {
               if (error) {
                 this._dialogService.open({
                   title: 'Actualizacao da Factura',
                   type:'loading',
                   message: error,
                   isProcessing: false,
                   showConfirmButton: false,
                 })
               } else {
                 this._store.pipe(select(selectSelectedInvoices), filter((invoices) => !!invoices))
                   .subscribe((invoices) => {
                     if (invoices) {
                       this.invoicePaymentForm.reset();
                       this.isEditing = false;
                       this._dialogService.open({
                         title: 'Actualizacao da Factura',
                         type: 'success',
                         message: 'Factura Actualizada com sucesso!',
                         isProcessing: false,
                         showConfirmButton: false,
                       })
                     } else {
                       this.openFeedbackDialog('error','Actualizaçã da Factura', 'Ocorreu um erro ao actualizar a Factura!');
                     }
                   });
               }
             }
           )
   
         } else {
           this._store.dispatch(createInvoice({ payload: payload }));
           this._store.pipe(select(selectSelectedInvoices), filter((zone) => !!zone))
             .subscribe((zone) => {
               if (zone) {
                 this.openFeedbackDialog('success','Criação de Factura', 'Factura criada com sucesso!');
                 this.invoicePaymentForm.reset();
               } else {
                 this.openFeedbackDialog('error','Criação de Factura', 'U erro ocorreu ao criar a Factura!');
               }
             });
         }
       }
     }

     openFeedbackDialog(type: 'success' | 'error',title: string, message: string): void {
      this._dialogService.open({
        title: title,
        message: message,
        type: type,
        confirmText: 'OK',
        isProcessing: false,
      }) 
    }
  
  editInvoicePayment(invoicePayment: any): void {
    this.isEditing = true; 

    this.invoicePayment = invoicePayment;
    this.invoicePaymentForm.patchValue({
        invoiceId: invoicePayment.invoiceId,
        description: invoicePayment.description,
        paymentMethod: invoicePayment.paymentMethod,
        limitDate: invoicePayment.limitDate,
        paymentDate: invoicePayment.paymentDate,
        paymentStatus: invoicePayment.paymentStatus,
        amount: invoicePayment.amount,
        fineAmount: invoicePayment.fineAmount,
        totalAmount: invoicePayment.totalAmount,
        finePercentage: invoicePayment.finePercentage,
        receiptId: invoicePayment.receiptId,
        readingId: invoicePayment.readingId
    });
  }

  deleteInvoicePayment(index: number): void {
    this.invoicePayments.splice(index, 1);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
}

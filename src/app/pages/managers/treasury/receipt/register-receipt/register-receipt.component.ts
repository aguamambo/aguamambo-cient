import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { AuthService } from 'src/app/services/auth.service';
import { IInvoice } from './../../../../../models/invoice';
import { Component, OnInit } from '@angular/core';
import { selectClientIsLoading, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { createReceipt, getContractByClientId, getInvoiceByClientId, getInvoiceByMeter, getInvoiceByStatus, getReceiptFile, getReceiptPaymentMethods, listAllClients } from 'src/app/store';
import { IClient } from 'src/app/models/client';
import { IOption } from 'src/app/models/option';
import { selectInvoiceIsLoading, selectInvoiceIsSaving, selectSelectedInvoices } from 'src/app/store/selectors/invoice.selectors';
import { selectContractIsLoading, selectSelectedContracts } from 'src/app/store/selectors/contract.selectors';
import { IContract } from 'src/app/models/contract';
import { selectPaymentMethods, selectReceiptIsSaving, selectSelectedReceipt } from 'src/app/store/selectors/receipt.selectors';


@Component({
  selector: 'app-register-receipt',
  templateUrl: './register-receipt.component.html',
  styleUrls: ['./register-receipt.component.css']
})
export class RegisterReceiptComponent implements OnInit {
  form: FormGroup;
  currentYear = new Date().getFullYear();
  currentDate = new Date().toISOString().split('T')[0];
  fullDate = new Date().toISOString()
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getPaymentMethods$ = this.store.pipe(select(selectPaymentMethods));
  isClientLoading$: Observable<boolean>
  isInvoiceLoading$: Observable<boolean>
  isContractLoading$: Observable<boolean>
  isReceiptSaving$: Observable<boolean>
  clientData: IOption[] = [];
  contractsData: IOption[] = [];
  paymentMethods: IOption[] = [];
  contractList: IContract[] = [];
  invoicesData: IInvoice[] = [];
  private destroy$ = new Subject<void>();
  private unsubscribe$ = new Subject<void>();
  clientsList: IClient[] = [];
  invoicesToBePaid: IInvoice[] = [];
  selectedContractValue: string | null = null;
  invoiceColumns: { key: keyof IInvoice; label: string }[] = [];
  customerBalance: number = 0;
  enablePaymentButton: boolean = false;
  valorPago: number = 0;
  outstandingAmount: number = 0;

  constructor(private fb: FormBuilder, private store: Store, private generic: GenericConfig, private auth: AuthService) {
    this.form = this.fb.group({
      paymentDate: [this.fullDate, Validators.required],
      amount: ['', Validators.required],
      invoiceIds: [[]],
      paymentMethod: ['', Validators.required],
      purpose: [''],
      clientId: ['', Validators.required],
      
    });
    this.isClientLoading$ = this.store.pipe(select(selectClientIsLoading))
    this.isInvoiceLoading$ = this.store.pipe(select(selectInvoiceIsLoading))
    this.isContractLoading$ = this.store.pipe(select(selectContractIsLoading))
    this.isReceiptSaving$ = this.store.pipe(select(selectReceiptIsSaving))
    this.invoiceColumns = [
      { key: 'invoiceId', label: 'Código' },
      { key: 'description', label: 'Descrição' },
      { key: 'paymentMethod', label: 'Metodo de Pagamento' },
      { key: 'limitDate', label: 'Data Limite' },
      { key: 'paymentDate', label: 'Data de Pagamento' },
      { key: 'amount', label: 'Montante' },
      { key: 'fineAmount', label: 'Valor de Multa' },
      { key: 'totalAmount', label: 'Valor Total' },
      { key: 'finePercentage', label: 'Multa (%)' },
      { key: 'readingId', label: 'Id da Leitura' }
    ];

  }
  ngOnInit() {
    
    this.getData()
  }

  
  getData() {

    this.store.dispatch(listAllClients());
    this.store.dispatch(getReceiptPaymentMethods());

    this.getClients$.pipe(takeUntil(this.destroy$)).subscribe(clients => {
      if (clients) {
        this.clientsList = clients;
        this.clientData = [
          { label: 'Seleccione...', value: '' },
          ...clients.map(client => ({
            label: client.name,
            value: client.clientId
          }))
        ];
      }
    });

    this.getPaymentMethods$.pipe(takeUntil(this.destroy$)).subscribe(paymentMethods => {
      if (paymentMethods) {
        this.paymentMethods = [
          { label: 'Seleccione...', value: '' },
          ...paymentMethods.map(paymentMethod => ({
            label: paymentMethod,
            value: paymentMethod
          }))
        ];
      }
    })
  }

  onClientSelected(event: { value: string; label: string }) {
    this.form.get('clientId')?.setValue(event.value);
    this.store.dispatch(getContractByClientId({ clientId: event.value }));

    this.store.pipe(select(selectSelectedContracts), takeUntil(this.unsubscribe$)).subscribe(contracts => {
      if (contracts && contracts.length > 0) {
        this.contractList = contracts;
        const firstContract = { value: contracts[0].contractId, label: contracts[0].meterId };
        this.selectedContractValue = firstContract.value;  
        this.contractsData = contracts.map(contract => ({
          label: contract.meterId,
          value: contract.contractId,
        }));
        this.onContractSelected(firstContract); 
      }
    });
  }

  onContractSelected(event: { value: string; label: string }) {
    const selectedContract = this.contractList.find(contract => contract.contractId === event.value);

    if (selectedContract) {
      this.customerBalance = selectedContract.balance;

      // Fetch invoices only if meter ID changes
      this.store.dispatch(getInvoiceByMeter({ meterId: event.label }));
      this.store.pipe(select(selectSelectedInvoices), takeUntil(this.unsubscribe$)).subscribe(invoices => {
        if (invoices) {
          this.invoicesData = invoices.filter(invoice => !invoice.paymentStatus);
        }
      });
    }
  }

  addInvoiceTosPayment(invoice: IInvoice) {
    if (!this.invoicesToBePaid.includes(invoice)) {
      this.invoicesToBePaid.push(invoice);
      this.form.patchValue({
        invoiceIds: this.invoicesToBePaid.map(invoice => invoice.invoiceId)
      });
      this.calculateOutstandingAmount();
    }
  }

  removeInvoiceFrsomPayment(invoice: any) {
    const index = this.invoicesToBePaid.indexOf(invoice);
    if (index > -1) {
      this.invoicesToBePaid.splice(index, 1);
      this.invoicesData.push(invoice);
      this.calculateOutstandingAmount();
    }
  }

  addInvoiceToPayment(invoice: IInvoice) {
    if (!this.invoicesToBePaid.includes(invoice)) {
      this.invoicesToBePaid.push(invoice);
      this.invoicesData = this.invoicesData.filter(i => i !== invoice);
      this.form.patchValue({
        invoiceIds: this.invoicesToBePaid.map(invoice => invoice.invoiceId)
      });
      this.calculateOutstandingAmount();
    }
  }

  removeInvoiceFromPayment(invoice: any) { 
    
    const index = this.invoicesToBePaid.indexOf(invoice);
    if (index > -1) {
        this.invoicesToBePaid.splice(index, 1);
        
        this.invoicesData.push(invoice);
        
        const invoiceIds = this.form.controls['invoiceIds'].value;
        
        const invoiceIndex = invoiceIds.indexOf(invoice.id);
        
        if (invoiceIndex > -1) {
            invoiceIds.splice(invoiceIndex, 1); 
            
            this.form.controls['invoiceIds'].setValue([...invoiceIds]);  
        }
        
        this.calculateOutstandingAmount();
    }  
}

  

  onPaymentMethodSelected(event: { value: string; label: string }) {
    this.form.get('paymentMethod')?.setValue(event.value)
  }

  onSubmit() { 
    if(this.form.valid){ 
      this.store.dispatch(createReceipt({receipt: this.form.value}))  
      this.store.pipe(
        select(selectSelectedReceipt),
        filter((receipt)=>!!receipt),
        first()
      ).subscribe(receipt => { 
        if (receipt) {
          this.store.dispatch(getReceiptFile({receiptId: receipt.receiptID}))
          this.invoicesToBePaid = []
        }
      })
    } 
  }

  calculateOutstandingAmount() {
    const totalInvoices = this.invoicesToBePaid.reduce((total, invoice) => total + invoice.totalAmount, 0);
    this.outstandingAmount = totalInvoices - this.customerBalance - this.valorPago;
  }

  formatCurrency(amount: number | null): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(amount || 0);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9.]/g, '');

    const parts = inputElement.value.split('.');
    if (parts.length > 2) {
      inputElement.value = parts[0] + '.' + parts.slice(1).join('');
    }

    this.form.controls['amount'].setValue(inputElement.value);
 
    this.valorPago = parseFloat(inputElement.value) || 0;
     
  }
}

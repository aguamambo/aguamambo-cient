import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { AuthService } from 'src/app/services/auth.service';
import { IInvoice } from './../../../../../models/invoice';
import { Component, OnInit } from '@angular/core';
import { selectClientIsLoading, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { createReceipt, getClientByZoneId, getContractByClientId, getEnterpriseByZoneId, getInvoiceByClientId, getInvoiceByMeter, getInvoiceByStatus, getReceiptFile, getReceiptPaymentMethods, getZoneByClientId, getZoneByEnterpriseId, listAllClients, listAllEnterprises, listAllZones, resetClientActions, resetClientMetersActions, resetContractActions, resetInvoiceActions, resetReceiptActions } from 'src/app/store';
import { IClient } from 'src/app/models/client';
import { IOption } from 'src/app/models/option';
import { selectInvoiceIsLoading, selectInvoiceIsSaving, selectInvoices } from 'src/app/store/selectors/invoice.selectors';
import { selectContractIsLoading, selectSelectedContracts } from 'src/app/store/selectors/contract.selectors';
import { IContract } from 'src/app/models/contract';
import { selectPaymentMethods, selectReceiptErrorMessage, selectReceiptIsSaving, selectSelectedReceipt, selectSelectedReceiptFile } from 'src/app/store/selectors/receipt.selectors';
import { DialogService } from 'src/app/services/dialog.service';
import { selectSelectedZone, selectSelectedZones, selectZoneIsLoading } from 'src/app/store/selectors/zone.selectors';
import { selectSelectedEnterprise, selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { IZone } from 'src/app/models/zone';
import { IEnterprise } from 'src/app/models/enterprise';


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
  isZoneLoading$: Observable<boolean>
  isReceiptSaving$: Observable<boolean>
  clientData: IOption[] = [];
  contractsData: IOption[] = [];
  firstContract!: IOption;
  paymentMethods: IOption[] = [];
  contractList: IContract[] = [];
  invoicesData: IInvoice[] = [];
  filteredInvoices: IInvoice[] = [];
  private destroy$ = new Subject<void>();
  private unsubscribe$ = new Subject<void>();
  clientsList: IClient[] = [];
  invoicesToBePaid: IInvoice[] = [];
  isDialogOpen: boolean = false;
  isOpen: boolean = false;
  dialogType: 'success' | 'error' = 'success';
  dialogMessage = '';
  outstandingText = 'Total a Pagar';
  selectedLabel = '';
  counter: string = 'Selecione...';
  invoiceColumns: { key: keyof IInvoice; label: string }[] = [];
  customerBalance: number = 0;
  enablePaymentButton: boolean = false;
  showInvoicesToBePaid: boolean = false
  showAmountInput: boolean = false
  showSubmitButton: boolean = false
  showInvoicesData: boolean = false
  valorPago: number = 0;
  outstandingAmount: number = 0;
  totalInvoicesValue: number = 0;
  zoneData: IOption[] = [];
  enterpriseData: IOption[] = [];
  enterprisesList: IEnterprise[] = [];
  zoneList: IZone[] = [];
  clientList: IClient[] = [];

  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));

  constructor(private fb: FormBuilder,
    private _dialogService: DialogService, private store: Store, private generic: GenericConfig, private auth: AuthService) {
    this.form = this.fb.group({
      paymentDate: [this.fullDate],
      amount: ['', Validators.required],
      invoiceIds: [[]],
      paymentMethod: ['', Validators.required],
      purpose: [''],
      clientId: ['', Validators.required],

    });

    this.isClientLoading$ = this.store.pipe(select(selectClientIsLoading))
    this.isZoneLoading$ = this.store.pipe(select(selectZoneIsLoading))
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
    this._dialogService.reset();
    this.store.dispatch(listAllEnterprises());
    this.store.dispatch(getReceiptPaymentMethods());

    this.getEnterprises$.pipe(filter((enterprises) => !!enterprises), takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprisesList = enterprises;
        this.enterpriseData = [
          { label: 'Seleccione...', value: '' },
          ...enterprises.map(enterprise => ({
            label: enterprise.name,
            value: enterprise.enterpriseId
          }))
        ];
      }
    });

    this.getClients$.pipe(filter((clients) => !!clients), takeUntil(this.destroy$)).subscribe(clients => {
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

    this.store.pipe(select(selectSelectedZones), filter((zones) => !!zones), takeUntil(this.destroy$)).subscribe(zones => {
      if (zones) {
        this.zoneList = zones;
        this.zoneData = [
          { label: 'Seleccione...', value: '' },
          ...zones.map(zone => ({
            label: zone.designation,
            value: zone.zoneId
          }))
        ];
      }
    });

    this.store.pipe(select(selectPaymentMethods), filter((paymentMethods) => !!paymentMethods), first()).subscribe(paymentMethods => {
      if (paymentMethods) {
        this.paymentMethods = [
          ...paymentMethods.map(paymentMethod => ({
            label: paymentMethod,
            value: paymentMethod,
          })),
        ];

        const mpesaOption = this.paymentMethods.find(method => method.value === 'MPESA');
        if (mpesaOption) {
          this.selectedLabel = mpesaOption.value
          this.form.get('paymentMethod')?.setValue(mpesaOption.value);
        }
      }
    });

  }

  filterInvoices(searchTerm: string): void {
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredInvoices = this.invoicesData.filter(invoice =>
      Object.values(invoice).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
  }



  onContractSelected(event: { value: string; label: string }) {

    this.store.dispatch(resetInvoiceActions());
 
    const selectedContract = this.contractList.find(contract => contract.contractId === event.value);
  
    if (selectedContract) {
      this.customerBalance = selectedContract.balance;

      this.store.dispatch(resetInvoiceActions());

      this.invoicesData = [];
      this.filteredInvoices = [];

      this.showInvoicesData = (this.invoicesData.length > 0);
 

      this.store.dispatch(getInvoiceByMeter({ meterId: selectedContract.meterId }));

      this.store.pipe(select(selectInvoices), filter((invoices) => !!invoices), takeUntil(this.destroy$))
        .subscribe(invoices => {
          if (invoices) {
  
            this.invoicesData = invoices.filter(invoice => !invoice.paymentStatus);

            this.filteredInvoices = [...this.invoicesData];

            this.showInvoicesData = (this.invoicesData.length > 0);
 
          }
        });
    }
  }


  addInvoiceToPayment(invoice: IInvoice) {
    if (!this.invoicesToBePaid.includes(invoice)) {
      this.invoicesToBePaid.push(invoice);
      this.invoicesData = this.invoicesData.filter(i => i !== invoice);
      this.form.patchValue({
        invoiceIds: this.invoicesToBePaid.map(invoice => invoice.invoiceId)
      });

      this.showInvoicesToBePaid = this.invoicesToBePaid.length > 0

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
    this.selectedLabel = event.value
    this.isOpen = ! this.isOpen
  }

  onSubmit() {
 
    this._dialogService.reset()
 if (this.form.valid) {

      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guarda ainformações do pagamento.',
        type: 'loading',
        isProcessing: true,
      });

      this.store.dispatch(createReceipt({ receipt: this.form.value }))

      this.store.pipe(select(selectReceiptErrorMessage)).subscribe(error => {
        if (error) {
          this._dialogService.open({
            title: 'Pagamento da Factura',
            type: 'error',
            message: 'Um erro ocorreu ao pagar a Factura! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
            isProcessing: false,
            showConfirmButton: false,
            errorDetails: error
          })
        } else {
          this.store.pipe(
            select(selectSelectedReceipt),
            filter((receipt) => !!receipt),
            first()
          ).subscribe({
            next: (receipt) => {
              if (receipt) {
                this._dialogService.open({
                  title: 'Sucesso',
                  message: 'Pagamento feito com sucesso!',
                  type: 'success'
                });
                this._dialogService.close(true);
                this._dialogService.open({
                  title: 'Recibo',
                  message: 'Carregando dados do Recibo.',
                  type: 'loading',
                  isProcessing: true,
                });
                this.store.dispatch(getReceiptFile({ receiptId: receipt.receiptID }))
                this.invoicesToBePaid = []
                this.form.reset()
              }
            }

          })

          this.store.pipe(select(selectReceiptErrorMessage)).subscribe(error => {
            if (error) {
              this._dialogService.open({
                title: 'Dados do Recibo',
                type: 'error',
                message: 'Um erro ocorreu ao carregar o Recibo!',
                isProcessing: false,
                showConfirmButton: false,
                errorDetails: error
              })
            } else {
              this.store
                .pipe(
                  select(selectSelectedReceiptFile),
                  filter((file) => !!file),
                  first()
                )
                .subscribe(file => {
                  if (file) {
                    this.resetField()
                    this.handleBase64File(file.base64);
                    this.onReset()
                  }
                });
            }
          })
        }
      })

    } else {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor verifique se os campos estão devidadmente preenchidos e volte a submeter.',
        isProcessing: false,
        showConfirmButton: false,
      })
    }
  }
  handleBase64File(base64String: string): void {
    const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
    this.openPdfFromBase64(cleanBase64);

  }
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }
  onValueSelected(option: IOption): void {
    if (option && option.value) {
      this.counter = ''
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.store.pipe(select(selectSelectedZones), filter((zones) => !!zones), takeUntil(this.destroy$)).subscribe(
        (zones) => {
          if (zones) {
            this.zoneList = zones;
            this.zoneData = [
              ...zones.map(zone => ({ label: zone.designation, value: zone.zoneId }))
            ];
          }
        }
      );
    }
  }

  openDialog(type: 'success' | 'error', message: string): void {
    this.dialogType = type;
    this.dialogMessage = message;
    this.isDialogOpen = true;
  }

  onEnterpriseSelected(option: IOption): void {
    if (option && option.value) {
      this.counter = '';

      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.store.pipe(select(selectSelectedZones), filter((zones) => !!zones), takeUntil(this.destroy$)).subscribe(
        (zones) => {
          if (zones) {
            this.zoneList = zones;
            this.zoneData = [
              ...zones.map(zone => ({ label: zone.designation, value: zone.zoneId }))
            ];
          }
        }
      );
    }
  }

  onZoneSelected(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.counter = '';

      this.store.dispatch(getClientByZoneId({ zoneId: event.value }));
      this.store.pipe(select(selectSelectedClients), filter((clients) => !!clients), takeUntil(this.destroy$)).subscribe(
        (clients) => {
          if (clients) {
            this.clientList = clients;
            this.clientData = [
              ...clients.map(client => ({ label: client.name, value: client.clientId }))
            ];
          }
        }
      );
    }
  }

  onClientSelected(event: { value: string; label: string }) {

    this.store.dispatch(resetContractActions());
    this.resetField() 

    this.contractList = [];
    

    this.form.get('clientId')?.setValue(event.value)

    this.store.dispatch(getContractByClientId({ clientId: event.value }));

    this.store
      .pipe(
        select(selectSelectedContracts),
        filter(contracts => !!contracts),
        first()
      )
      .subscribe(contracts => {
        if (contracts) {

          this.contractList = contracts;

          this.firstContract = { value: this.contractList[0].contractId, label: this.contractList[0].meterId };

          this.counter = this.firstContract.label;

          this.contractsData = contracts.map(contract => ({
            label: contract.meterId,
            value: contract.contractId,
          }));

          this.onContractSelected(this.firstContract);
        }
      });
  }


  onReset(): void {
    this.store.dispatch(resetReceiptActions());
    this.store.dispatch(resetClientActions());
    this.store.dispatch(resetContractActions());
    this.store.dispatch(resetClientMetersActions());
  }

  resetField() {
    this.outstandingAmount = 0
    this.totalInvoicesValue = 0
    this.customerBalance = 0
    this.invoicesToBePaid = []
    this.showAmountInput = false
    this.showSubmitButton = false
    this.invoicesData.length = 0
    this.filteredInvoices = [...this.invoicesData]
    this.showInvoicesData = this.invoicesData.length > 0
    this.showInvoicesToBePaid = this.invoicesToBePaid.length > 0
  }

  openPdfFromBase64(base64: string): void {
    try {

      const blob = this.base64ToBlob(base64, 'application/pdf');
      const url = URL.createObjectURL(blob);
      const pdfWindow = window.open('', '_blank');
      if (pdfWindow) {
        pdfWindow.document.write(
          `
            <html>
              <head>
                <style>
                  @import "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
                </style>
              </head>
              <body class="overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-800 flex items-center justify-center h-screen p-6">
                <div class="relative bg-slate-800 rounded-xl shadow-2xl p-4 max-w-5xl w-full h-[90vh]">
                  <button 
                    onclick="window.close()" 
                    class="absolute top-5 left-5 p-2 rounded-full bg-gray-800 text-white text-sm font-medium hover:bg-red-700 shadow-md" 
                    title="Fechar">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                    </svg>
                  </button>
                  <iframe 
                    class="w-full h-full rounded-lg shadow-lg border border-gray-200" 
                    src="${url}#zoom=100" 
                    frameborder="0" 
                    allowfullscreen>
                  </iframe>
                </div>
              </body>
            </html>
          `
        )
        this._dialogService.close(true)
      }
      else {
        this._dialogService.open({
          title: 'Erro ao carregar a factura',
          message: 'Ocorreu um erro inesperado. Por favor contacte a equipa tecnica para o suporte',
          type: 'error',
          showConfirmButton: true,
          cancelText: 'Cancelar',
        });
      }

    } catch (error) {
      this._dialogService.open({
        title: 'Erro ao carregar a factura',
        message: 'Ocorreu um erro inesperado. Por favor contacte a equipa tecnica para o suporte',
        type: 'error',
        showConfirmButton: true,
        cancelText: 'Cancelar',
      });
    }
  }

  private base64ToBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const byteArray = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return new Blob([byteArray], { type: mimeType });
  }


  calculateOutstandingAmount() {
    this.outstandingAmount = 0

    const totalInvoices = this.invoicesToBePaid.reduce((total, invoice) => total + invoice.totalAmount, 0);

    if (this.customerBalance <= 0) {
      this.outstandingAmount = Math.abs(this.customerBalance) + totalInvoices - this.valorPago
      this.outstandingText = 'Total a Pagar'
    } else
      {
        this.outstandingAmount = totalInvoices - this.customerBalance - this.valorPago;
        this.outstandingText = 'Total Remanescente'
      }
  
      this.totalInvoicesValue = totalInvoices
      
      this.showInvoicesToBePaid = this.invoicesToBePaid.length > 0

      if (totalInvoices===0) {
        this.form.controls['amount'].reset()
      }
      
      this.showAmountInput = totalInvoices > this.customerBalance && totalInvoices > 0

      if (this.showAmountInput) {
        this.showSubmitButton = false
      } else  {
        this.form.controls['amount'].setValue(totalInvoices);
        this.showSubmitButton =  totalInvoices > 0
      }
  }

  formatCurrency(amount: number): string {

    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(Math.abs(amount) || 0);
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9.]/g, '');

    const parts = inputElement.value.split('.');
    if (parts.length > 2) {
      inputElement.value = parts[0] + '.' + parts.slice(1).join('');
    }

      this.form.controls['amount'].setValue(inputElement.value);
      this.valorPago = parseFloat(inputElement.value) || 0;

      this.calculateOutstandingAmount()

      this.showSubmitButton = this.form.get('amount')?.value > 0 
       
  }
}

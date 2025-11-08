import { select, Store } from '@ngrx/store';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { AuthService } from 'src/app/services/auth.service';
import { IInvoice } from './../../../../../models/invoice';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { selectClientIsLoading, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { createReceipt, getClientByZoneId, getContractByClientId, getEnterpriseByZoneId, getInvoiceByMeter, getReceiptFile, getReceiptPaymentMethods, getZoneByClientId, getZoneByEnterpriseId, listAllClients, listAllEnterprises, listAllZones, resetClientActions, resetContractActions, resetInvoiceActions, resetReceiptActions } from 'src/app/store';
import { IClient } from 'src/app/models/client';
import { IOption } from 'src/app/models/option';
import { selectInvoiceIsLoading, selectInvoices } from 'src/app/store/selectors/invoice.selectors';
import { IContract } from 'src/app/models/contract';
import { selectPaymentMethods, selectReceiptErrorMessage, selectReceiptIsSaving, selectSelectedReceipt, selectSelectedReceiptFile } from 'src/app/store/selectors/receipt.selectors';
import { DialogService } from 'src/app/services/dialog.service';
import { selectSelectedZone, selectSelectedZones, selectZoneIsLoading } from 'src/app/store/selectors/zone.selectors';
import { selectSelectedEnterprise, selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { IZone } from 'src/app/models/zone';
import { IEnterprise } from 'src/app/models/enterprise';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { selectContractIsLoading, selectSelectedContracts } from 'src/app/store/selectors/contract.selectors';

@Component({
  selector: 'app-register-receipt',
  templateUrl: './register-receipt.component.html',
  styleUrls: ['./register-receipt.component.css']
})
export class RegisterReceiptComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  currentDate = new Date().toISOString().split('T')[0];
  fullDate = new Date().toISOString();

  isClientLoading$: Observable<boolean>;
  isInvoiceLoading$: Observable<boolean>;
  isContractLoading$: Observable<boolean>;
  isZoneLoading$: Observable<boolean>;
  isReceiptSaving$: Observable<boolean>;

  clientData: IOption[] = [];
  contractsData: IOption[] = [];
  firstContract!: IOption;
  paymentMethods: IOption[] = [];
  contractList: IContract[] = [];
  invoicesData: IInvoice[] = [];
  filteredInvoices: IInvoice[] = [];
  invoicesToBePaid: IInvoice[] = [];

  private destroy$ = new Subject<void>();

  clientsList: IClient[] = [];

  isOpen: boolean = false;
  isDialogOpen: boolean = false;
  dialogMessage = '';
  pdfUrl: SafeResourceUrl | null = null;
  title: string = 'Visualizar Recibo';

  outstandingText = 'Total a Pagar';
  selectedLabel: string = '';
  counter: string = 'Selecione...';
  invoiceColumns: { key: keyof IInvoice; label: string }[] = [];
  customerBalance: number = 0;
  showInvoicesToBePaid: boolean = false;
  showAmountInput: boolean = false;
  showSubmitButton: boolean = false;
  showInvoicesData: boolean = false;
  valorPago: number = 0;
  outstandingAmount: number = 0;
  totalInvoicesValue: number = 0;

  zoneData: IOption[] = [];
  enterpriseData: IOption[] = [];
  selectedEnterprise: IEnterprise | null = null;
  selectedZone: IZone | null = null;
  clientList: IClient[] = [];

  selectedEnterpriseId: string = '';
  selectedZoneId: string = '';
  selectedClientId: string = '';
  selectedContractId: string = '';

  selectedEnterpriseName: string = '';
  selectedZoneName: string = '';
  selectedClientName: string = '';
  selectedMeterId: string = '';
  showDetailsCard: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  paginatedInvoices: IInvoice[] = [];

  detailItems: { label: string; value: string; icon: string; color: string }[] = [];
  isInvoicesExpanded: boolean = true;
  isDropdownOpen: boolean = false;
  isLoading: boolean = false;

  getZoneByClientId$ = this.store.pipe(select(selectSelectedZone));
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getEnterpriseByZoneId$ = this.store.pipe(select(selectSelectedEnterprise));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getInvoices$ = this.store.pipe(select(selectInvoices));
  getPaymentMethods$ = this.store.pipe(select(selectPaymentMethods));
  getContracts$ = this.store.pipe(select(selectSelectedContracts));
  getReceiptErrorMessage$ = this.store.pipe(select(selectReceiptErrorMessage));
  getSelectedReceipt$ = this.store.pipe(select(selectSelectedReceipt));
  getSelectedReceiptFile$ = this.store.pipe(select(selectSelectedReceiptFile));

  constructor(
    private _dialogService: DialogService,
    private store: Store,
    private generic: GenericConfig,
    private auth: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.isClientLoading$ = this.store.pipe(select(selectClientIsLoading));
    this.isZoneLoading$ = this.store.pipe(select(selectZoneIsLoading));
    this.isInvoiceLoading$ = this.store.pipe(select(selectInvoiceIsLoading));
    this.isContractLoading$ = this.store.pipe(select(selectContractIsLoading));
    this.isReceiptSaving$ = this.store.pipe(select(selectReceiptIsSaving));

    this.invoiceColumns = [
      { key: 'invoiceId', label: 'Código' },
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
    this.getData();
    this.updateDetailItems();
  }

  updateDetailItems(): void {
    this.detailItems = [
      { label: 'Empresa', value: this.selectedEnterpriseName || 'N/A', icon: 'building-2', color: 'text-blue-500' },
      { label: 'Zona', value: this.selectedZoneName || 'N/A', icon: 'map-pin', color: 'text-green-500' },
      { label: 'Cliente', value: this.selectedClientName || 'N/A', icon: 'user', color: 'text-purple-500' },
      { label: 'Contador', value: this.selectedMeterId || 'N/A', icon: 'gauge', color: 'text-yellow-500' }
    ];
  }

  toggleInvoicesExpansion(): void {
    this.isInvoicesExpanded = !this.isInvoicesExpanded;
  }

  getSelectedPaymentMethodLabel(): string {
    const method = this.paymentMethods.find(m => m.value === this.selectedLabel);
    return method ? method.label : 'Seleccione o método de pagamento';
  }

  selectPaymentMethod(option: IOption): void {
    this.selectedLabel = option.value;
    this.isDropdownOpen = false;
  }

  get customerBalanceClass(): string {
    return this.customerBalance >= 0 ? 'text-green-600' : 'text-red-600';
  }

  get customerBalanceLabel(): string {
    return this.customerBalance >= 0 ? 'Saldo' : 'Dívida';
  }

  getData(): void {
    this._dialogService.reset();
    this.store.dispatch(listAllEnterprises());
    this.store.dispatch(listAllClients());
    this.store.dispatch(getReceiptPaymentMethods());

    this.getEnterpriseByZoneId$.pipe(filter((enterprise) => !!enterprise), first()).subscribe((enterprise) => {
      if (enterprise) {
        this.selectedEnterprise = enterprise;
        this.selectedEnterpriseId = enterprise.enterpriseId;
        this.selectedEnterpriseName = enterprise.name;
      }
    });

    this.getClients$.pipe(filter((clients) => !!clients), first()).subscribe(clients => {
      if (clients) {
        this.clientsList = clients;
        this.clientData = [
          { label: 'Seleccione o cliente', value: '' },
          ...clients.map(client => ({
            label: client.name,
            value: client.clientId
          }))
        ];
      }
    });

    this.getZoneByClientId$.pipe(filter((zone) => !!zone), first()).subscribe(zone => {
      if (zone) {
        this.selectedZone = zone;
        this.selectedZoneId = zone.zoneId;
        this.selectedZoneName = zone.description;
      }
    });

    this.getPaymentMethods$.pipe(filter((paymentMethods) => !!paymentMethods), first()).subscribe(paymentMethods => {
      if (paymentMethods) {
        this.paymentMethods = [...paymentMethods.map(paymentMethod => ({
            label: paymentMethod,
            value: paymentMethod,
          })),
        ];
        const mpesaOption = this.paymentMethods.find(method => method.value === 'MPESA');
        if (mpesaOption) {
          this.selectedLabel = mpesaOption.value;
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
    this.currentPage = 1;
    this.calculatePagination();
  }

  onClientSelected(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.selectedZoneId = '';
      this.selectedZoneName = '';
      this.selectedEnterpriseId = '';
      this.selectedEnterpriseName = '';
      this.selectedContractId = '';
      this.selectedMeterId = '';
      this.resetPaymentCalculations();

      this.selectedClientId = event.value;
      this.selectedClientName = event.label;

      this.updateDetailItems();

      this.store.dispatch(getZoneByClientId({ clientId: event.value }));

      this.store.pipe(select(selectSelectedZone), filter((zone) => !!zone), first()).subscribe((zone) => {
        if (zone) {
          console.log(zone);
          this.selectedZone = zone;
          this.selectedZoneId = zone.zoneId;
          this.selectedZoneName = zone.description;
          this.updateDetailItems();


          this.store.dispatch(getEnterpriseByZoneId({ zoneId: this.selectedZoneId }));

          this.store.pipe(select(selectSelectedEnterprise), filter((enterprise) => !!enterprise), first()).subscribe((enterprise) => {
            if (enterprise) {
              console.log(enterprise);

              this.selectedEnterprise = enterprise;
              this.selectedEnterpriseId = enterprise.enterpriseId;
              this.selectedEnterpriseName = enterprise.name;
              this.updateDetailItems();
            }
          });
        }
      });

      this.store.dispatch(getContractByClientId({ clientId: event.value }));

      this.store.pipe(
        select(selectSelectedContracts),
        filter(contracts => !!contracts),
        first()
      ).subscribe(contracts => {
        if (contracts && contracts.length > 0) {
          this.contractList = contracts;
          this.firstContract = { value: this.contractList[0].contractId, label: this.contractList[0].meterId };
          this.selectedContractId = this.firstContract.value;
          this.selectedMeterId = this.firstContract.label;
          this.counter = this.firstContract.label;
          this.contractsData = contracts.map(contract => ({
            label: contract.meterId,
            value: contract.contractId,
          }));
          this.onContractSelected(this.firstContract);
        } else {
          this.selectedContractId = '';
          this.selectedMeterId = '';
          this.counter = 'Nenhum contador encontrado';
          this.contractsData = [];
          this.resetPaymentCalculations();
        }
        this.updateDetailItems();
      })


      console.log(this.detailItems);
      this.showDetailsCard = true;
    }
  }


  onClientSelect(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.selectedClientId = event.value;
      this.selectedClientName = event.label;
      this.selectedZoneId = '';
      this.selectedZoneName = '';
      this.selectedEnterpriseId = '';
      this.selectedEnterpriseName = '';
      this.selectedContractId = '';
      this.selectedMeterId = '';
      this.counter = 'Selecione...';
      this.contractsData = [{ label: 'Selecione o contador', value: '' }];
      this.resetPaymentCalculations();
      this.updateDetailItems();

      this.store.dispatch(getZoneByClientId({ clientId: event.value }));

      this.store.pipe(select(selectSelectedZone), filter((zone) => !!zone), first()).subscribe((zone) => {
        if (zone) {
          this.selectedZone = zone;
          this.selectedZoneId = zone.zoneId;
          this.selectedZoneName = zone.description;
          this.updateDetailItems();

          this.store.dispatch(getEnterpriseByZoneId({ zoneId: this.selectedZoneId }));

          this.store.pipe(select(selectSelectedEnterprise), filter((enterprise) => !!enterprise), first()).subscribe((enterprise) => {
            if (enterprise) {
              this.selectedEnterprise = enterprise;
              this.selectedEnterpriseId = enterprise.enterpriseId;
              this.selectedEnterpriseName = enterprise.name;
              this.updateDetailItems();
            }
          });
        }
      });

      this.store.dispatch(getContractByClientId({ clientId: event.value }));

      this.store.pipe(
        select(selectSelectedContracts),
        filter(contracts => !!contracts),
        first()
      ).subscribe(contracts => {
        if (contracts && contracts.length > 0) {
          this.contractList = contracts;
          this.firstContract = { value: this.contractList[0].contractId, label: this.contractList[0].meterId };
          this.selectedContractId = this.firstContract.value;
          this.selectedMeterId = this.firstContract.label;
          this.counter = this.firstContract.label;
          this.contractsData = contracts.map(contract => ({
            label: contract.meterId,
            value: contract.contractId,
          }));
          this.onContractSelected(this.firstContract);
        } else {
          this.selectedContractId = '';
          this.selectedMeterId = '';
          this.counter = 'Nenhum contador encontrado';
          this.contractsData = [];
          this.resetPaymentCalculations();
        }
        this.updateDetailItems();
      });

      this.showDetailsCard = true;

      if (this.customerBalance < 0) {
        this.showAmountInput = true;
      }
    } else {
      this.resetField();
    }
  }


  onContractSelected(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.selectedContractId = event.value;
      this.selectedMeterId = event.label;
      this.store.dispatch(resetInvoiceActions());
      this.invoicesData = [];
      this.filteredInvoices = [];
      this.showInvoicesData = false;
      this.resetPaymentCalculations();
      this.updateDetailItems();

      const selectedContract = this.contractList.find(contract => contract.contractId === event.value);

      if (selectedContract) {
        this.customerBalance = selectedContract.balance;
        this.counter = selectedContract.meterId;

        // Forçar input se dívida mesmo sem faturas
        if (this.customerBalance < 0) {
          this.showAmountInput = true;
        }

        this.store.dispatch(getInvoiceByMeter({ meterId: selectedContract.meterId }));
        this.getInvoices$.pipe(
          filter((invoices) => !!invoices),
          first()
        ).subscribe(invoices => {
          if (invoices) {
            this.invoicesData = invoices.filter(invoice => !invoice.paymentStatus);
            this.filteredInvoices = [...this.invoicesData];
            this.showInvoicesData = this.invoicesData.length > 0;
            this.currentPage = 1;
            this.calculatePagination();
          }
        });
      }
    } else {
      this.selectedContractId = '';
      this.selectedMeterId = '';
      this.counter = 'Selecione...';
      this.resetPaymentCalculations();
      this.invoicesData = [];
      this.filteredInvoices = [];
      this.paginatedInvoices = [];
      this.showInvoicesData = false;
      // Keep showDetailsCard true if enterprise/zone/client are still selected
      if (!this.selectedEnterpriseId || !this.selectedZoneId || !this.selectedClientId) {
        this.showDetailsCard = false;
      }
      this.updateDetailItems(); // Update detail items
    }
  }

  addInvoiceToPayment(invoice: IInvoice): void {
    if (!this.invoicesToBePaid.some(i => i.invoiceId === invoice.invoiceId)) {
      this.invoicesToBePaid.push(invoice);
      this.invoicesData = this.invoicesData.filter(i => i.invoiceId !== invoice.invoiceId);
      this.filteredInvoices = this.filteredInvoices.filter(i => i.invoiceId !== invoice.invoiceId);
      this.showInvoicesToBePaid = this.invoicesToBePaid.length > 0;
      this.calculateOutstandingAmount();
      this.calculatePagination();
    }
  }

  removeInvoice(invoiceId: string): void {
    const index = this.invoicesToBePaid.findIndex(i => i.invoiceId === invoiceId);
    if (index > -1) {
      const removedInvoice = this.invoicesToBePaid.splice(index, 1)[0];
      this.invoicesData.push(removedInvoice);
      this.filteredInvoices.push(removedInvoice);
      this.showInvoicesToBePaid = this.invoicesToBePaid.length > 0;
      this.calculateOutstandingAmount();
      this.calculatePagination();
    }
  }


  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onSubmit(): void {
    this._dialogService.reset();
    this.isLoading = true;

    if (!this.canSubmit) {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor, verifique os campos...',
        isProcessing: false,
        showConfirmButton: false,
      });
      this.isLoading = false;
      return;
    }

    const receiptPayload = {
      paymentDate: this.fullDate,
      amount: this.valorPago,
      invoiceIds: this.invoicesToBePaid.map(inv => inv.invoiceId), // Pode ser vazio se dívida
      paymentMethod: this.selectedLabel,
      purpose: '',
      clientId: this.selectedClientId,
    };

    this.store.dispatch(createReceipt({ receipt: receiptPayload }));

    this.getSelectedReceipt$.pipe(
      filter((receipt) => !!receipt),
      first()
    ).subscribe({
      next: (receipt) => {
        if (receipt) {
          this.isDialogOpen = true;
          this.dialogMessage = 'Carregando o documento...';
          this.title = 'Recibo de Pagamento';
          this.store.dispatch(getReceiptFile({ receiptId: receipt.receiptID }));
          this.resetFormAndData();
          this.isLoading = false;
        }
      },
      error: (error) => {
        // Error handling...
        this.isLoading = false;
      }
    });

    this.getSelectedReceiptFile$.pipe(
      filter((file) => !!file),
      first()
    ).subscribe(file => {
      if (file && file.base64) {
        this.handleBase64File(file.base64);
      }
    });
  }


  handleBase64File(base64String: string): void {
    const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
    this.openPdfFromBase64(cleanBase64);
  }


  openPdfFromBase64(base64: string, mimeType: string = 'application/pdf'): void {
    try {
      const blob = this.base64ToBlob(base64, mimeType);
      const url = URL.createObjectURL(blob);
      // Use DomSanitizer to mark the URL as safe for resource URLs
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.dialogMessage = ''; // Clear loading message on success
      this.isDialogOpen = true; // Ensure dialog is open
    } catch (error) {
      console.error('Error preparing PDF for display:', error);
      this.dialogMessage = 'Erro ao exibir PDF.';
      this.pdfUrl = null;
      this.isDialogOpen = true; // Keep dialog open to show error message
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

  calculateOutstandingAmount(): void {
    const totalInvoices = this.invoicesToBePaid.reduce((total, invoice) => total + invoice.totalAmount, 0);
    this.totalInvoicesValue = totalInvoices;

    if (this.customerBalance <= 0) {
      this.outstandingAmount = Math.abs(this.customerBalance) + totalInvoices - this.valorPago;
      this.outstandingText = 'Total a Pagar';
    } else {
      this.outstandingAmount = totalInvoices - this.customerBalance - this.valorPago;
      this.outstandingText = 'Total Remanescente';
    }

    this.showAmountInput = (totalInvoices - this.customerBalance) > 0 || this.customerBalance < 0;

    if (!this.showAmountInput && totalInvoices > 0) {
      this.valorPago = totalInvoices;
    } else if (totalInvoices === 0 && this.customerBalance >= 0) {
      this.valorPago = 0;
    }
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9.]/g, '');
    const parts = inputElement.value.split('.');
    if (parts.length > 2) {
      inputElement.value = parts[0] + '.' + parts.slice(1).join('');
    }
    this.valorPago = parseFloat(inputElement.value) || 0;
    if (this.valorPago < 0) this.valorPago = 0; // Bloqueia negativos
    this.calculateOutstandingAmount();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(Math.abs(amount) || 0);
  }

  resetFormAndData(): void {
    // Manually reset all properties that were previously part of the form
    this.selectedEnterpriseId = '';
    this.selectedEnterpriseName = '';
    this.selectedZoneId = '';
    this.selectedZoneName = '';
    this.selectedClientId = '';
    this.selectedClientName = '';
    this.selectedContractId = '';
    this.selectedMeterId = '';
    this.valorPago = 0;
    this.invoicesToBePaid = [];
    this.invoicesData = [];
    this.filteredInvoices = [];
    this.paginatedInvoices = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.outstandingAmount = 0;
    this.totalInvoicesValue = 0;
    this.customerBalance = 0;
    this.selectedLabel = this.paymentMethods.find(method => method.value === 'MPESA')?.value || ''; // Reset to default
    this.counter = 'Selecione...'; // Reset meter placeholder
    this.showInvoicesData = false;
    this.showInvoicesToBePaid = false;
    this.showAmountInput = false;
    this.showDetailsCard = false; // Hide details card on full reset
    this.updateDetailItems(); // Update detail items

    // Dispatch reset actions for NGRX stores
    this.store.dispatch(resetReceiptActions());
    this.store.dispatch(resetClientActions());
    this.store.dispatch(resetContractActions());
    this.store.dispatch(resetInvoiceActions());
    // Re-load initial data for dropdowns
    this.getData();
  }

  resetPaymentCalculations(): void {
    this.outstandingAmount = 0;
    this.totalInvoicesValue = 0;
    this.customerBalance = 0;
    this.invoicesToBePaid = [];
    this.showAmountInput = false;
    this.showInvoicesData = false;
    this.showInvoicesToBePaid = false;
    this.valorPago = 0;
    this.invoicesData = [];
    this.filteredInvoices = [];
    this.paginatedInvoices = [];
    this.currentPage = 1;
    this.totalPages = 0;

  }

  resetField(): void {
    this.selectedEnterpriseId = '';
    this.selectedEnterpriseName = '';
    this.selectedZoneId = '';
    this.selectedZoneName = '';
    this.selectedClientId = '';
    this.selectedClientName = '';
    this.selectedContractId = '';
    this.selectedMeterId = '';
    this.counter = 'Selecione...';
    this.zoneData = [{ label: 'Seleccione a zona', value: '' }];
    this.clientData = [{ label: 'Seleccione o cliente', value: '' }];
    this.contractsData = [{ label: 'Selecione o contador', value: '' }];
    this.showDetailsCard = false;
    this.updateDetailItems();
    this.resetPaymentCalculations();
  }

  get canSubmit(): boolean {
    const hasClient = !!this.selectedClientId;
    const hasPaymentMethod = !!this.selectedLabel;
    const hasValidAmount = this.valorPago > 0 || Math.abs(this.customerBalance) > 0;
    const hasDebtOrInvoicesOrPayment = this.customerBalance < 0 || this.invoicesToBePaid.length > 0 || this.valorPago > 0;
    return hasClient && hasPaymentMethod && hasValidAmount && hasDebtOrInvoicesOrPayment;
  }

  get isButtonDisabled(): boolean {
    return !this.canSubmit || this.isLoading;
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedInvoices = this.filteredInvoices.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get invoiceIdsToDisplay(): string {
    return this.invoicesToBePaid.map(invoice => invoice.invoiceId).join(', ');
  }
}

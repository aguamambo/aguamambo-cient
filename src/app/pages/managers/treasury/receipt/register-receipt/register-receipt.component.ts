import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { AuthService } from 'src/app/services/auth.service';
import { IInvoice } from './../../../../../models/invoice';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { selectClientIsLoading, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { createReceipt, getClientByZoneId, getContractByClientId, getInvoiceByMeter, getReceiptFile, getReceiptPaymentMethods, getZoneByEnterpriseId, listAllEnterprises, listAllZones, resetClientActions, resetContractActions, resetInvoiceActions, resetReceiptActions } from 'src/app/store';
import { IClient } from 'src/app/models/client';
import { IOption } from 'src/app/models/option';
import { selectInvoiceIsLoading, selectInvoices } from 'src/app/store/selectors/invoice.selectors'; 
import { IContract } from 'src/app/models/contract';
import { selectPaymentMethods, selectReceiptErrorMessage, selectReceiptIsSaving, selectSelectedReceipt, selectSelectedReceiptFile } from 'src/app/store/selectors/receipt.selectors';
import { DialogService } from 'src/app/services/dialog.service';
import { selectSelectedZones, selectZoneIsLoading } from 'src/app/store/selectors/zone.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { IZone } from 'src/app/models/zone';
import { IEnterprise } from 'src/app/models/enterprise';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Import DomSanitizer and SafeResourceUrl
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
  invoicesData: IInvoice[] = []; // All invoices for the selected client's meter
  filteredInvoices: IInvoice[] = []; // Invoices filtered by search term
  invoicesToBePaid: IInvoice[] = []; // Invoices selected by the user for payment

  private destroy$ = new Subject<void>();

  clientsList: IClient[] = [];

  isOpen: boolean = false; // Controls visibility of payment method dropdown
  isDialogOpen: boolean = false; // Controls visibility of dialog
  dialogMessage = ''; // Message for PDF loading dialog
  pdfUrl: SafeResourceUrl | null = null; // URL for the PDF to be displayed in the iframe
  title: string = 'Visualizar Recibo'; // Title for the PDF viewer dialog

  outstandingText = 'Total a Pagar';
  selectedLabel: string = ''; // Holds selected payment method label
  counter: string = 'Selecione...'; // Placeholder for meter dropdown
  invoiceColumns: { key: keyof IInvoice; label: string }[] = [];
  customerBalance: number = 0;
  showInvoicesToBePaid: boolean = false;
  showAmountInput: boolean = false;
  showSubmitButton: boolean = false;
  showInvoicesData: boolean = false; // Controls visibility of the invoice list table
  valorPago: number = 0; // Amount entered by the user for payment
  outstandingAmount: number = 0; // Remaining amount to pay or change
  totalInvoicesValue: number = 0; // Sum of selected invoices' totalAmount

  zoneData: IOption[] = [];
  enterpriseData: IOption[] = [];
  enterprisesList: IEnterprise[] = [];
  zoneList: IZone[] = [];
  clientList: IClient[] = [];

  // Manual state properties for dropdowns and display
  selectedEnterpriseId: string = '';
  selectedZoneId: string = '';
  selectedClientId: string = '';
  selectedContractId: string = '';

  selectedEnterpriseName: string = ''; // For display in details card
  selectedZoneName: string = '';       // For display in details card
  selectedClientName: string = '';     // For display in details card
  selectedMeterId: string = '';        // For display in details card
  showDetailsCard: boolean = false;    // Controls visibility of the details card

  // Pagination properties for invoices
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of invoices to display per page
  totalPages: number = 0;
  paginatedInvoices: IInvoice[] = []; // Invoices for the current page

  // New properties for the enhanced Details Card and Payment Form
  detailItems: { label: string; value: string; icon: string; color: string }[] = [];
  isInvoicesExpanded: boolean = true; // State for expanding/collapsing invoices table
  isDropdownOpen: boolean = false; // State for payment method dropdown
  isLoading: boolean = false; // Overall loading state for submit button

  // NGRX Selectors
  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
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
    private sanitizer: DomSanitizer // Inject DomSanitizer
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
    this.updateDetailItems(); // Initialize detail items
    // No form.valueChanges subscription needed as we are not using reactive forms for payment details
  }

  /**
   * Updates the detail items displayed in the details card.
   */
  updateDetailItems(): void {
    this.detailItems = [
      { label: 'Empresa', value: this.selectedEnterpriseName || 'N/A', icon: 'building-2', color: 'text-blue-500' },
      { label: 'Zona', value: this.selectedZoneName || 'N/A', icon: 'map-pin', color: 'text-green-500' },
      { label: 'Cliente', value: this.selectedClientName || 'N/A', icon: 'user', color: 'text-purple-500' },
      { label: 'Contador', value: this.selectedMeterId || 'N/A', icon: 'gauge', color: 'text-yellow-500' }
    ];
  }

  /**
   * Toggles the expansion state of the invoices table.
   */
  toggleInvoicesExpansion(): void {
    this.isInvoicesExpanded = !this.isInvoicesExpanded;
  }

  /**
   * Returns the label for the selected payment method.
   * @returns The label of the selected payment method or a placeholder.
   */
  getSelectedPaymentMethodLabel(): string {
    const method = this.paymentMethods.find(m => m.value === this.selectedLabel);
    return method ? method.label : 'Seleccione o método de pagamento';
  }

  /**
   * Selects a payment method and updates the component property.
   * @param option The selected payment method option.
   */
  selectPaymentMethod(option: IOption): void {
    this.selectedLabel = option.value;
    this.isDropdownOpen = false;
  }

  /**
   * Returns the CSS class for the customer balance text based on its value.
   * @returns CSS class string.
   */
  get customerBalanceClass(): string {
    return this.customerBalance >= 0 ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Returns the label for the customer balance (Saldo or Dívida).
   * @returns Label string.
   */
  get customerBalanceLabel(): string {
    return this.customerBalance >= 0 ? 'Saldo' : 'Dívida';
  }

  /**
   * Fetches initial data for enterprises, payment methods, zones, and clients.
   */
  getData(): void {
    this._dialogService.reset(); // Reset dialog service state
    this.store.dispatch(listAllEnterprises());
    this.store.dispatch(getReceiptPaymentMethods());

    // Subscribe to enterprises data
    this.getEnterprises$.pipe(filter((enterprises) => !!enterprises), takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprisesList = enterprises;
        this.enterpriseData = [
          { label: 'Seleccione a empresa', value: '' },
          ...enterprises.map(enterprise => ({
            label: enterprise.name,
            value: enterprise.enterpriseId
          }))
        ];
      }
    });

    // Subscribe to clients data (might be redundant if clients are loaded by zone later)
    this.getClients$.pipe(filter((clients) => !!clients), takeUntil(this.destroy$)).subscribe(clients => {
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

    // Subscribe to zones data
    this.getZonesByEnterprise$.pipe(filter((zones) => !!zones), takeUntil(this.destroy$)).subscribe(zones => {
      if (zones) {
        this.zoneList = zones;
        this.zoneData = [
          { label: 'Seleccione a zona', value: '' },
          ...zones.map(zone => ({
            label: zone.designation,
            value: zone.zoneId
          }))
        ];
      }
    });

    // Subscribe to payment methods
    this.getPaymentMethods$.pipe(filter((paymentMethods) => !!paymentMethods), first()).subscribe(paymentMethods => {
      if (paymentMethods) {
        this.paymentMethods = [
          ...paymentMethods.map(paymentMethod => ({
            label: paymentMethod,
            value: paymentMethod,
          })),
        ];
        // Set default payment method to 'MPESA' if available
        const mpesaOption = this.paymentMethods.find(method => method.value === 'MPESA');
        if (mpesaOption) {
          this.selectedLabel = mpesaOption.value;
        }
      }
    });
  }

  /**
   * Filters the list of invoices based on a search term.
   * @param searchTerm The string to filter invoices by.
   */
  filterInvoices(searchTerm: string): void {
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredInvoices = this.invoicesData.filter(invoice =>
      Object.values(invoice).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
    this.currentPage = 1; // Reset to first page on filter change
    this.calculatePagination(); // Recalculate pagination
  }

  /**
   * Handles the selection of an enterprise from the dropdown.
   * Dispatches action to get zones for the selected enterprise.
   * @param option The selected enterprise option.
   */
  onEnterpriseSelected(option: IOption): void {
    if (option && option.value) {
      this.selectedEnterpriseId = option.value;
      this.selectedEnterpriseName = option.label; // Set selected enterprise name
      this.selectedZoneId = ''; // Reset selected zone ID
      this.selectedZoneName = ''; // Reset selected zone name
      this.selectedClientId = ''; // Reset selected client ID
      this.selectedClientName = ''; // Reset selected client name
      this.selectedContractId = ''; // Reset selected contract ID
      this.selectedMeterId = ''; // Reset selected meter ID
      this.counter = 'Selecione...'; // Reset counter placeholder

      this.zoneData = [{ label: 'Seleccione a zona', value: '' }]; // Clear zone data
      this.clientData = [{ label: 'Seleccione o cliente', value: '' }]; // Clear client data
      this.contractsData = [{ label: 'Selecione o contador', value: '' }]; // Clear contracts data
      this.resetPaymentCalculations(); // Reset payment related fields and invoices
      this.showDetailsCard = true; // Show details card
      this.updateDetailItems(); // Update detail items

      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.getZonesByEnterprise$.pipe(filter((zones) => !!zones), takeUntil(this.destroy$)).subscribe(
        (zones) => {
          if (zones) {
            this.zoneList = zones;
            this.zoneData = [
              { label: 'Seleccione a zona', value: '' },
              ...zones.map(zone => ({ label: zone.designation, value: zone.zoneId }))
            ];
          }
        }
      );
    } else {
      this.selectedEnterpriseId = '';
      this.selectedEnterpriseName = ''; // Clear selected enterprise name
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
      this.resetPaymentCalculations();
      this.showDetailsCard = false; // Hide details card if no enterprise is selected
      this.updateDetailItems(); // Update detail items
    }
  }

  /**
   * Handles the selection of a zone from the dropdown.
   * Dispatches action to get clients for the selected zone.
   * @param event The selected zone option.
   */
  onZoneSelected(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.selectedZoneId = event.value;
      this.selectedZoneName = event.label; // Set selected zone name
      this.selectedClientId = ''; // Reset selected client ID
      this.selectedClientName = ''; // Reset selected client name
      this.selectedContractId = ''; // Reset selected contract ID
      this.selectedMeterId = ''; // Reset selected meter ID
      this.counter = 'Selecione...'; // Reset counter placeholder

      this.clientData = [{ label: 'Seleccione o cliente', value: '' }]; // Clear client data
      this.contractsData = [{ label: 'Selecione o contador', value: '' }]; // Clear contracts data
      this.resetPaymentCalculations(); // Reset payment related fields and invoices
      this.updateDetailItems(); // Update detail items

      this.store.dispatch(getClientByZoneId({ zoneId: event.value }));
      this.getClientsByZone$.pipe(filter((clients) => !!clients), takeUntil(this.destroy$)).subscribe(
        (clients) => {
          if (clients) {
            this.clientList = clients;
            this.clientData = [
              { label: 'Seleccione o cliente', value: '' },
              ...clients.map(client => ({ label: client.name, value: client.clientId }))
            ];
          }
        }
      );
    } else {
      this.selectedZoneId = '';
      this.selectedZoneName = ''; // Clear selected zone name
      this.selectedClientId = '';
      this.selectedClientName = '';
      this.selectedContractId = '';
      this.selectedMeterId = '';
      this.counter = 'Selecione...';
      this.clientData = [{ label: 'Seleccione o cliente', value: '' }];
      this.contractsData = [{ label: 'Selecione o contador', value: '' }];
      this.resetPaymentCalculations();
      // Keep showDetailsCard true if an enterprise is still selected
      if (!this.selectedEnterpriseId) {
        this.showDetailsCard = false;
      }
      this.updateDetailItems(); // Update detail items
    }
  }

  /**
   * Handles the selection of a client from the dropdown.
   * Dispatches action to get contracts for the selected client.
   * @param event The selected client option.
   */
  onClientSelected(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.selectedClientId = event.value;
      this.selectedClientName = event.label; // Set selected client name
      this.selectedContractId = ''; // Reset selected contract ID
      this.selectedMeterId = ''; // Reset selected meter ID
      this.counter = 'Selecione...'; // Reset counter placeholder
      this.contractsData = [{ label: 'Selecione o contador', value: '' }]; // Clear contracts data
      this.resetPaymentCalculations(); // Reset payment related fields and invoices
      this.updateDetailItems(); // Update detail items

      this.store.dispatch(getContractByClientId({ clientId: event.value }));
      this.getContracts$.pipe(
        filter(contracts => !!contracts),
        first(),
        takeUntil(this.destroy$)
      ).subscribe(contracts => {
        if (contracts && contracts.length > 0) {
          this.contractList = contracts;
          this.firstContract = { value: this.contractList[0].contractId, label: this.contractList[0].meterId };
          this.selectedContractId = this.firstContract.value; // Set selected contract ID
          this.selectedMeterId = this.firstContract.label; // Set selected meter ID
          this.counter = this.firstContract.label; // Display first meter ID as selected
          this.contractsData = contracts.map(contract => ({
            label: contract.meterId,
            value: contract.contractId,
          }));
          this.onContractSelected(this.firstContract); // Automatically load invoices for the first contract
        } else {
          this.selectedContractId = '';
          this.selectedMeterId = '';
          this.counter = 'Nenhum contador encontrado';
          this.contractsData = [];
          this.resetPaymentCalculations(); // Clear invoices if no contracts found
        }
        this.updateDetailItems(); // Update detail items
      });
    } else {
      this.selectedClientId = '';
      this.selectedClientName = ''; // Clear selected client name
      this.selectedContractId = '';
      this.selectedMeterId = '';
      this.counter = 'Selecione...';
      this.contractsData = [{ label: 'Seleccione o contador', value: '' }];
      this.resetPaymentCalculations();
      // Keep showDetailsCard true if enterprise/zone are still selected
      if (!this.selectedEnterpriseId || !this.selectedZoneId) {
        this.showDetailsCard = false;
      }
      this.updateDetailItems(); // Update detail items
    }
  }

  /**
   * Handles the selection of a contract (meter) from the dropdown.
   * Dispatches action to get invoices for the selected meter.
   * @param event The selected contract option.
   */
  onContractSelected(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.selectedContractId = event.value;
      this.selectedMeterId = event.label; // Set selected meter ID
      this.store.dispatch(resetInvoiceActions()); // Reset previous invoice actions
      this.invoicesData = [];
      this.filteredInvoices = [];
      this.showInvoicesData = false;
      this.resetPaymentCalculations(); // Reset payment calculations when new contract is selected
      this.updateDetailItems(); // Update detail items

      const selectedContract = this.contractList.find(contract => contract.contractId === event.value);

      if (selectedContract) {
        this.customerBalance = selectedContract.balance; // Set customer balance
        this.counter = selectedContract.meterId; // Update displayed meter ID

        this.store.dispatch(getInvoiceByMeter({ meterId: selectedContract.meterId }));
        this.getInvoices$.pipe(
          filter((invoices) => !!invoices),
          takeUntil(this.destroy$)
        ).subscribe(invoices => {
          if (invoices) {
            // Filter out already paid invoices
            this.invoicesData = invoices.filter(invoice => !invoice.paymentStatus);
            this.filteredInvoices = [...this.invoicesData];
            this.showInvoicesData = this.invoicesData.length > 0;
            this.currentPage = 1; // Reset page to 1 for new invoice list
            this.calculatePagination(); // Recalculate pagination for new invoices
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

  /**
   * Adds an invoice to the list of invoices to be paid.
   * @param invoice The invoice to add.
   */
  addInvoiceToPayment(invoice: IInvoice): void {
    if (!this.invoicesToBePaid.some(i => i.invoiceId === invoice.invoiceId)) { // Check by invoiceId
      this.invoicesToBePaid.push(invoice);
      this.invoicesData = this.invoicesData.filter(i => i.invoiceId !== invoice.invoiceId); // Remove from available invoices
      this.filteredInvoices = this.filteredInvoices.filter(i => i.invoiceId !== invoice.invoiceId); // Remove from filtered invoices
      this.showInvoicesToBePaid = this.invoicesToBePaid.length > 0;
      this.calculateOutstandingAmount();
      this.calculatePagination(); // Recalculate pagination after adding
    }
  }

  /**
   * Removes an invoice from the list of invoices to be paid.
   * @param invoiceId The ID of the invoice to remove.
   */
  removeInvoice(invoiceId: string): void {
    const index = this.invoicesToBePaid.findIndex(i => i.invoiceId === invoiceId);
    if (index > -1) {
      const removedInvoice = this.invoicesToBePaid.splice(index, 1)[0];
      this.invoicesData.push(removedInvoice); // Add back to available invoices
      this.filteredInvoices.push(removedInvoice); // Add back to filtered invoices
      this.showInvoicesToBePaid = this.invoicesToBePaid.length > 0;
      this.calculateOutstandingAmount();
      this.calculatePagination(); // Recalculate pagination after removing
    }
  }

  /**
   * Toggles the visibility of the payment method dropdown.
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Handles form submission to create a new receipt.
   */
  onSubmit(): void {
    this._dialogService.reset();
    this.isLoading = true; // Set loading state for the button

    // Manual validation: Allow valorPago <= 0 only if customerBalance > 0
    if (!this.selectedEnterpriseId || !this.selectedZoneId || !this.selectedClientId || !this.selectedLabel || this.invoicesToBePaid.length === 0 || (this.valorPago <= 0 && this.customerBalance <= 0)) {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor, verifique se todos os campos obrigatórios estão preenchidos, se há faturas selecionadas e o valor pago é válido (ou se o cliente tem saldo positivo).',
        isProcessing: false,
        showConfirmButton: false,
      });
      this.isLoading = false;
      return;
    }

    
    // Manually construct the receipt payload
    const receiptPayload = {
      paymentDate: this.fullDate,
      amount: this.valorPago,
      invoiceIds: this.invoicesToBePaid.map(inv => inv.invoiceId),
      paymentMethod: this.selectedLabel,
      purpose: '', // Assuming purpose is optional or handled elsewhere
      clientId: this.selectedClientId,
    };

    this.store.dispatch(createReceipt({ receipt: receiptPayload }));

    this.getSelectedReceipt$.pipe(
      filter((receipt) => !!receipt),
      first(),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (receipt) => {
        if (receipt) {
          // Set dialog properties for the app-pdf-viewer
          this.isDialogOpen = true;
          this.dialogMessage = 'Carregando o documento...';
          this.title = 'Recibo de Pagamento'; // Set the title for the PDF viewer

          // Immediately dispatch action to get the receipt file
          this.store.dispatch(getReceiptFile({ receiptId: receipt.receiptID }));
          this.resetFormAndData(); // Reset form and data after successful payment
          this.isLoading = false;
        }
      },
      error: (error) => {
        this._dialogService.open({
          title: 'Erro no Pagamento',
          type: 'error',
          message: error.message || 'Um erro ocorreu ao pagar a Factura! Verifique se os dados estão devidamente preenchidos e tente novamente.',
          isProcessing: false,
          showConfirmButton: false,
          errorDetails: error
        });
        this.isLoading = false;
      }
    });

    // Subscribe to receipt file data after dispatching getReceiptFile
    this.getSelectedReceiptFile$.pipe(
      filter((file) => !!file),
      first(),
      takeUntil(this.destroy$)
    ).subscribe(file => {
      if (file && file.base64) {
        this.handleBase64File(file.base64);
        // The dialog will be closed by the app-pdf-viewer's (closed) event or when the PDF is loaded.
      } else {
        this.dialogMessage = 'Não foi possível carregar o recibo.'; // Update dialog message if PDF fails to load
      }
    });
  }

  /**
   * Converts a base64 string to a Blob and prepares the URL for PDF display.
   * @param base64String The base64 encoded PDF string.
   */
  handleBase64File(base64String: string): void {
    const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
    this.openPdfFromBase64(cleanBase64);
  }

  /**
   * Sets the PDF URL for the app-pdf-viewer component.
   * @param base64 The base64 string of the PDF.
   * @param mimeType The MIME type of the file (defaults to 'application/pdf').
   */
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

  /**
   * Converts a base64 string to a Blob object.
   * @param base64 The base64 string.
   * @param mimeType The MIME type of the data.
   * @returns A Blob object.
   */
  private base64ToBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const byteArray = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Calculates the outstanding amount based on selected invoices, customer balance, and paid amount.
   */
  calculateOutstandingAmount(): void {
    const totalInvoices = this.invoicesToBePaid.reduce((total, invoice) => total + invoice.totalAmount, 0);
    this.totalInvoicesValue = totalInvoices;
 
    // Determine outstanding amount and text based on customer balance and total invoices
    if (this.customerBalance <= 0) {
      // If customer has a debt or zero balance, add it to total invoices
      this.outstandingAmount = Math.abs(this.customerBalance) + totalInvoices - this.valorPago;
      this.outstandingText = 'Total a Pagar';
    } else {
      // If customer has a positive balance, subtract it from total invoices
      this.outstandingAmount = totalInvoices - this.customerBalance - this.valorPago;
      this.outstandingText = 'Total Remanescente';
    }

    // Adjust visibility of amount input
    // Show amount input only if there's a positive amount to be paid after considering balance
    this.showAmountInput = (totalInvoices - this.customerBalance) > 0;

    // If amount input is not shown, auto-fill amount with total invoices value if totalInvoices > 0
    // Or set to 0 if no invoices or balance covers it
    if (!this.showAmountInput && totalInvoices > 0) {
      this.valorPago = totalInvoices; // If balance covers it, or it's a credit, still show total invoices value
    } else if (totalInvoices === 0) {
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

      this.calculateOutstandingAmount()

       
  }

  /**
   * Formats a number as currency in Mozambican Metical (MZN).
   * @param amount The number to format.
   * @returns The formatted currency string.
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(Math.abs(amount) || 0);
  }

  /**
   * Resets the form and all related data and flags to their initial state.
   */
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

  /**
   * Resets only the payment calculation related fields and invoice lists.
   * Used when changing client/contract to clear previous invoice selections.
   */
  resetPaymentCalculations(): void {
    this.outstandingAmount = 0;
    this.totalInvoicesValue = 0;
    this.customerBalance = 0;
    this.invoicesToBePaid = [];
    this.showAmountInput = false;
    this.showInvoicesData = false;
    this.showInvoicesToBePaid = false;
    this.valorPago = 0; // Reset paid value
    this.invoicesData = []; // Clear current invoices data
    this.filteredInvoices = []; // Clear filtered invoices data
    this.paginatedInvoices = []; // Clear paginated invoices data
    this.currentPage = 1; // Reset pagination
    this.totalPages = 0;
    // No form control resets here
    // this.counter = 'Selecione...'; // Keep counter text as it might be set by contract selection
  }

  /**
   * Resets all fields including dropdown selections and details card visibility.
   * This is a more comprehensive reset than resetPaymentCalculations.
   */
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
    this.updateDetailItems(); // Update detail items
    this.resetPaymentCalculations(); // Call the more specific reset for payment calculations
  }

  // --- Pagination Logic for Invoices ---

  /**
   * Calculates total pages and updates the paginatedInvoices array based on current page and items per page.
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedInvoices = this.filteredInvoices.slice(startIndex, endIndex);
  }

  /**
   * Navigates to a specific page.
   * @param page The page number to navigate to.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }

  /**
   * Navigates to the previous page.
   */
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  /**
   * Navigates to the next page.
   */
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

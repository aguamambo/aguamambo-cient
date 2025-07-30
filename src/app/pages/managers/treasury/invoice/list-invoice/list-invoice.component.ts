import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { IInvoice } from 'src/app/models/invoice';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { IAppState, listAllInvoices, getWaterBillByReadingId, resetInvoiceActions, getInvoiceByZoneId, getWaterBillsByZoneId, listAllZones } from 'src/app/store';
import { selectInvoiceIsLoading, selectInvoices, selectSelectedWaterBill, selectSelectedWaterBills } from 'src/app/store/selectors/invoice.selectors';
import { selectSelectedZones } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-list-invoice',
  templateUrl: './list-invoice.component.html',
  styleUrl: './list-invoice.component.css'
})
export class ListInvoiceComponent implements OnInit, OnDestroy {
  invoicesList: IInvoice[] = []; // Original list of invoices from the store
  invoicesData: IInvoice[] = []; // Formatted invoices list for display
  filteredInvoices: IInvoice[] = []; // Invoices filtered by search term or zone

  zoneData: IOption[] = []; // Data for the zone filter dropdown
  zones: IZone[] = []; // Original zone data

  invoiceColumns: { key: keyof IInvoice; label: string }[] = []; // Configuration for table columns

  enableExport: boolean = false; // Flag to enable/disable export button
  selectedZoneId: string = ''; // Currently selected zone ID for filtering
  selectedZoneDesc: string = ''; // Description of the selected zone

  isDialogOpen: boolean = false; // Controls visibility of the PDF dialog
  dialogMessage = ''; // Message displayed in the PDF loading dialog
  pdfUrl: SafeResourceUrl | null = null; // URL for the PDF to be displayed in the iframe

  isInvoicesLoading$: Observable<boolean>; // Observable for invoice loading state

  private destroy$ = new Subject<void>(); // Subject to manage component unsubscription

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of items to display per page
  totalPages: number = 0;
  paginatedInvoices: IInvoice[] = []; // Invoices for the current page

  // NGRX Selectors
  getZones$ = this.store.pipe(select(selectSelectedZones));
  getInvoicesFromStore$ = this.store.pipe(select(selectInvoices));
  getSelectedWaterBill$ = this.store.pipe(select(selectSelectedWaterBill));
  getSelectedWaterBills$ = this.store.pipe(select(selectSelectedWaterBills));

  constructor(private store: Store<IAppState>, private sanitizer: DomSanitizer) {
    this.isInvoicesLoading$ = this.store.select(selectInvoiceIsLoading);

    // Define table columns with their corresponding keys and labels
    this.invoiceColumns = [
      { key: 'invoiceId', label: 'Código' },
      { key: 'description', label: 'Descrição' },
      { key: 'paymentMethod', label: 'Método de Pagamento' },
      { key: 'limitDate', label: 'Data Limite' },
      { key: 'paymentDate', label: 'Data de Pagamento' },
      { key: 'amount', label: 'Valor' },
      { key: 'fineAmount', label: 'Valor de Multa' },
      { key: 'totalAmount', label: 'Valor Total' },
      { key: 'finePercentage', label: 'Taxa de Multa (%)' },
      { key: 'readingId', label: 'Id da Leitura' }
    ];
  }

  ngOnInit(): void {
    this.loadInvoicesData(); // Load all invoices initially
    this.getAllZones(); // Load all zones for the filter dropdown
  }

  /**
   * Dispatches action to load all invoices and subscribes to updates from the store.
   * Formats date fields for display.
   */
  private loadInvoicesData(): void {
    this.store.dispatch(listAllInvoices());
    this.getInvoicesFromStore$.pipe(takeUntil(this.destroy$)).subscribe(invoices => {
      if (invoices) {
        this.invoicesList = invoices; // Keep original data for filtering
        this.invoicesData = invoices.map(invoice => ({
          ...invoice,
          limitDate: this.formatDate(invoice.limitDate),
          paymentDate: this.formatDate(invoice.paymentDate)
        }));
        this.filteredInvoices = [...this.invoicesData]; // Initialize filtered list
        this.calculatePagination(); // Calculate pagination for the initial load
      }
    });
  }

  /**
   * Dispatches action to load all zones and populates the zone filter dropdown.
   */
  getAllZones(): void {
    this.store.dispatch(listAllZones());
    this.getZones$.pipe(filter((zones) => !!zones), takeUntil(this.destroy$)).subscribe(zones => {
      if (zones) {
        this.zones = zones;
        this.zoneData = [
          { label: 'TODOS BAIRROS', value: 'AZN' }, // Option to view all zones
          ...zones.map(zone => ({
            label: zone.designation.toUpperCase(),
            value: zone.zoneId
          }))
        ];
        // Ensure filteredInvoices is updated if zones data changes after initial invoice load
        if (this.selectedZoneId === 'AZN' || !this.selectedZoneId) {
          this.filteredInvoices = [...this.invoicesData];
        } else {
          this.applyFilters(); // Re-apply filter if a specific zone was selected
        }
        this.calculatePagination(); // Recalculate pagination after zones are loaded
      }
    });
  }

  /**
   * Filters the invoices list based on a search term across all invoice properties.
   * @param searchTerm The text to search for.
   */
  filterInvoices(searchTerm: string): void {
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredInvoices = this.invoicesList.filter(invoice =>
      Object.values(invoice).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
    this.enableExport = this.selectedZoneId !== 'AZN' && this.filteredInvoices.length > 0;
    this.currentPage = 1; // Reset to first page on filter change
    this.calculatePagination(); // Recalculate pagination after filtering
  }

  /**
   * Filters invoices by the selected zone.
   * @param event The selected option from the zone dropdown.
   */
  filterByZone(event: { value: string, label: string }): void {
    this.selectedZoneId = event.value;
    this.selectedZoneDesc = event.label;

    this.store.dispatch(resetInvoiceActions()); // Reset any previous invoice actions

    if (event.value === 'AZN') {
      this.enableExport = false; // Disable export when "ALL ZONES" is selected
      this.loadInvoicesData(); // Reload all invoices
    } else {
      this.applyFilters(); // Apply filter for the selected zone
    }
  }

  /**
   * Applies the zone filter by dispatching an NGRX action to get invoices for the selected zone.
   */
  applyFilters(): void {
    if (this.selectedZoneId) {
      this.store.dispatch(getInvoiceByZoneId({ zoneId: this.selectedZoneId }));

      this.getInvoicesFromStore$.pipe(
        filter((invoice) => !!invoice),
        takeUntil(this.destroy$)
      ).subscribe((invoices) => {
        if (invoices) {
          this.invoicesList = invoices; // Update original list for subsequent searching
          this.invoicesData = invoices.map(invoice => ({
            ...invoice,
            limitDate: this.formatDate(invoice.limitDate),
            paymentDate: this.formatDate(invoice.paymentDate)
          }));
          this.filteredInvoices = [...this.invoicesData];
          this.enableExport = true; // Enable export when a specific zone is selected and data exists
          this.currentPage = 1; // Reset to first page on filter change
          this.calculatePagination(); // Recalculate pagination after applying zone filter
        }
      });
    }
  }

  /**
   * Dispatches action to get water bills for the selected zone and opens them in a new window.
   */
  printSelectedZoneInvoices(): void {
    this.store.dispatch(getWaterBillsByZoneId({ zoneId: this.selectedZoneId }));

    this.getSelectedWaterBills$.pipe(
      filter((file) => !!file),
      first(),
      takeUntil(this.destroy$)
    ).subscribe((file) => {
      if (file) {
        this.handleBase64File(file.base64);
      }
    });
  }

  /**
   * Handles the click event on an invoice row to display its associated water bill PDF.
   * @param invoice The selected invoice object.
   */
  getInvoice(invoice: IInvoice): void {
    if (invoice && invoice.readingId) {
      this.isDialogOpen = true; // Open the dialog
      this.dialogMessage = 'Carregando PDF...'; // Set loading message
      this.pdfUrl = null; // Clear previous PDF URL

      this.store.dispatch(getWaterBillByReadingId({ readingId: invoice.readingId }));

      this.getSelectedWaterBill$.pipe(
        filter((file) => !!file),
        first(),
        takeUntil(this.destroy$)
      ).subscribe((file) => {
        if (file && file.base64) {
          this.handleBase64File(file.base64);
        } else {
          this.dialogMessage = 'Não foi possível carregar o PDF.';
        }
      });
    } else {
      console.warn('Invoice or Reading ID is missing for PDF retrieval.');
    }
  }

  /**
   * Converts a base64 string to a Blob and creates a URL for PDF display.
   * @param base64String The base64 encoded PDF string.
   */
  handleBase64File(base64String: string): void {
    // Remove potential data URI prefix if present
    const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
    this.openPdfFromBase64(cleanBase64);
  }

  /**
   * Creates an object URL from a base64 string and sets it as the iframe source.
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
    } catch (error) {
      console.error('Error opening PDF from Base64:', error);
      this.dialogMessage = 'Erro ao exibir PDF.';
      this.pdfUrl = null;
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
   * Formats a date string into 'dd-MM-yyyy' format.
   * @param dateString The date string to format.
   * @returns The formatted date string.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  /**
   * Closes the PDF viewing dialog and resets the PDF URL.
   */
  closeDialog(): void {
    this.isDialogOpen = false;
    this.pdfUrl = null; // Clear the PDF URL when closing the dialog
  }

  // --- Pagination Logic ---

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
}

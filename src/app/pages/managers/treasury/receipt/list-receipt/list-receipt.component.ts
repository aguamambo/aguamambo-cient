import { filter } from 'rxjs';
import { IOption } from './../../../../../models/option';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { first, Observable, Subject, takeUntil } from 'rxjs';
import { IReceipt } from 'src/app/models/receipt';
import { IAppState, listAllReceipts, getReceiptFile, clearReceiptFile } from 'src/app/store';
import { selectReceiptIsLoading, selectSelectedReceiptFile, selectSelectedReceipts } from 'src/app/store/selectors/receipt.selectors';

@Component({
  selector: 'app-list-receipt',
  templateUrl: './list-receipt.component.html',
  styleUrl: './list-receipt.component.css'
})
export class ListReceiptComponent implements OnInit, OnDestroy {
  receiptsList: IReceipt[] = []; // Original list of receipts from the store
  receiptsData: IReceipt[] = []; // Formatted receipts list for display
  filteredReceipts: IReceipt[] = []; // Receipts filtered by search term

  receiptColumns: { key: keyof IReceipt; label: string }[] = []; // Configuration for table columns

  isDialogOpen: boolean = false; // Controls visibility of the PDF dialog
  dialogMessage = ''; // Message displayed in the PDF loading dialog
  title = '';
  pdfUrl: SafeResourceUrl | null = null; // URL for the PDF to be displayed in the iframe
  isReceiptsLoading$: Observable<boolean>;

  private receiptCancel$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of items to display per page
  totalPages: number = 0;
  paginatedReceipts: IReceipt[] = []; // Receipts for the current page

  // NGRX Selectors
  getReceiptsFromStore$ = this.store.pipe(select(selectSelectedReceipts));
  getSelectedReceiptFile$ = this.store.pipe(select(selectSelectedReceiptFile));

  constructor(private store: Store<IAppState>, private sanitizer: DomSanitizer) {
    this.isReceiptsLoading$ = this.store.select(selectReceiptIsLoading);

    this.receiptColumns = [
      { key: 'receiptID', label: 'Código' },
      { key: 'paymentMethod', label: 'Metodo de Pagamento' },
      { key: 'paymentDate', label: 'Data do Pagamento' },
      { key: 'amount', label: 'Valor Pago' },
      { key: 'purpose', label: 'Finalidade' },
      { key: 'clientId', label: 'Id Cliente' }
    ];
  }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Dispatches action to load all receipts and subscribes to updates from the store.
   * Formats date fields for display and initializes pagination.
   */
  private loadData(): void {
    this.store.dispatch(listAllReceipts());
    this.getReceiptsFromStore$.pipe(takeUntil(this.destroy$)).subscribe(receipts => {
      if (receipts) {
        this.receiptsList = receipts; // Keep original data for filtering
        this.receiptsData = receipts.map(receipt => ({
          ...receipt,
          paymentDate: this.formatDate(receipt.paymentDate)
        }));
        this.filteredReceipts = [...this.receiptsData]; // Initialize filtered list
        this.calculatePagination(); // Calculate pagination for the initial load
      }
    });
  }

  /**
   * Filters the receipts list based on a search term across all receipt properties.
   * @param searchTerm The text to search for.
   */
  filterReceipts(searchTerm: string): void {
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredReceipts = this.receiptsList.filter(receipt =>
      Object.values(receipt).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
    this.currentPage = 1; // Reset to first page on filter change
    this.calculatePagination(); // Recalculate pagination after filtering
  }

  /**
   * Handles the click event on a receipt row to display its associated PDF.
   * @param receipt The selected receipt object.
   */
  getReceipt(receipt: IReceipt): void {
    if (receipt && receipt.receiptID) {

      this.receiptCancel$.next();
      this.title = 'Recibo'
      this.isDialogOpen = true; // Open the dialog
      this.dialogMessage = 'Carregando PDF...'; // Set loading message
      this.pdfUrl = null; // Clear previous PDF URL

      this.store.dispatch(clearReceiptFile());

      this.store.dispatch(getReceiptFile({ receiptId: receipt.receiptID }));

      this.getSelectedReceiptFile$.pipe(
        filter((file) => !!file),
        first(),
        takeUntil(this.destroy$)
      ).subscribe(file => {
        if (file && file.base64) {
          this.handleBase64File(file.base64);
        } else {
          this.dialogMessage = 'Não foi possível carregar o PDF.';
        }
      });
    } else {
      console.warn('Receipt ID is missing for PDF retrieval.');
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
   * Calculates total pages and updates the paginatedReceipts array based on current page and items per page.
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReceipts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReceipts = this.filteredReceipts.slice(startIndex, endIndex);
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

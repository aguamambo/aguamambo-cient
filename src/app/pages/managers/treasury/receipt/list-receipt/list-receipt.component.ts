import { IOption } from './../../../../../models/option';
import * as pdfjsLib from 'pdfjs-dist';
import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser'; 
import { select, Store } from '@ngrx/store';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { IReceipt } from 'src/app/models/receipt';
import { IAppState, getZoneByEnterpriseId, getClientByZoneId, getWaterBillByReadingId, listAllReceipts, getReceiptFile } from 'src/app/store';
import { selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectSelectedWaterBill } from 'src/app/store/selectors/invoice.selectors';
import { selectReceiptIsLoading, selectSelectedReceipt, selectSelectedReceiptFile, selectSelectedReceipts } from 'src/app/store/selectors/receipt.selectors';
import { selectSelectedZones } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-list-receipt',
  templateUrl: './list-receipt.component.html',
  styleUrl: './list-receipt.component.css'
})
export class ListReceiptComponent implements OnInit, OnDestroy {
  receiptsList: IReceipt[] = [];
  receiptsData: IReceipt[] = [];
  monthsData: IOption[] = [];
  counter: string = '';
  clientData: IOption[] = [];
  clientMetersData: IOption[] = [];
  fileUrl: SafeUrl | null = null;
  zoneData: IOption[] = []; 
  lastreceipt: number = 0;
  enterpriseData: IOption[] = [];
  receiptColumns: { key: keyof IReceipt; label: string }[] = [];
  isEditing: boolean = false;
  selectedreceipt!: IReceipt;
  isDialogOpen: boolean = false;
  dialogType: 'success' | 'error' = 'success'; 
  dialogMessage = ''; 
  pdfUrl: SafeResourceUrl | null = null;
  
  isReceiptsLoading$: Observable<boolean>; 
  private destroy$ = new Subject<void>();
  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getreceipts$ = this.store.pipe(select(selectSelectedReceipt));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));

  constructor( private store: Store<IAppState>, private sanitizer: DomSanitizer) {

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

  private loadData(): void {
    this.generateMonths()
    this.store.dispatch(listAllReceipts());
    this.store.pipe(select(selectSelectedReceipts), takeUntil(this.destroy$)).subscribe(receipts => {
      if (receipts) {
        this.receiptsList = receipts;
        this.receiptsData = receipts.map(receipt => ({
          ...receipt, 
          paymentDate: this.formatDate(receipt.paymentDate)
        }));
      }
    });
  }
   
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
   
  generateMonths(): void {
    this.monthsData = [
      { value: '1', label: 'Janeiro' },
      { value: '2', label: 'Fevereiro' },
      { value: '3', label: 'Março' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Maio' },
      { value: '6', label: 'Junho' },
      { value: '7', label: 'Julho' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Setembro' },
      { value: '10', label: 'Outubro' },
      { value: '11', label: 'Novembro' },
      { value: '12', label: 'Dezembro' }
    ];
  }

  getReceipt(receipt: IReceipt): void {
    if (receipt) {
      this.isDialogOpen = true;
      this.store.dispatch(getReceiptFile({ receiptId: receipt.receiptID }));
  
      this.store
        .pipe(
          select(selectSelectedReceiptFile),
          filter((file) => !!file), 
          first()
        )
        .subscribe(file => {
           if(file){ 
            this.handleBase64File(file.base64)
           }
        });}
    }
 
  
  handleBase64File(base64String: string): void {
      const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
      this.openPdfFromBase64(cleanBase64);
     
  }

  openPdfFromBase64(base64: string, mimeType: string = 'application/pdf'): void {
    const blob = this.base64ToBlob(base64, mimeType);
    const url = URL.createObjectURL(blob);
    this.pdfUrl = url;
    const pdfWindow = window.open('');
    if (pdfWindow) {
      this.isDialogOpen = false;
      pdfWindow.document.write(`
        <iframe 
          width="100%" 
          height="100%" 
          src="${url}" 
          frameborder="0" 
          allowfullscreen>
        </iframe>
      `);
    } else {
      console.error('Unable to open a new window for the PDF.');
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
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  closeDialog(): void {
    this.isDialogOpen = false; 
    this.pdfUrl = null
  }
}

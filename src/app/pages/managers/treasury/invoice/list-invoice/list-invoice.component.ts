import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SafeUrl, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { IInvoice } from 'src/app/models/invoice';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { IAppState, getZoneByEnterpriseId, getClientByZoneId, listAllInvoices, getWaterBillByReadingId } from 'src/app/store';
import { selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedClientMeter, selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectInvoiceIsLoading, selectInvoiceIsSaving, selectSelectedInvoice, selectSelectedInvoices, selectSelectedWaterBill } from 'src/app/store/selectors/invoice.selectors';
import { selectSelectedZones } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-list-invoice',
  templateUrl: './list-invoice.component.html',
  styleUrl: './list-invoice.component.css'
})
export class ListInvoiceComponent  implements OnInit, OnDestroy {
  invoicesList: IInvoice[] = [];
  invoicesData: IInvoice[] = [];
  filteredInvoices: IInvoice[] = [];
  monthsData: IOption[] = [];
  counter: string = '';
  clientData: IOption[] = [];
  clientMetersData: IOption[] = [];
  fileUrl: SafeUrl | null = null;
  zoneData: IOption[] = [];
  zones: IZone[] = [];
  lastInvoice: number = 0;
  enterpriseData: IOption[] = [];
  invoiceColumns: { key: keyof IInvoice; label: string }[] = [];
  isEditing: boolean = false;
  selectedinvoice!: IInvoice;
  isDialogOpen: boolean = false;
  dialogType: 'success' | 'error' = 'success'; 
  dialogMessage = ''; 
  pdfUrl: SafeResourceUrl | null = null;
  
  isInvoicesLoading$: Observable<boolean>;
  isInvoiceSaving$: Observable<boolean>;
  private destroy$ = new Subject<void>();
  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getInvoices$ = this.store.pipe(select(selectSelectedInvoice));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));

  constructor( private store: Store<IAppState>, private sanitizer: DomSanitizer) {

    this.isInvoicesLoading$ = this.store.select(selectInvoiceIsLoading);
    this.isInvoiceSaving$ = this.store.select(selectInvoiceIsSaving);

    this.invoiceColumns = [
      { key: 'invoiceId', label: 'Código' },
      { key: 'description', label: 'Cliente Activo' },
      { key: 'paymentMethod', label: 'Consumo' },
      { key: 'limitDate', label: 'Data de Alteracao' },
      { key: 'paymentDate', label: 'Data de Criacao' },
      { key: 'amount', label: 'Leitura Acutal' },
      { key: 'fineAmount', label: 'Leitura Anterior' },
      { key: 'totalAmount', label: 'Mês' },
      { key: 'finePercentage', label: 'Multa (%)' },
      { key: 'readingId', label: 'Id da Leitura' }
    ];
  }

  ngOnInit(): void {
    this.loadData(); 
  }

  private loadData(): void {
    this.generateMonths()
    this.store.dispatch(listAllInvoices());
    this.store.pipe(select(selectSelectedInvoices), takeUntil(this.destroy$)).subscribe(invoices => {
      if (invoices) {
        this.invoicesList = invoices;
        this.invoicesData = invoices.map(invoice => ({
          ...invoice,
          limitDate: this.formatDate(invoice.limitDate),
          paymentDate: this.formatDate(invoice.paymentDate)
        }));

        this.filteredInvoices = [... this.invoicesData]
      }
    });
  }

  filterInvoices(searchTerm: string): void {
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredInvoices = this.invoicesList.filter(invoice =>
      Object.values(invoice).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
  }

  loadEnterpriseData(): void {
    this.store.pipe(select(selectSelectedEnterprises), takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterpriseData = enterprises.map(enterprise => ({
          label: enterprise.name,
          value: enterprise.enterpriseId
        }));
      }
    });
  }

  onValueSelected(option: IOption): void {
    if (option && option.value) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.getZonesByEnterprise$.pipe(takeUntil(this.destroy$)).subscribe((zones) => {
        if (zones) {
          this.zoneData = [
            { label: 'Seleccione...', value: '' },
            ...zones.map(zone => ({
              label: zone.designation,
              value: zone.zoneId
            }))
          ];
        }
      });
    }
  }

  onEnterpriseSelect(event: { value: string; label: string }): void {
    if (event && event.value) {
      const selectedValue = event.value;
      this.store.dispatch(getClientByZoneId({ zoneId: selectedValue }));
      this.getClientsByZone$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
        if (clients) {
          this.clientData = [
            { label: 'Seleccione...', value: '' },
            ...clients.map(client => ({
              label: client.name,
              value: client.clientId
            }))
          ];
        }
      });
    }
  }

   onClientSelect(selectedClient: { label: string, value: string }): void {
    this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe((meters) => {
      if (meters) {
        this.clientMetersData = [
          { label: 'Seleccione...', value: '' },
          ...meters.map(meter => ({
            label: meter.meterId || '',
            value: meter.meterId || ''
          }))
        ];
        
      }
    })
  }

  onMeterSeclected(option: IOption) {
    if (option && option.value) {
       
    }
  }



  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
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

  getInvoice(invoice: IInvoice): void {
    if (invoice) {
      this.isDialogOpen = true;
      this.store.dispatch(getWaterBillByReadingId({ readingId: invoice.readingId }));
  
      this.store
        .pipe(
          select(selectSelectedWaterBill),
          filter((file) => !!file), 
          first()
        )
        .subscribe((file) => { 
          if (file ) { 
            console.log(file);
            
            this.handleBase64File(file.base64); 
        }});
    }
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

import { getClientByZoneId } from './../../../../../store/actions/client.actions';
import { getZoneByEnterpriseId } from './../../../../../store/actions/zone.actions';
import { selectReadingErrorMessage, selectReadingId, selectReadingIsSaving, selectReadingStatusCode, selectReadingSuccessMessage, selectSelectedMeterReading, selectSelectedReading } from './../../../../../store/selectors/reading.selectors';
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { select, Store } from "@ngrx/store";
import { filter, first, Observable, skipWhile, Subject, take, takeUntil } from "rxjs";
import { IClient } from "src/app/models/client";
import { IEnterprise } from "src/app/models/enterprise";
import { IOption } from "src/app/models/option";
import { IReading } from "src/app/models/reading";
import { IZone } from "src/app/models/zone";
import { AuthService } from 'src/app/services/auth.service';
import { IAppState, createInvoice, createReading, getClientMeterByClient, getInvoiceByReadingId, getLastReadingByClient, getLastReadingByMeter, getWaterBillByReadingId, listAllEnterprises } from 'src/app/store';
import { selectClientIsLoading, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectClientMeterIsLoading, selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { selectEnterpriseIsLoading, selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import { selectSelectedInvoice, selectSelectedWaterBill } from 'src/app/store/selectors/invoice.selectors';
import { selectSelectedZones, selectZoneIsLoading } from "src/app/store/selectors/zone.selectors";

@Component({
  selector: 'app-register-reading',
  templateUrl: './register-reading.component.html',
  styleUrls: ['./register-reading.component.css']
})
export class RegisterReadingComponent implements OnInit {
  registReadingForm!: FormGroup;
  lastReading: number = 0;
  counter: string | null = '';
  readingId: string | null = null;
  fileUrl: SafeUrl | null = null;
  clientId: string | null = null;
  zoneData: IOption[] = [];
  clientMetersData: IOption[] = [];
  enterpriseData: IOption[] = [];
  clientData: IOption[] = [];
  monthsData: IOption[] = [];
  zoneList: IZone[] = [];
  enterprisesList: IEnterprise[] = [];
  clientsList: IClient[] = [];
  readingsList: IReading[] = [];
  isDialogOpen: boolean = false;
  dialogType: 'success' | 'error' = 'success'; 
  dialogMessage = ''; 
  pdfUrl: SafeResourceUrl | null = null;
  
  isZonesLoading$: Observable<boolean>;
  isEnterprisesLoading$: Observable<boolean>;
  isClientLoading$: Observable<boolean>;
  isMeterLoading$: Observable<boolean>;
  isReadingSaving$: Observable<boolean>;
  errorMessage$: Observable<string>;
  successMessage$: Observable<string>;

  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getReadingsByCMeterId$ = this.store.pipe(select(selectSelectedMeterReading));
  getCreatedReading$ = this.store.pipe(select(selectSelectedReading));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));
  statusCode$ = this.store.select(selectReadingStatusCode);
  private destroy$ = new Subject<void>();
  user: string = '';

  constructor(private store: Store<IAppState>, private auth: AuthService,private sanitizer: DomSanitizer) {
    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);
    this.isClientLoading$ = this.store.select(selectClientIsLoading);
    this.isMeterLoading$ = this.store.select(selectClientMeterIsLoading);
    this.isReadingSaving$ = this.store.select(selectReadingIsSaving);
    this.errorMessage$ = this.store.select(selectReadingErrorMessage);
    this.successMessage$ = this.store.select(selectReadingSuccessMessage);


  }

  ngOnInit(): void {
    this.user = this.auth.checkSession();
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.registReadingForm = new FormGroup({
      currentReading: new FormControl(null),
      readingMonth: new FormControl(null),
      readingYear: new FormControl(this.getCurrentYear()),
      meterId: new FormControl(null)
    });
  }


  loadData(): void {
    this.generateMonths();
    this.store.dispatch(listAllEnterprises());
    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
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

  }

  onValueSelected(option: IOption): void {
    if (option && option.value) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.getZonesByEnterprise$.pipe(takeUntil(this.destroy$)).subscribe((zones) => {
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
    }
  }

  onEnterpriseSelect(event: { value: string; label: string }): void {
    if (event && event.value) {
      const selectedValue = event.value;
      this.store.dispatch(getClientByZoneId({ zoneId: selectedValue }));
      this.getClientsByZone$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
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
    }
  }

  onClientSelect(selectedClient: { label: string, value: string }): void {

    this.getClientsByZone$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
      if (clients) {

        const clientDetails = clients.find(client => client.clientId === selectedClient.value);
        if (clientDetails) {
          this.clientId = clientDetails.clientId

          this.store.dispatch(getClientMeterByClient({ clientId: this.clientId }))

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
      }
    });
  }

   onMeterSeclected(option: IOption) {
    if (option && option.value) {
      this.lastReading = 0
      this.counter = option.value
      this.store.dispatch(getLastReadingByMeter({ meterId: this.counter }));

      this.registReadingForm.get('meterId')?.setValue(this.counter)

      this.getReadingsByCMeterId$.pipe(
        skipWhile((readings) => !readings), 
        first()  
      ).subscribe((readings) => {
        if (readings) { 
          this.lastReading = readings.currentReading;
          this.readingId = readings.readingId;
        } 
      });
    }
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

    saveReading(): void {
      if (this.registReadingForm.valid) {
        this.isDialogOpen = true;
        this.dialogMessage = 'Salvando Leitura...';  
          const formData = this.registReadingForm.value;
          this.store.dispatch(createReading({ reading: formData }));

          this.getCreatedReading$.pipe(
              filter((reading) => !!reading),
              first()
          ).subscribe((reading) => { 
            let count = 0
              if (reading) {
                if (count === 0) {
                  const payload = {
                    readingId: reading.readingId
                  }
                    this.store.dispatch(createInvoice({payload: payload}))
                    this.store.pipe(
                      select(selectSelectedInvoice),
                      filter((invoice)=>!!invoice),
                      first()
                    ).subscribe((invoice) => {
                      if (invoice) {

                        this.store.dispatch(getWaterBillByReadingId({ readingId: invoice.readingId }));
                        this.store
                          .pipe(
                            select(selectSelectedWaterBill),
                            filter((file) => !!file),
                            first()
                          )
                          .subscribe((file) => {
                            if (file) {
                              this.handleBase64File(file.base64)
                            } else {
                              this.dialogMessage = 'Falha ao carregar o arquivo.';
                              this.isDialogOpen = true;
                            }
                          });
                      }
                    })

                    
                }
                count ++
              }
          });
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


  onMonthSelect(selectedOption: { value: string; label: string }) {
    this.registReadingForm.get('readingMonth')?.setValue(selectedOption.value)
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

  checkSession() {
    if (!this.auth.authenticated()) {
      this.auth.logout()
    } else {
      this.user = this.auth.decryptData(localStorage.getItem('name') || '')
    }
  }

  openDialog(type: 'success' | 'error', message: string): void {
    this.dialogType = type;
    this.dialogMessage = message;
    this.isDialogOpen = true;
  }

 
  closeDialog(): void {
    this.isDialogOpen = false;
    this.registReadingForm.reset()
    this.pdfUrl = null
  }
}
import { resetReadingActions } from './../../../../../store/actions/reading.actions';
import { getClientByZoneId, resetClientActions } from './../../../../../store/actions/client.actions';
import { getZoneByEnterpriseId, resetZonesActions } from './../../../../../store/actions/zone.actions';
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
import { DialogService } from 'src/app/services/dialog.service';
import { IAppState, createInvoice, createReading, getClientMeterByClient, getInvoiceByReadingId, getLastReadingByClient, getLastReadingByMeter, getWaterBillByReadingId, listAllEnterprises, resetClientMetersActions, resetEnterpriseActions } from 'src/app/store';
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
  counter: string = '';
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
  validFields: boolean = false;
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

  constructor(
    private store: Store<IAppState>, 
    private auth: AuthService, 
    private _dialogService: DialogService,
    private sanitizer: DomSanitizer
  ) {
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
    this._dialogService.reset()
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
  
  getReadingByMeter(counter: string){
    this.registReadingForm.get('meterId')?.setValue( counter)
            this.store.dispatch(getLastReadingByMeter({ meterId:  counter }));
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

  isFormValid(): boolean {
    const result =  Object.values(this.registReadingForm.value).every(value => value !== null && value !== undefined);
    this.validFields = result
    return result
  }

  onValueSelected(option: IOption): void {
    if (option && option.value) {
      this.counter = ''
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.getZonesByEnterprise$.pipe(takeUntil(this.destroy$)).subscribe(
        (zones) => {
          if (zones) {
            this.zoneList = zones;
            this.zoneData = [
              { label: 'Seleccione...', value: '' },
              ...zones.map(zone => ({ label: zone.designation, value: zone.zoneId }))
            ];
          }
        },
        () => {
          this.openDialog('error', 'Erro ao carregar zonas.');
        }
      );
    }
  }
  
  onEnterpriseSelect(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.counter = '' 
      this.store.dispatch(getClientByZoneId({ zoneId: event.value }));
      this.getClientsByZone$.pipe(takeUntil(this.destroy$)).subscribe(
        (clients) => {
          if (clients) {
            this.clientsList = clients;
            this.clientData = [
              { label: 'Seleccione...', value: '' },
              ...clients.map(client => ({ label: client.name, value: client.clientId }))
            ];
          }
        },
        () => {
          this.openDialog('error', 'Erro ao carregar clientes.');
        }
      );
    }
  }
  

  onClientSelect(selectedClient: { label: string, value: string }): void {
    const clientDetails = this.clientsList.find(client => client.clientId === selectedClient.value);
    if (clientDetails) {
      this.counter = ''
      this.clientId = clientDetails.clientId;
      this.store.dispatch(getClientMeterByClient({ clientId: this.clientId }));
  
      this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe(
        (meters) => {
          if (meters) {
            this.clientMetersData = [ 
              ...meters.map(meter => ({ label: meter.meterId || '', value: meter.meterId || '' }))
            ];
            this.counter = meters[0].meterId
            this.getReadingByMeter(this.counter)
          }
        }
        
      );
    }
  }
  
  onMeterSeclected(option: IOption) {
    if (option && option.value) {
      this.lastReading = 0
      this.counter = option.value
      this.getReadingByMeter(this.counter)
    }
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  onNumberInputChange(inputElement: HTMLInputElement, controlName: string): void {
    const sanitizedValue = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.value = sanitizedValue; 
    if (sanitizedValue) {
      this.registReadingForm.get(controlName)?.setValue(sanitizedValue);
    } else
      this.registReadingForm.get(controlName)?.setValue(null);

    this.isFormValid();
  }

  saveReading(): void {
    this._dialogService.reset()
    if (this.validFields) {
      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guarda ainformações da leitura.',
        type: 'loading',
        isProcessing: true,
      });
  
      const formData = this.registReadingForm.value;
  
      this.store.dispatch(createReading({ reading: formData }));
  
      this.getCreatedReading$
        .pipe(filter((reading) => !!reading), first())
        .subscribe({
          next: (reading) => {
            if (reading) {
              
              const payload = { readingId: reading.readingId };
              this._dialogService.open({
                title: 'Sucesso',
                message: 'Leitura salva com sucesso!',
                type: 'success'
              });
              
              this.store.dispatch(createInvoice({ payload }));
            }
  
            this.store
              .pipe(
                select(selectSelectedInvoice),
                filter((invoice) => !!invoice),
                first()
              )
              .subscribe({
                next: (invoice) => {
                  if (invoice) {
                    
                    this._dialogService.close(true);
                    this._dialogService.open({
                      title: 'Factura',
                      message: 'Carregando dados da Factura.',
                      type: 'loading',
                      isProcessing: true,
                    }); 
  
                  this.store.dispatch(
                    getWaterBillByReadingId({ readingId: invoice.readingId })
                  );
  
                }
                  this.store
                    .pipe(
                      select(selectSelectedWaterBill),
                      filter((file) => !!file),
                      first()
                    )
                    .subscribe({
                      next: (file) => {
                        if (file) {
                          this.handleBase64File(file.base64);
                          this.onReset()
                        }
                      },
                      error: () => {
                        this.openDialog('error', 'Failed to load the invoice file.');
                      },
                    });
                },
                error: () => {
                  this.openDialog('error', 'Error fetching the invoice.');
                },
              });
          },
          error: (error) => {
            this._dialogService.open({
              title: 'Erro',
              message: error.message || 'Ocorreu um erro inesperado. Por favor contacte a equipa tecnica para o suporte.',
              type: 'error',
              showConfirmButton: true, 
              cancelText: 'Cancelar',
            });
          },
        });
    }
    else{
      this._dialogService.open({
        title: 'Erro',
        message: 'Por favor preenche todos os campos antes de submeter',
        type: 'error',
        showConfirmButton: true, 
        cancelText: 'Cancelar',
      });
    }
  }
  

  handleBase64File(base64String: string): void {
    const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
    this.openPdfFromBase64(cleanBase64);

  }
  
  onReset(): void {
    this.store.dispatch(resetReadingActions());
    this.store.dispatch(resetClientActions());
    this.store.dispatch(resetZonesActions());
    this.store.dispatch(resetEnterpriseActions());
    this.store.dispatch(resetClientMetersActions());
  }

  openPdfFromBase64(base64: string): void {
    try{
      
      const blob = this.base64ToBlob(base64, 'application/pdf');
      const url = URL.createObjectURL(blob);
      const pdfWindow = window.open('','_blank');
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
      else{
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
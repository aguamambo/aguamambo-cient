import { resetReadingActions } from './../../../../../store/actions/reading.actions';
import { getClientByZoneId, resetClientActions } from './../../../../../store/actions/client.actions';
import { getZoneByEnterpriseId, resetZonesActions } from './../../../../../store/actions/zone.actions';
import { selectReadingErrorMessage, selectReadingIsSaving, selectReadingStatusCode, selectReadingSuccessMessage, selectSelectedMeterReading, selectSelectedReading } from './../../../../../store/selectors/reading.selectors';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, ValidatorFn, AbstractControl, ValidationErrors, Validators } from "@angular/forms"; // Added Validators
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { select, Store } from "@ngrx/store";
import { filter, first, Observable, skipWhile, Subject, takeUntil, combineLatest, map } from "rxjs"; // Added combineLatest, map
import { IClient } from "src/app/models/client";
import { IEnterprise } from "src/app/models/enterprise";
import { IOption } from "src/app/models/option";
import { IReading } from "src/app/models/reading";
import { IZone } from "src/app/models/zone";
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog.service';
import { IAppState, createInvoice, createReading, getClientMeterByClient, getLastReadingByMeter, getWaterBillByReadingId, listAllEnterprises, resetClientMetersActions, resetEnterpriseActions, resetInvoiceActions } from 'src/app/store';
import { selectClientIsLoading, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectClientMeterIsLoading, selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { selectEnterpriseIsLoading, selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import { selectInvoiceError, selectInvoice, selectSelectedWaterBill } from 'src/app/store/selectors/invoice.selectors';
import { selectSelectedZones, selectZoneIsLoading } from "src/app/store/selectors/zone.selectors";

@Component({
  selector: 'app-register-reading',
  templateUrl: './register-reading.component.html',
  styleUrls: ['./register-reading.component.css']
})
export class RegisterReadingComponent implements OnInit, OnDestroy {
  registReadingForm: FormGroup;
  lastReading: number = 0;
  counter: string = ''; // This will now represent the selected meterId label
  selectedEnterpriseId: string = ''; // Store the ID for dispatching actions
  selectedZoneId: string = ''; // Store the ID for dispatching actions
  selectedClientId: string | null = null; // Store the ID for dispatching actions
  readingId: string | null = null; // Not used in new HTML, but kept for logic
  fileUrl: SafeUrl | null = null; // Not used in new HTML, but kept for logic
  
  zoneData: IOption[] = [];
  clientData: IOption[] = [];
  enterpriseData: IOption[] = [];
  meterData: IOption[] = []; // Renamed from clientMetersData for consistency with HTML
  monthsData: IOption[] = [];
  
  zoneList: IZone[] = []; // Raw data from store
  enterprisesList: IEnterprise[] = []; // Raw data from store
  clientsList: IClient[] = []; // Raw data from store
  readingsList: IReading[] = []; // Raw data from store (though only lastReading is used)

  isDialogOpen: boolean = false; // For custom dialog service
  dialogType: 'success' | 'error' = 'success';
  dialogMessage = '';
  
  selectedMonth: string = ''; // Value of the selected month
  selectedYear: string = this.getCurrentYear().toString(); // Value of the selected year
  currentDate: Date = new Date(); // For displaying current date in header

  pdfUrl: SafeResourceUrl | null = null; // For PDF viewer

  yearsData: { label: string; value: string }[] = []; // For year dropdown
  isFileUploadSelected: boolean = false; // Toggle for manual vs file upload

  // Loading Observables from NgRx Store
  isZonesLoading$: Observable<boolean>;
  isEnterprisesLoading$: Observable<boolean>;
  isClientLoading$: Observable<boolean>;
  isMeterLoading$: Observable<boolean>;
  isReadingSaving$: Observable<boolean>;
  errorMessage$: Observable<string>;
  successMessage$: Observable<string>;

  // Combined loading state for the main template spinner
  isLoading: boolean = true; 
  isSubmitting: boolean = false; // For submit button loading state

  // NgRx Selectors
  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getReadingsByCMeterId$ = this.store.pipe(select(selectSelectedMeterReading));
  getCreatedReading$ = this.store.pipe(select(selectSelectedReading));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));
  statusCode$ = this.store.select(selectReadingStatusCode); // Not directly used in HTML, but kept for potential debugging/logic
  
  private destroy$ = new Subject<void>();
  user: string = ''; // User name for display

  constructor(
    private store: Store<IAppState>,
    private auth: AuthService,
    private _dialogService: DialogService,
    private sanitizer: DomSanitizer
  ) {
    // Initialize registReadingForm directly in the constructor
    this.registReadingForm = new FormGroup({
      currentReading: new FormControl(null, [this.currentReadingValidator()]), // Add custom validator
      readingMonth: new FormControl(null, Validators.required),
      readingYear: new FormControl(this.getCurrentYear().toString(), Validators.required),
      enterprise: new FormControl(null, Validators.required), // New control name
      zone: new FormControl(null, Validators.required), // New control name
      client: new FormControl(null, Validators.required), // New control name
      meter: new FormControl(null, Validators.required) // New control name
    });

    // Initialize loading observables
    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);
    this.isClientLoading$ = this.store.select(selectClientIsLoading);
    this.isMeterLoading$ = this.store.select(selectClientMeterIsLoading);
    this.isReadingSaving$ = this.store.select(selectReadingIsSaving);
    this.errorMessage$ = this.store.select(selectReadingErrorMessage);
    this.successMessage$ = this.store.select(selectReadingSuccessMessage);
  }

  ngOnInit(): void {
    // Combine all loading states into a single isLoading observable
    combineLatest([
      this.isZonesLoading$,
      this.isEnterprisesLoading$,
      this.isClientLoading$,
      this.isMeterLoading$,
      this.isReadingSaving$
    ]).pipe(takeUntil(this.destroy$)).subscribe(([zones, enterprises, client, meter, saving]) => {
      this.isLoading = zones || enterprises || client || meter || saving;
    });

    this.auth.checkSession().then(userName => {
      this.user = userName;
      this.generateYearsList();
      this.generateMonths(); // Ensure months are generated early
      this.loadInitialData();
    });

    // Subscribe to currentReading changes to re-evaluate form validity
    this.registReadingForm.get('currentReading')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Trigger validation check on currentReading when lastReading changes
      this.registReadingForm.get('currentReading')?.updateValueAndValidity();
    });
  }

  // Custom validator for currentReading
  currentReadingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentReading = control.value;
      if (currentReading === null || currentReading === undefined || currentReading === '') {
        return null; // Let Validators.required handle empty
      }
      const isValid = +currentReading > this.lastReading;
      return isValid ? null : { invalidReading: { value: currentReading, lastReading: this.lastReading } };
    };
  }

  // New method for initial data loading
  loadInitialData(): void {
    this._dialogService.reset();
    this.store.dispatch(listAllEnterprises());
    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprisesList = enterprises;
        this.enterpriseData = [ // Updated label
          ...enterprises.map(enterprise => ({
            label: enterprise.name,
            value: enterprise.enterpriseId
          }))
        ];
      }
    });
  }

  generateYearsList(): void {
    const currentYear = this.getCurrentYear();
    for (let i = 0; i < 10; i++) {
      this.yearsData.push({ label: `${currentYear - i}`, value: (currentYear - i).toString() });
    }
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

    const currentMonth = (new Date().getMonth() + 1).toString();
    this.registReadingForm.get('readingMonth')?.setValue(currentMonth);
    this.selectedMonth = currentMonth;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // --- New/Refactored Event Handlers for HTML Selects ---

  onFileUploadToggle(): void {
    // This method is called when the checkbox is toggled.
    // The [(ngModel)] handles the `isFileUploadSelected` boolean.
    // You might want to reset manual input fields if switching to file upload mode, and vice-versa.
    if (this.isFileUploadSelected) {
      // Reset manual input form controls if switching to file upload
      this.registReadingForm.get('enterprise')?.reset();
      this.registReadingForm.get('zone')?.reset();
      this.registReadingForm.get('client')?.reset();
      this.registReadingForm.get('meter')?.reset();
      this.registReadingForm.get('currentReading')?.reset();
      this.lastReading = 0;
      this.counter = '';
      this.zoneData = [];
      this.clientData = [];
      this.meterData = [];
      this.selectedEnterpriseId = '';
      this.selectedZoneId = '';
      this.selectedClientId = null;
    } else {
      // Reset file upload related states if switching to manual input
      // (e.g., clear selected file, upload progress)
      // For now, no specific file upload state to clear in this component
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Selected file:', file.name);
      // TODO: Implement actual file parsing and processing logic here.
      // You might use a service to read the file (e.g., using FileReader or a library like 'xlsx').
      // After parsing, you would dispatch actions to save the readings from the file.
      this._dialogService.open({
        title: 'Ficheiro Seleccionado',
        message: `Ficheiro "${file.name}" pronto para processamento. (Funcionalidade de upload a ser implementada)`,
        type: 'success',
        showConfirmButton: true,
        cancelText: 'Ok'
      });
    }
  }

  onYearSelect(event: { value: string; label: string }): void {
    const value = event.value;
    this.registReadingForm.get('readingYear')?.setValue(value);
    this.selectedYear = value;
  }

  onMonthSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.registReadingForm.get('readingMonth')?.setValue(value);
    this.selectedMonth = value;
  }

  onEnterpriseChange(event: Event): void {
    let enterpriseId  = (event.target as HTMLSelectElement).value

    this.selectedEnterpriseId = enterpriseId;
    this.registReadingForm.get('enterprise')?.setValue(enterpriseId);
    
    // Reset dependent fields and data
    this.registReadingForm.get('zone')?.reset();
    this.registReadingForm.get('client')?.reset();
    this.registReadingForm.get('meter')?.reset();
    this.lastReading = 0;
    this.counter = '';
    this.zoneData = [];
    this.clientData = [];
    this.meterData = [];
    this.selectedZoneId = '';
    this.selectedClientId = null;

    if (enterpriseId) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId }));
      this.getZonesByEnterprise$.pipe(takeUntil(this.destroy$)).subscribe(
        (zones) => {
          if (zones) {
            this.zoneList = zones;
            this.zoneData = [ 
              ...zones.map(zone => ({ label: zone.designation, value: zone.zoneId }))
            ];
          }
        },
        () => {
          console.log('error', 'Erro ao carregar zonas.');
        }
      );
    }
  }

  onZoneChange(event: Event): void {
    let zoneId = (event.target as HTMLSelectElement).value

    this.selectedZoneId = zoneId
      
    this.registReadingForm.get('zone')?.setValue(zoneId);

    // Reset dependent fields and data
    this.registReadingForm.get('client')?.reset();
    this.registReadingForm.get('meter')?.reset();
    this.lastReading = 0;
    this.counter = '';
    this.clientData = [];
    this.meterData = [];
    this.selectedClientId = null;

    if (zoneId) {
      this.store.dispatch(getClientByZoneId({ zoneId }));
      this.getClientsByZone$.pipe(takeUntil(this.destroy$)).subscribe(
        (clients) => {
          if (clients) {
            this.clientsList = clients;
            this.clientData = [ 
              ...clients.map(client => ({ label: client.name, value: client.clientId }))
            ];
          }
        },
        () => {
          console.log('error', 'Erro ao carregar clientes.');
        }
      );
    }
  }

  onClientChange(event: Event): void {
    let clientId = (event.target as HTMLSelectElement).value
    this.selectedClientId = clientId;
    this.registReadingForm.get('client')?.setValue(clientId);

    // Reset dependent fields and data
    this.registReadingForm.get('meter')?.reset();
    this.lastReading = 0;
    this.counter = '';
    this.meterData = [];

    if (clientId) {
      const clientDetails = this.clientsList.find(client => client.clientId === clientId);
      if (clientDetails) {
        this.store.dispatch(getClientMeterByClient({ clientId }));

        this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe(
          (meters) => {
            if (meters && meters.length > 0) {
              this.meterData = [ 
                ...meters.map(meter => ({ label: meter.meterId || '', value: meter.meterId || '' }))
              ];
              // Automatically select the first meter if only one, or set placeholder
              if (meters.length === 1) {
                this.registReadingForm.get('meter')?.setValue(meters[0].meterId);
                this.onMeterChange(meters[0].meterId || '');
              } else {
                this.counter = 'Seleccione o contador'; // Placeholder for multiple meters
              }
            } else {
              this.meterData = [{ label: 'Nenhum contador encontrado', value: '' }];
              this.counter = 'N/A';
              this.lastReading = 0;
              this.registReadingForm.get('meter')?.setValue(null);
              console.log('error', 'Nenhum contador encontrado para este cliente.');
            }
          }
        );
      }
    }
  }

  onMeterChange(event: Event | string): void {
  let meterId: string;

  if (typeof event === 'string') {
    meterId = event;
  } else {
    meterId = (event.target as HTMLSelectElement).value;
  }
    this.registReadingForm.get('meter')?.setValue(meterId);
    this.lastReading = 0; // Reset before fetching new one
    this.counter = meterId; // Update counter display

    if (meterId) {
      this.store.dispatch(getLastReadingByMeter({ meterId }));
      this.getReadingsByCMeterId$.pipe(
        skipWhile((readings) => !readings),
        first(),
        takeUntil(this.destroy$)
      ).subscribe((readings) => {
        if (readings) {
          this.lastReading = readings.currentReading;
          this.readingId = readings.readingId; // Store readingId if needed
        } else {
          this.lastReading = 0; // No previous reading found
        }
        // Re-validate current reading as lastReading has changed
        this.registReadingForm.get('currentReading')?.updateValueAndValidity();
      });
    } else {
      this.lastReading = 0;
      this.registReadingForm.get('currentReading')?.updateValueAndValidity();
    }
  }

  onCurrentReadingInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const sanitizedValue = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.value = sanitizedValue; // Update the input field directly

    if (sanitizedValue) {
      this.registReadingForm.get('currentReading')?.setValue(+sanitizedValue); // Convert to number
    } else {
      this.registReadingForm.get('currentReading')?.setValue(null);
    }
    // The custom validator handles the comparison with lastReading
  }

  // --- Form Submission ---
  onSubmit(): void {
    // Mark all controls as touched to show validation errors
    this.registReadingForm.markAllAsTouched();

    if (this.registReadingForm.valid) {
      this.saveReading();
    } else {
      this._dialogService.open({
        title: 'Erro de Validação',
        message: 'Por favor, preencha corretamente todos os campos obrigatórios.',
        type: 'error',
        showConfirmButton: true,
        cancelText: 'Ok',
      });
    }
  }

  saveReading(): void {
    this._dialogService.reset();
    this.isSubmitting = true; // Start submitting state

    this._dialogService.open({
      title: 'Processando',
      message: 'Aguarde um instante enquanto guarda as informações da leitura.',
      type: 'loading',
      isProcessing: true,
    });

    this.store.dispatch(resetInvoiceActions());

    const formData = {
      ...this.registReadingForm.value,
      meterId: this.registReadingForm.get('meter')?.value // Ensure meterId is passed correctly
    };

    this.store.dispatch(createReading({ reading: formData }));

    this.store.pipe(select(selectSelectedReading))
      .pipe(filter((reading) => !!reading), first(), takeUntil(this.destroy$))
      .subscribe({
        next: (reading) => {
          if (reading) {
            const payload = { readingId: reading.readingId };
            this._dialogService.open({
              title: 'Sucesso',
              message: 'Leitura salva com sucesso! Gerando fatura...',
              type: 'success',
              isProcessing: true
            });
            this.store.dispatch(createInvoice({ payload }));

            this.store.pipe(select(selectInvoiceError), takeUntil(this.destroy$)).subscribe(
              error => {
                if (error) {
                  this._dialogService.open({
                    title: 'Criação da Factura',
                    type: 'error',
                    message: 'Um erro ocorreu ao criar a Factura!',
                    isProcessing: false,
                    showConfirmButton: true,
                    cancelText: 'Cancelar',
                    errorDetails: error.error
                  });
                  this.isSubmitting = false; // End submitting state on error
                } else {
                  this.store
                    .pipe(
                      select(selectInvoice),
                      filter((invoice) => !!invoice),
                      first(),
                      takeUntil(this.destroy$)
                    )
                    .subscribe({
                      next: (invoice) => {
                        if (invoice) {
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
                            first(),
                            takeUntil(this.destroy$)
                          )
                          .subscribe({
                            next: (file) => {
                              if (file) {
                                this.handleBase64File(file.base64);
                                this.onReset();
                                this._dialogService.close(true);
                              }
                              this.isSubmitting = false; // End submitting state on success
                            },
                            error: () => {
                              console.log('error', 'Falha ao carregar o ficheiro da factura.');
                              this.isSubmitting = false; // End submitting state on error
                            },
                          });
                      },
                      error: () => {
                        console.log('error', 'Erro ao buscar a factura.');
                        this.isSubmitting = false; // End submitting state on error
                      },
                    });
                }
              }
            );
          }
        },
        error: (error) => {
          this._dialogService.open({
            title: 'Erro',
            message: error.message || 'Ocorreu um erro inesperado ao salvar a leitura. Por favor contacte a equipa técnica para o suporte.',
            type: 'error',
            showConfirmButton: true,
            cancelText: 'Cancelar',
          });
          this.isSubmitting = false; // End submitting state on error
        },
      });
  }

  // Renamed from isFormValid to reflect its new role as a getter for template
   isFormValid(): boolean {
    return this.registReadingForm.valid;
  }

  handleBase64File(base64String: string): void {
    const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
    this.openPdfFromBase64(cleanBase64);
  }

  onReset(): void {
    // Dispatch reset actions for all relevant NgRx states
    this.store.dispatch(resetReadingActions());
    this.store.dispatch(resetClientActions());
    this.store.dispatch(resetZonesActions());
    this.store.dispatch(resetEnterpriseActions());
    this.store.dispatch(resetInvoiceActions());
    this.store.dispatch(resetClientMetersActions());

    // Reset form controls to their initial state
    this.registReadingForm.reset({
      currentReading: null,
      readingMonth: this.getCurrentMonthString(), // Reset to current month
      readingYear: this.getCurrentYear().toString(),
      enterprise: null,
      zone: null,
      client: null,
      meter: null
    });
    
    // Manually clear validation errors after reset
    this.registReadingForm.markAsUntouched();
    this.registReadingForm.markAsPristine();

    // Reset component local state variables
    this.lastReading = 0;
    this.counter = '';
    this.readingId = null;
    this.selectedClientId = null;
    this.selectedEnterpriseId = '';
    this.selectedZoneId = '';
    
    // Clear data for dropdowns to be re-fetched
    this.zoneData = [];
    this.clientData = [];
    this.meterData = [];
    this.monthsData = []; // Regenerate months to ensure current month is selected
    this.yearsData = []; // Regenerate years

    this.generateMonths(); // Re-populate months and set current month
    this.generateYearsList(); // Re-populate years
    this.loadInitialData(); // Reload initial enterprise data
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
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh; /* Ensure body takes full viewport height */
                    background-color: #f3f4f6; /* Light gray background */
                  }
                  @media (prefers-color-scheme: dark) {
                    body {
                      background-color: #111827; /* Dark gray background */
                    }
                  }
                </style>
              </head>
              <body>
                <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-lg mx-auto w-full flex flex-col overflow-hidden" style="min-height: 50vh; max-height: 90vh;">
                  <button
                    onclick="window.close()"
                    class="absolute top-4 right-4 p-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 shadow-md flex items-center justify-center z-10"
                    title="Fechar">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                    </svg>
                  </button>
                  <iframe
                    class="flex-grow w-full h-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    src="${url}#zoom=100"
                    frameborder="0"
                    allowfullscreen>
                  </iframe>
                </div>
              </body>
            </html>
          `
        );
        this._dialogService.close(true);
      } else {
        this._dialogService.open({
          title: 'Erro ao carregar a fatura',
          message: 'Ocorreu um erro inesperado. Por favor, verifique se o bloqueador de pop-ups está ativo e contacte a equipa técnica para suporte.',
          type: 'error',
          showConfirmButton: true,
          cancelText: 'Cancelar',
        });
      }

    } catch (error) {
      this._dialogService.open({
        title: 'Erro ao carregar a fatura',
        message: 'Ocorreu um erro inesperado. Por favor contacte a equipa técnica para o suporte.',
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

  private getCurrentMonthString(): string {
    return (new Date().getMonth() + 1).toString();
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.pdfUrl = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

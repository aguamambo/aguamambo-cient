import { Component, OnInit, OnDestroy } from "@angular/core"
import { ValidatorFn, AbstractControl, FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms"
import { select, Store } from "@ngrx/store"
import { Observable, Subject, combineLatest, takeUntil, filter, first } from "rxjs"
import { GenericConfig } from "src/app/core/config/generic.config"
import { IClient } from "src/app/models/client"
import { IClientMeter } from "src/app/models/clientMeter"
import { IEnterprise } from "src/app/models/enterprise"
import { IOption } from "src/app/models/option"
import { IZone } from "src/app/models/zone"
import { AuthService } from "src/app/services/auth.service"
import { DialogService } from "src/app/services/dialog.service"
import { IAppState, listAllEnterprises, getZoneByEnterpriseId, getClientByZoneId, getClientMeterByClient, createCut } from "src/app/store"
import { selectSelectedClients, selectClientIsLoading } from "src/app/store/selectors/client.selectors"
import { selectSelectedClientMeters, selectClientMeterIsLoading } from "src/app/store/selectors/clientMeter.selectors"
import { selectCutIsSaving, selectSelectedCut } from "src/app/store/selectors/cut.selectors"
import { selectSelectedEnterprises, selectEnterpriseIsLoading } from "src/app/store/selectors/enterprise.selectors"
import { selectSelectedZones, selectZoneIsLoading } from "src/app/store/selectors/zone.selectors"

 
export function greaterThanPreviousReadingValidator(previousReading: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const currentReading = control.value;
    if (currentReading !== null && currentReading !== undefined && currentReading <= previousReading) {
      return { 'invalidReading': true };
    }
    return null;
  };
}

@Component({
  selector: 'app-register-cut',
  templateUrl: './register-cut.component.html',
  styleUrl: './register-cut.component.css'
})
export class RegisterCutComponent implements OnInit, OnDestroy {

  registReadingForm!: FormGroup; // Renamed from registCutForm to match HTML
  
  // Data sources for dropdowns
  clientData: IOption[] = [];
  meterData: IOption[] = []; // Renamed from clientMetersData to match HTML
  enterpriseData: IOption[] = [];
  monthsData: IOption[] = [];
  zoneData: IOption[] = [];

  // Raw lists from store
  clientsList: IClient[] = [];
  zoneList: IZone[] = [];
  enterprisesList: IEnterprise[] = [];
  metersList: IClientMeter[] = []; // Added to store raw meter data

  // Loading and saving observables
  isClientsLoading$: Observable<boolean>;
  isCutSaving$: Observable<boolean>;
  isZonesLoading$: Observable<boolean>;
  isEnterprisesLoading$: Observable<boolean>;
  isClientLoading$: Observable<boolean>; // Redundant if using isClientsLoading$
  isMeterLoading$: Observable<boolean>;

  // Combined loading state for the main spinner
  isLoading: boolean = true; // New property for overall loading state

  // Form mode and submission state
  isFileUploadSelected: boolean = false; // Controls manual input vs file upload form
  isSubmitting: boolean = false; // Controls submit button loading state

  // Selected values for form and display
  selectedMonth: string = ''; // For passing to upload component
  selectedYear: string = ''; // For passing to upload component
  currentDate: Date = new Date(); // Current date for display
  lastReading: number = 0; // Previous reading value for validation and display

  // NgRx Selectors
  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));
  
  private destroy$ = new Subject<void>(); // Used to manage subscriptions

  // Properties for data fetching context (not directly used in new form fields but might be in actions)
  user: string = ''; // Assuming user context
  clientId: string = ''; // Current selected client ID
  year: number = 0; // Current year, initialized from generic config
  counter: string = ''; // Current selected meter ID (renamed from counter in old HTML)
  meter: string | null = ''; // Redundant with counter, but kept for clarity if needed elsewhere
  yearsData: IOption[] = []

  constructor(
    private store: Store<IAppState>,
    private auth: AuthService,
    private _dialogService: DialogService,
    private generic: GenericConfig,
    private fb: FormBuilder // Inject FormBuilder
  ) {
    // Initialize loading observables from store selectors
    this.isClientsLoading$ = this.store.select(selectClientIsLoading);
    this.isCutSaving$ = this.store.select(selectCutIsSaving);
    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);
    this.isClientLoading$ = this.store.select(selectClientIsLoading); // Can potentially be combined with isClientsLoading$
    this.isMeterLoading$ = this.store.select(selectClientMeterIsLoading);

    this.year = this.generic.getCurrentYear(); // Initialize current year

    // Initialize the form here, as it's used in ngOnInit and other methods
    this.initForm();
  }

  ngOnInit(): void {
    // Combine all loading observables to manage a single isLoading state
    combineLatest([
      this.isClientsLoading$,
      this.isCutSaving$,
      this.isZonesLoading$,
      this.isEnterprisesLoading$,
      this.isClientLoading$,
      this.isMeterLoading$
    ]).pipe(takeUntil(this.destroy$)).subscribe(
      ([clientsLoading, cutSaving, zonesLoading, enterprisesLoading, clientLoading, meterLoading]) => {
        this.isLoading = clientsLoading || cutSaving || zonesLoading || enterprisesLoading || clientLoading || meterLoading;
      }
    );

    this.loadData();
  }

  /**
   * Initializes the reactive form with controls and validators.
   */
  initForm(): void {
    this.registReadingForm = this.fb.group({
      readingYear: new FormControl(this.year, Validators.required), // Default to current year
      readingMonth: new FormControl(null, Validators.required),
      enterprise: new FormControl(null, Validators.required),
      zone: new FormControl(null, Validators.required),
      client: new FormControl(null, Validators.required),
      meter: new FormControl(null, Validators.required),
      currentReading: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[0-9]*$/), // Only numbers
        greaterThanPreviousReadingValidator(this.lastReading) // Custom validator, updated dynamically
      ]),
      // startDate and meterId from original form, adjust as needed or remove if no longer relevant
      startDate: new FormControl(null), // This seems to be replaced by readingYear/readingMonth
      meterId: new FormControl(null) // This seems to be replaced by 'meter'
    });

    // Update the custom validator whenever lastReading changes
    this.registReadingForm.get('currentReading')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.registReadingForm.get('currentReading')?.updateValueAndValidity();
    });
  }

  /**
   * Loads initial data (months, enterprises) and subscribes to enterprise changes.
   */
   
 loadData(): void {
  this._dialogService.reset();

  // Months
  this.monthsData = this.generic.generateMonths();
  const currentMonth = (new Date().getMonth() + 1).toString(); // getMonth() is 0-based, so +1
  this.selectedMonth = currentMonth; // e.g., '7' for July

  // Years
  const currentYear = this.generic.getCurrentYear();
  this.yearsData = [{ label: 'Seleccione o ano', value: '' }];
  for (let i = 0; i < 5; i++) {
    const yearValue = String(currentYear - i);
    this.yearsData.push({ label: yearValue, value: yearValue });
  }
  this.selectedYear = String(currentYear);

  // Enterprises
  this.store.dispatch(listAllEnterprises());
  this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
    if (enterprises) {
      this.enterprisesList = enterprises;
      this.enterpriseData = [
        ...enterprises.map(enterprise => ({
          label: enterprise.name,
          value: enterprise.enterpriseId
        }))
      ];
    }
  });
}



  /**
   * Handles the toggle for file upload mode.
   */
  onFileUploadToggle(): void {
    // Reset form when toggling mode
    this.registReadingForm.reset();
    this.isSubmitting = false;
    this.lastReading = 0;
    // Set default year/month if manual mode is re-selected
    if (!this.isFileUploadSelected) {
      this.registReadingForm.get('readingYear')?.setValue(this.year);
    }
  }

  /**
   * Handles enterprise selection, dispatches action to get zones for the selected enterprise.
   * @param event The change event from the select element.
   */
  onEnterpriseChange(event: Event): void {
    const selectedEnterpriseId = (event.target as HTMLSelectElement).value;
    this.registReadingForm.get('zone')?.reset(); // Reset zone and client/meter fields
    this.registReadingForm.get('client')?.reset();
    this.registReadingForm.get('meter')?.reset();
    this.clientData = [];
    this.meterData = [];
    this.lastReading = 0;

    if (selectedEnterpriseId) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: selectedEnterpriseId }));
      this.getZonesByEnterpriseId$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response) {
          this.zoneList = response;
          this.zoneData = [
            ...response.map(zone => ({
              label: zone.designation,
              value: zone.zoneId
            }))
          ];
        }
      });
    } else {
      this.zoneData = [{ label: 'Seleccione a zona', value: '' }];
    }
  }

  /**
   * Handles zone selection, dispatches action to get clients for the selected zone.
   * @param event The change event from the select element.
   */
  onZoneChange(event: Event): void {
    const selectedZoneId = (event.target as HTMLSelectElement).value;
    this.registReadingForm.get('client')?.reset(); // Reset client and meter fields
    this.registReadingForm.get('meter')?.reset();
    this.clientData = [];
    this.meterData = [];
    this.lastReading = 0;

    if (selectedZoneId) {
      this.store.dispatch(getClientByZoneId({ zoneId: selectedZoneId }));
      this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
        if (clients) {
          this.clientsList = clients;
          this.clientData = [
            ...clients.map(client => ({
              label: client.name,
              value: client.clientId
            }))
          ];
        }
      });
    } else {
      this.clientData = [{ label: 'Seleccione o cliente', value: '' }];
    }
  }

  /**
   * Handles client selection, dispatches action to get meters for the selected client.
   * @param event The change event from the select element.
   */
  onClientChange(event: Event): void {
    const selectedClientId = (event.target as HTMLSelectElement).value;
    this.registReadingForm.get('meter')?.reset(); // Reset meter field
    this.meterData = [];
    this.lastReading = 0;

    if (selectedClientId) {
      this.clientId = selectedClientId; // Store selected client ID
      this.store.dispatch(getClientMeterByClient({ clientId: this.clientId }));

      this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe(
        (meters) => {
          if (meters) {
            this.metersList = meters; // Store raw meter list
            this.meterData = [
              ...meters.map((meter: { meterId: string; }) => ({ label: meter.meterId || '', value: meter.meterId || '' }))
            ];
            // If there's a default meter or only one, select it
            if (meters.length > 0) {
              this.registReadingForm.get('meter')?.setValue(meters[0].meterId);
              this.onMeterChange({ target: { value: meters[0].meterId } } as unknown as Event); // Trigger meter change manually
            }
          } else {
            this.meterData = [{ label: 'Seleccione o contador', value: '' }];
          }
        }
      );
    } else {
      this.meterData = [{ label: 'Seleccione o contador', value: '' }];
    }
  }

  /**
   * Handles meter selection, updates lastReading and the custom validator.
   * @param event The change event from the select element.
   */
  onMeterChange(event: Event): void {
    const selectedMeterId = (event.target as HTMLSelectElement).value;
    this.registReadingForm.get('currentReading')?.reset(); // Reset current reading
    this.lastReading = 0; // Reset last reading

    if (selectedMeterId) {
      const selectedMeter = this.metersList.find(m => m.meterId === selectedMeterId);
 
    }
    // Update the custom validator with the new lastReading value
    this.registReadingForm.get('currentReading')?.setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]*$/),
      greaterThanPreviousReadingValidator(this.lastReading)
    ]);
    this.registReadingForm.get('currentReading')?.updateValueAndValidity();
  }

  /**
   * Handles input for current reading, ensuring it's numeric and triggering validation.
   * @param event The input event.
   */
  onCurrentReadingInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
    // Manually trigger value update and validation after replacing non-numeric chars
    this.registReadingForm.get('currentReading')?.setValue(inputElement.value, { emitEvent: false });
    this.registReadingForm.get('currentReading')?.updateValueAndValidity();
  }

  /**
   * Checks if the form is valid for submission.
   * @returns True if the form is valid, false otherwise.
   */
  isFormValid(): boolean {
    return this.registReadingForm.valid;
  }

  /**
   * Handles form submission for manual reading registration.
   */
  onSubmit(): void {
    this._dialogService.reset(); // Reset any existing dialogs

    if (this.registReadingForm.valid) {
      this.isSubmitting = true; // Set submitting state to true

      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guarda as informações do corte.',
        type: 'loading',
        isProcessing: true,
      });

      const formData = this.registReadingForm.value;
      // Map form data to the expected cut payload structure
      const cutPayload = {
        // Assuming your createCut action expects these fields
        // Adjust field names as per your ICut interface
        startDate: formData.startDate, // Need to decide how startDate is derived from year/month
        meterId: formData.meter, // Use the selected meter ID
        readingYear: formData.readingYear,
        readingMonth: formData.readingMonth,
        currentReading: formData.currentReading,
        previousReading: this.lastReading, // Include previous reading
        clientId: formData.client, // Include client ID
        zoneId: formData.zone, // Include zone ID
        enterpriseId: formData.enterprise // Include enterprise ID
        // Add other necessary fields for a 'cut' if applicable
      };

      this.store.dispatch(createCut({ cut: cutPayload }));

      this.store.pipe(select(selectSelectedCut), filter((cut) => !!cut), first(), takeUntil(this.destroy$))
        .subscribe({
          next: (cut) => {
            if (cut) {
              this._dialogService.open({
                title: 'Sucesso',
                message: 'Corte criado com sucesso!',
                type: 'success',
                showConfirmButton: true,
              });
              this.registReadingForm.reset(); // Reset form on success
              this.lastReading = 0; // Reset last reading
              this.isSubmitting = false; // Reset submitting state
              this.registReadingForm.get('readingYear')?.setValue(this.year); // Reset year
            }
          },
          error: (error) => {
            this._dialogService.open({
              title: 'Erro',
              message: error.message || 'Ocorreu um erro inesperado. Por favor contacte a equipa tecnica para o suporte.',
              type: 'error',
              showConfirmButton: true,
              cancelText: 'Cancelar',
            });
            this.isSubmitting = false; // Reset submitting state on error
          },
        });
    } else {
      // Mark all fields as touched to display validation errors
      this.registReadingForm.markAllAsTouched();
      this._dialogService.open({
        title: 'Formulário Inválido',
        message: 'Por favor, preencha todos os campos obrigatórios e corrija os erros.',
        type: 'error',
        showConfirmButton: true,
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._dialogService.reset(); // Reset dialog service on component destruction
  }
}

  
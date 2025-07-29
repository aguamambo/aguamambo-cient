import { DialogService } from 'src/app/services/dialog.service';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms"; // Added Validators
import { select, Store } from "@ngrx/store";
import { filter, first, Observable, Subject, takeUntil, combineLatest } from "rxjs"; // Added combineLatest
import { GenericConfig } from "src/app/core/config/generic.config";
import { IClient } from "src/app/models/client";
import { IEnterprise } from "src/app/models/enterprise";
import { IOption } from "src/app/models/option";
import { IZone } from "src/app/models/zone";
import { AuthService } from "src/app/services/auth.service";
import { IAppState, createSuspension, getClientByZoneId, getClientMeterByClient, getZoneByEnterpriseId, listAllClients, listAllEnterprises } from "src/app/store";
import { selectClientIsLoading, selectSelectedClients } from "src/app/store/selectors/client.selectors";
import { selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { selectEnterpriseIsLoading, selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import { selectSuspensionError, selectSuspensionIsSaving } from "src/app/store/selectors/suspension.selectors";
import { ISuspension } from 'src/app/models/suspension'; // Import ISuspension
import { selectSelectedZones, selectZoneIsLoading } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-register-suspension',
  templateUrl: './register-suspension.component.html',
  styleUrl: './register-suspension.component.css'
})
export class RegisterSuspensionComponent implements OnInit, OnDestroy {
  registSuspensionForm!: FormGroup;
  clientsData: IOption[] = [];
  clientMetersData: IOption[] = [];
  enterpriseData: IOption[] = [];
  monthsData: IOption[] = [];
  ZoneData: IOption[] = [];
  clientsList: IClient[] = [];
  ZoneList: IZone[] = [];
  enterprisesList: IEnterprise[] = [];
  clientMeter!: string | null;

  isSuspensionSaving$: Observable<boolean>;
  isZonesLoading$: Observable<boolean>;
  isEnterprisesLoading$: Observable<boolean>;
  isClientLoading$: Observable<boolean>;
  isLoading: boolean = true; // Overall loading state for the component
  isSubmitting: boolean = false; // For submit button loading state

  getZonesByCompanyId$ = this.store.pipe(select(selectSelectedZones));
  getEnterprise$ = this.store.pipe(select(selectSelectedEnterprises));
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));
  private destroy$ = new Subject<void>();
  user: string = '';
  year: number = 0;
  currentDate: Date = new Date(); // For displaying current date in header

  yearsData: IOption[] = []; // For year dropdown
  selectedYear: string = ''; // For two-way binding on year select
  selectedMonth: string = ''; // For two-way binding on month select

  constructor(
    private _dialogService: DialogService,
    private store: Store<IAppState>,
    private auth: AuthService,
    private generic: GenericConfig
  ) {
    // Combine all loading observables into a single isLoading flag
    combineLatest([
      this.store.select(selectClientIsLoading),
      this.store.select(selectSuspensionIsSaving),
      this.store.select(selectZoneIsLoading),
      this.store.select(selectEnterpriseIsLoading)
    ]).pipe(takeUntil(this.destroy$)).subscribe(
      ([clientLoading, suspensionSaving, zoneLoading, enterpriseLoading]) => {
        this.isLoading = clientLoading || suspensionSaving || zoneLoading || enterpriseLoading;
        this.isSubmitting = suspensionSaving; // Set isSubmitting based on suspension saving state
      }
    );

    this.isSuspensionSaving$ = this.store.select(selectSuspensionIsSaving);
    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);
    this.isClientLoading$ = this.store.select(selectClientIsLoading);
    this.year = this.generic.getCurrentYear();
  }

  ngOnInit(): void {
    this.auth.checkSession().then(userName => {
      this.user = userName;
      this.initForm();
      this.loadData();
    });
  }

  initForm(): void {
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    this.registSuspensionForm = new FormGroup({
      enterprise: new FormControl('', Validators.required),
      zone: new FormControl('', Validators.required),
      client: new FormControl('', Validators.required),
      meterId: new FormControl(null, Validators.required),
      startDate: new FormControl(formattedDate, Validators.required), // Initialize with current date
      suspensionReason: new FormControl('', Validators.required),
      readingYear: new FormControl(String(this.year), Validators.required), // Initialize with current year
      readingMonth: new FormControl('', Validators.required), // Keep as is, or set a default month
    });

    // Initialize yearsData
    this.yearsData = this.generateYears();
    this.selectedYear = String(this.year); // Set default selected year to current year
  }

  loadData(): void {
    this._dialogService.reset();
    this.monthsData = this.generic.generateMonths();
    this.store.dispatch(listAllEnterprises());
    this.getEnterprise$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
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
  }

  onEnterpriseChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.registSuspensionForm.get('enterprise')?.setValue(selectedValue);
    this.ZoneData = [{ label: 'Seleccione a zona', value: '' }];
    this.clientsData = [{ label: 'Seleccione o cliente', value: '' }];
    this.clientMetersData = [{ label: 'Seleccione o contador', value: '' }];

    if (selectedValue) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: selectedValue }));
      this.getZonesByCompanyId$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response) {
          this.ZoneList = response;
          this.ZoneData = [
            { label: 'Seleccione a zona', value: '' },
            ...response.map(area => ({
              label: area.designation,
              value: area.zoneId
            }))
          ];
        }
      });
    }
  }

  onZoneChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.registSuspensionForm.get('zone')?.setValue(selectedValue);
    this.clientsData = [{ label: 'Seleccione o cliente', value: '' }];
    this.clientMetersData = [{ label: 'Seleccione o contador', value: '' }];

    if (selectedValue) {
      this.store.dispatch(getClientByZoneId({ zoneId: selectedValue }));
      this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
        if (clients) {
          this.clientsList = clients;
          this.clientsData = [
            { label: 'Seleccione o cliente', value: '' },
            ...clients.map(client => ({
              label: client.name,
              value: client.clientId
            }))
          ];
        }
      });
    }
  }

  onClientChange(event: Event): void {
    const clientId = (event.target as HTMLSelectElement).value;
    this.registSuspensionForm.get('client')?.setValue(clientId);
    this.clientMetersData = [{ label: 'Seleccione o contador', value: '' }];

    if (clientId) {
      this.store.dispatch(getClientMeterByClient({ clientId: clientId }));
      this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe((meters) => {
        if (meters) {
          this.clientMetersData = [
            { label: 'Seleccione o contador', value: '' },
            ...meters.map(meter => ({
              label: meter.meterId || '',
              value: meter.meterId || ''
            }))
          ];
        }
      });
    }
  }

  onMeterSelected(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.registSuspensionForm.get('meterId')?.setValue(selectedValue);
  }

  onSubmit(): void {
    this._dialogService.reset();
    if (this.registSuspensionForm.valid) {
      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guarda as informações da suspensão.',
        type: 'loading',
        isProcessing: true,
      });

      const formData = this.registSuspensionForm.value;

      const payload: ISuspension = {
        suspensionId: `SUS-${Date.now()}`,
        meterId: formData.meterId,
        reason: formData.suspensionReason,
        startDate: formData.startDate,
        updatedAt: new Date().toISOString(),
      };

      this.store.dispatch(createSuspension({ suspension: payload }));

      this.isSuspensionSaving$.pipe(
        filter((isSaving) => !isSaving),
        first(),
        takeUntil(this.destroy$)
      ).subscribe((response) => {
        if (!response) {
          this.store.pipe(select(selectSuspensionError), first()).subscribe(error => {
            if (error) {
              this._dialogService.open({
                title: 'Erro',
                message: 'Ocorreu um erro ao criar a suspensão: ' + error,
                type: 'error',
                isProcessing: false,
              });
            } else {
              this._dialogService.open({
                title: 'Sucesso',
                message: 'Suspensão criada com sucesso.',
                type: 'success',
                isProcessing: false,
              });
              this.registSuspensionForm.reset();
              this.enterpriseData = [{ label: 'Seleccione a empresa', value: '' }];
              this.ZoneData = [{ label: 'Seleccione a zona', value: '' }];
              this.clientsData = [{ label: 'Seleccione o cliente', value: '' }];
              this.clientMetersData = [{ label: 'Seleccione o contador', value: '' }];
              this.loadData();
            }
          });
        }
      });
    } else {
      this.registSuspensionForm.markAllAsTouched();
      this._dialogService.open({
        title: 'Formulário Inválido',
        message: 'Por favor, preencha todos os campos obrigatórios.',
        type: 'error',
        isProcessing: false,
      });
    }
  }

  isFormValid(): boolean {
    return this.registSuspensionForm.valid;
  }

  generateYears(): IOption[] {
    const currentYear = new Date().getFullYear();
    const years: IOption[] = []; // Removed the placeholder option
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push({ label: String(i), value: String(i) });
    }
    return years;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IOption } from 'src/app/models/option';
import { IReading } from 'src/app/models/reading';
import { IZone } from 'src/app/models/zone';
import { getClientByZoneId, getZoneByEnterpriseId, IAppState, listAllReadings, updateReading } from 'src/app/store';
import { selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedClientMeter } from 'src/app/store/selectors/clientMeter.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectReadingIsLoading, selectReadingIsSaving, selectSelectedReading, selectSelectedReadings } from 'src/app/store/selectors/reading.selectors';
import { selectSelectedZones } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-list-readings',
  templateUrl: './list-readings.component.html',
})
export class ListReadingsComponent implements OnInit, OnDestroy {
  readingForm: FormGroup;
  readingsList: IReading[] = [];
  readingsData: IReading[] = [];
  monthsData: IOption[] = [];
  statusData: IOption[] = [];
  counter: string = '';
  clientData: IOption[] = [];
  zoneData: IOption[] = [];
  zones: IZone[] = [];
  lastReading: number = 0;
  enterpriseData: IOption[] = [];
  readingColumns: { key: keyof IReading; label: string }[] = [];
  isEditing: boolean = false;
  selectedReading!: IReading;

  isReadingsLoading$: Observable<boolean>;
  isReadingSaving$: Observable<boolean>;
  private destroy$ = new Subject<void>();
  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getReadingsByCustomerId$ = this.store.pipe(select(selectSelectedReading));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeter));

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.readingForm = this.fb.group({
      readingMonth: ['', Validators.required],
      currentReading: ['', Validators.required],
      counter: [''],
      lastReading: [''],
      enterprise: ['', Validators.required],
      zone: ['', Validators.required],
      client: ['', Validators.required],
      readingYear: [''],
      state: ['']
    });

    this.isReadingsLoading$ = this.store.select(selectReadingIsLoading);
    this.isReadingSaving$ = this.store.select(selectReadingIsSaving);

    this.readingColumns = [
      { key: 'readingId', label: 'Código' },
      { key: 'active', label: 'Cliente Activo' },
      { key: 'consumption', label: 'Consumo' },
      { key: 'updatedAt', label: 'Data de Alteracao' },
      { key: 'createdAt', label: 'Data de Criacao' },
      { key: 'currentReading', label: 'Leitura Acutal' },
      { key: 'previousReading', label: 'Leitura Anterior' },
      { key: 'readingMonth', label: 'Mês' },
      { key: 'readingYear', label: 'Ano Económico' },
      { key: 'state', label: 'Estado' },
      { key: 'meterId', label: 'Contador' },
      { key: 'userChanged', label: 'Alterado por' },
      { key: 'userCreated', label: 'Criado por' }
    ];
  }

  ngOnInit(): void {
    this.loadData();
    this.readingForm.controls['readingYear'].disable();
    this.readingForm.controls['counter'].disable();
    this.readingForm.controls['lastReading'].disable();
    this.readingForm.controls['zone'].disable();
    this.readingForm.controls['enterprise'].disable();
    this.readingForm.controls['client'].disable();
  }

  private loadData(): void {
    this.generateMonths()

    this.statusData = [
      { label: 'Seleccione...', value: '' },
      { label: 'PENDENTE', value: 'PENDING' },
      { label: 'APROVADO', value: 'APPROVED' },
      { label: 'CANCELADO', value: 'CANCELED' },
    ]

    this.store.dispatch(listAllReadings());
    this.store.pipe(select(selectSelectedReadings), takeUntil(this.destroy$)).subscribe(readings => {
      if (readings) {
        this.readingsList = readings;
        this.readingsData = readings.map(reading => ({
          ...reading,
          createdAt: this.formatDate(reading.createdAt),
          updatedAt: this.formatDate(reading.updatedAt)
        }));
      }
    });
  }

  editReading(reading: IReading): void {

    this.isEditing = true;
    this.selectedReading = reading;

    this.readingForm.patchValue({
      readingMonth: reading.readingMonth,
      currentReading: reading.currentReading,
      counter: reading.meterId,
      lastReading: reading.previousReading,
      readingYear: reading.readingYear,
      state: reading.state
    });
  }

  submitForm(): void {
    this.readingForm.controls['readingYear'].enable();
    console.log(this.readingForm.valid);
    console.log(this.isEditing);

    if (this.readingForm.valid && this.isEditing) {
      const payload = this.readingForm.value;
      this.store.dispatch(updateReading({ readingId: this.selectedReading.readingId, reading: payload }));
      this.isEditing = false;
      this.readingForm.reset();
    }
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

  onStatusSelect(event: { value: string; label: string }): void {
    if (event && event.value) {
      const selectedValue = event.value;
      this.readingForm.get('state')?.setValue(selectedValue)
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
  onMonthSelect(selectedOption: { value: string; label: string }) {
    this.readingForm.get('readingMonth')?.setValue(selectedOption.value)
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
}

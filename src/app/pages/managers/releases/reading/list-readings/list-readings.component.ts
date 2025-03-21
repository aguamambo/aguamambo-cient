import { FileHandlerService } from './../../../../../services/file-handler.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, pipe } from 'rxjs';
import { delay, filter, first, take, takeUntil } from 'rxjs/operators';
import { IOption } from 'src/app/models/option';
import { IReading } from 'src/app/models/reading';
import * as XLSX from 'xlsx'; 
import { saveAs } from 'file-saver';
import { IZone } from 'src/app/models/zone';
import { exportReadingsByZone, getClientByZoneId, getReadingByStateZone, getReadingByZone, getZoneByEnterpriseId, IAppState, listAllReadings, listAllZones, resetReadingActions, updateReading } from 'src/app/store';
import { selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedClientMeter } from 'src/app/store/selectors/clientMeter.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectExportedReadingFile, selectReadingIsLoading, selectReadingIsSaving, selectSelectedReading, selectSelectedReadings } from 'src/app/store/selectors/reading.selectors';
import { selectSelectedZones } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-list-readings',
  templateUrl: './list-readings.component.html',
})
export class ListReadingsComponent implements OnInit, OnDestroy {
  readingForm: FormGroup;
  readingsList: IReading[] = [];
  readingsData: IReading[] = [];
  selectedReadings: any[] = [];
  filteredReadings: IReading[] = [];
  selectedZone: string = '';
  selectedState: string = '';

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
  enableExport: boolean = false;
  selectedReading!: IReading;
  selectedBulkStatus: any;
  setState: string = ''
  selectedZoneId: string = '';
  selectedZoneDesc: string = '';

  isReadingsLoading$: Observable<boolean>;
  isReadingSaving$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getReadingsByCustomerId$ = this.store.pipe(select(selectSelectedReading));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeter));
  readingColumnsWithCheckbox: ({ key: keyof IReading; label: string; })[];

  constructor(private fb: FormBuilder, private store: Store<IAppState>, private fileService: FileHandlerService) {
    this.readingForm = this.fb.group({
      readingMonth: ['', Validators.required],
      currentReading: ['', Validators.required],
      counter: [''],
      lastReading: [''],
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

    this.readingColumnsWithCheckbox = [
      { key: 'checkbox', label: '' },
      ...this.readingColumns,
    ];
  }

  ngOnInit(): void {
    this.loadData();
    this.setFormControlState(false);
  }

  private loadData(): void {
    this.generateMonths();

    this.statusData = [
      { label: 'Seleccione...', value: '' },
      { label: 'PENDENTE', value: 'PENDING' },
      { label: 'APROVADO', value: 'APPROVED' },
      { label: 'CANCELADO', value: 'CANCELED' },
    ];

    this.getAllReadings()
    this.getAllZones()
  }

  getAllZones() {
    this.store.dispatch(listAllZones());
    this.store.pipe(select(selectSelectedZones), filter((zones) => !!zones), first()).subscribe(zones => {
      if (zones) {
        this.zones = zones;
        this.zoneData = [
          { label: 'TODOS BAIRROS', value: 'AZN' },
          ...zones.map(zone => ({
            label: zone.designation.toUpperCase(),
            value: zone.zoneId
          }))
        ]

        this.filteredReadings = [...this.readingsData]
      }
    });
  }

  getAllReadings() {
    this.store.dispatch(listAllReadings());

    this.store.pipe(select(selectSelectedReadings), takeUntil(this.destroy$)).subscribe(readings => {
      if (readings) {
        this.readingsList = readings;
        this.readingsData = readings.map(reading => ({
          ...reading,
          createdAt: this.formatDate(reading.createdAt),
          updatedAt: this.formatDate(reading.updatedAt),
          state: this.translateState(reading.state)
        }));

        this.filteredReadings = [...this.readingsData]
      }
    });

  }

  translateState(state: string): string {
    switch (state) {
      case 'PENDING':
        return 'PENDENTE';
      case 'APPROVED':
        return 'APROVADO';
      case 'CANCELED':
        return 'CANCELADO';
      default:
        return state;
    }
  }

  exportExcel() {
    this.store.dispatch(exportReadingsByZone({ zoneId: this.selectedZoneId }))

    this.store.pipe(select(selectExportedReadingFile), filter((file) => !!file), first()).subscribe((fileContent) => {
      if (fileContent) {
        const date = new Date()
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const blob = new Blob([fileContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedZoneDesc}_${day}-${month}-${year} ${hours}:${minutes}:${seconds}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      }
    });
  }

  private setFormControlState(isEnabled: boolean): void {
    const method = isEnabled ? 'enable' : 'disable';
    this.readingForm.controls['readingYear'][method]();
    this.readingForm.controls['counter'][method]();
    this.readingForm.controls['lastReading'][method]();
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

    this.setFormControlState(true);
  }

  submitForm(): void {
    this.readingForm.controls['readingYear'].enable();

    if (this.readingForm.valid && this.isEditing) {
      const payload = {
        readingMonth: this.selectedReading.readingMonth,
        currentReading: this.selectedReading.currentReading,
        readingYear: this.selectedReading.readingYear,
        state: this.readingForm.get('state')?.value
      }

      this.store.dispatch(updateReading({ readingId: this.selectedReading.readingId, reading: payload }));
      this.isEditing = false;
      this.readingForm.reset();
      this.setFormControlState(false);

      delay(5000)

      this.loadData()
    }
  }

  filterByZone(event: { value: string, label: string }) {
    this.selectedZoneId = event.value;
    this.selectedZoneDesc = event.label;


    this.store.dispatch(resetReadingActions())

    if (event.value === 'AZN') {
      this.enableExport = false
      this.getAllReadings()
    } else {

      this.applyFilters();
    }
  }

  filterByState(event: { value: string, label: string }) {
    this.selectedState = event.value;

    this.applyFilters();
  }

  applyFilters() {

    this.cancel()
    const payload = {
      zoneId: this.selectedZoneId
    }


    if (this.selectedZoneId) {
      this.store.dispatch(getReadingByZone({ payload }))

      this.store.pipe(select(selectSelectedReadings), filter((readings) => !!readings), first()).subscribe((readings) => {
        if (readings) {

          this.filteredReadings = readings
          this.readingsList = readings
          this.enableExport = true

        }
      })
    }

  }

  cancel() {
    this.isEditing = false
  }

  toggleSelection(reading: any) {
    const index = this.selectedReadings.findIndex(item => item.id === reading.id);
    if (index > -1) {
      this.selectedReadings.splice(index, 1);
    } else {
      this.selectedReadings.push(reading);
    }
  }

  resetFilters() {
    this.selectedZone = '';
    this.selectedState = '';
    this.filteredReadings = [...this.readingsList];
  }
  applyBulkStatusChange(): void {
    if (this.selectedBulkStatus) {
      this.readingsList = this.readingsList.map((reading) => {
        return {
          ...reading,
          state: this.selectedBulkStatus
        };
      });
      this.saveUpdatedReadings();
    }
  }


  onBulkStatusChange(event: { value: string }): void {
    const selectedStatus = event.value;
    if (selectedStatus) {
      this.selectedBulkStatus = selectedStatus;
    }
  }

  private saveUpdatedReadings(): void {
    if (this.selectedBulkStatus) {
      this.readingsList.forEach((reading) => {
        const updatedReading = { ...reading, state: this.selectedBulkStatus };
        this.store.dispatch(updateReading({
          readingId: updatedReading.readingId,
          reading: updatedReading
        }));
      });
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
    if (option?.value) {
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

  onStatusSelect(event: { value: string }): void {
    if (event?.value) {
      this.readingForm.get('state')?.setValue(event.value);

      this.setState = event.value;
    }
  }

  onEnterpriseSelect(event: { value: string }): void {
    if (event?.value) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: event.value }));
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

  onZoneSelect(event: { value: string }): void {
    if (event?.value) {
      this.selectedZoneId = event.value
      this.store.dispatch(getClientByZoneId({ zoneId: event.value }));
      this.filterPendingReadingsByZone(event.value);
    }
  }

  filterPendingReadingsByZone(zoneId: string): void {
    this.filteredReadings = this.readingsData.filter(
      reading => reading.state === 'PENDENTE'
    );
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

  onMonthSelect(selectedOption: { value: string }): void {
    this.readingForm.get('readingMonth')?.setValue(selectedOption.value);
  }

  filterReadings(searchTerm: string): void {
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredReadings = this.readingsData.filter(reading =>
      Object.values(reading).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
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

  private formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { delay, Observable, Subject, takeUntil } from 'rxjs';
import { IOption } from 'src/app/models/option';
import { IReading } from 'src/app/models/reading';
import { IZone } from 'src/app/models/zone';
import { IAppState, listAllReadings, updateReading, getZoneByEnterpriseId, getClientByZoneId, getReadingByStatus, updateBulkReadings } from 'src/app/store';
import { selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedClientMeter } from 'src/app/store/selectors/clientMeter.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectSelectedReading, selectReadingIsLoading, selectReadingIsSaving, selectSelectedReadings } from 'src/app/store/selectors/reading.selectors';
import { selectSelectedZones } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-pending-readings',
  templateUrl: './pending-readings.component.html',
  styleUrls: ['./pending-readings.component.css'] // Corrected 'styleUrl' to 'styleUrls'
})
export class PendingReadingsComponent implements OnInit, OnDestroy {
  readingForm: FormGroup;
  readingsList: IReading[] = [];
  readingsData: IReading[] = [];
  filteredReadings: IReading[] = [];
  paginatedReadings: IReading[] = []; // New: For current page's readings
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
  selectedBulkStatus: any;
  searchTerm: string = ''; // New: To hold search input

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust as needed
  totalPages: number = 0;

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

    this.store.dispatch(getReadingByStatus({ state: 'PENDING' }));

    this.store.pipe(select(selectSelectedReadings), takeUntil(this.destroy$)).subscribe(readings => {
      if (readings) {
        this.readingsList = readings;
        this.readingsData = readings.map(reading => ({
          ...reading,
          createdAt: this.formatDate(reading.createdAt),
          updatedAt: this.formatDate(reading.updatedAt),
          state: this.translateState(reading.state) // Ensure state is translated for display
        }));
        this.filterReadings(this.searchTerm); // Apply filter and pagination after data load
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

  getStatusColor(state: string): string {
    switch (state) {
      case 'APROVADO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700/20 dark:text-slate-400';
    }
  }

  filterReadings(searchTerm: string): void {
    this.searchTerm = searchTerm; // Store the search term
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredReadings = this.readingsData.filter(reading =>
      Object.values(reading).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
    this.currentPage = 1; // Reset to first page on filter change
    this.paginateReadings();
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
      state: reading.state // Use original state value for form
    });

    // this.setFormControlState(true); // Don't re-enable if some are meant to be read-only
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.readingForm.reset();
    this.setFormControlState(false);
  }

  submitForm(): void {
    this.readingForm.controls['readingYear'].enable(); // Re-enable for submission if needed

    if (this.readingForm.valid && this.isEditing) {
      const payload = { ...this.selectedReading, ...this.readingForm.value };
      // Convert state back to original enum value if it was translated for display
      payload.state = this.statusData.find(s => s.label === payload.state)?.value || payload.state;

      this.store.dispatch(updateReading({ readingId: this.selectedReading.readingId, reading: payload }));

      // Reset form and state after successful dispatch (or after effect completes)
      // For immediate UX, you can reset here, but consider handling in effect for robustness.
      this.isEditing = false;
      this.readingForm.reset();
      this.setFormControlState(false);

      // This delay might not be ideal for handling async operations.
      // Better to rely on NgRx effects to trigger reloadData after successful update.
      // setTimeout(() => this.loadData(), 500); // Small delay to allow update to propagate
    }
  }

  applyBulkStatusChange(): void {
    if (this.selectedBulkStatus) {
      // Get only the readingIds from the currently filtered/paginated readings
      const readingIds = this.filteredReadings.map((reading) => reading.readingId);

      const payload = {
        readingIds: readingIds,
        state: this.selectedBulkStatus
      };

      this.store.dispatch(updateBulkReadings({ payload: payload }));
      this.selectedBulkStatus = ''; // Clear bulk status selection after applying
    }
  }


  onBulkStatusChange(event: { value: string }): void {
    this.selectedBulkStatus = event.value;
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
    }
  }

  onEnterpriseSelect(event: { value: string }): void {
    if (event?.value) {
      this.store.dispatch(getClientByZoneId({ zoneId: event.value }));
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

  onMonthSelect(selectedOption: { value: string }): void {
    this.readingForm.get('readingMonth')?.setValue(selectedOption.value);
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

  // --- Pagination Logic ---
  paginateReadings(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReadings = this.filteredReadings.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredReadings.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateReadings();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateReadings();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateReadings();
    }
  }
}
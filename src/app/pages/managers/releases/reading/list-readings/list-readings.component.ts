import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { Observable, Subject, filter, first, takeUntil, delay } from "rxjs";
import { IOption } from "src/app/models/option";
import { IReading } from "src/app/models/reading";
import { IZone } from "src/app/models/zone";
import { FileHandlerService } from "src/app/services/file-handler.service";
import {
  IAppState,
  listAllZones,
  listAllReadings,
  exportReadingsByZone,
  updateReading,
  resetReadingActions,
  getReadingByZone,
} from "src/app/store";
import { selectSelectedClients } from "src/app/store/selectors/client.selectors";
import { selectSelectedClientMeter } from "src/app/store/selectors/clientMeter.selectors";
import { selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import {
  selectSelectedReading,
  selectReadingIsLoading,
  selectReadingIsSaving,
  selectSelectedReadings,
  selectExportedReadingFile,
} from "src/app/store/selectors/reading.selectors";
import { selectSelectedZones } from "src/app/store/selectors/zone.selectors";
import { GenericConfig } from "src/app/core/config/generic.config"; // Import GenericConfig

@Component({
  selector: "app-list-readings",
  templateUrl: "./list-readings.component.html",
  styleUrls: ["./list-readings.component.css"],
})
export class ListReadingsComponent implements OnInit, OnDestroy {
  readingForm: FormGroup;
  readingsList: IReading[] = [];
  readingsData: IReading[] = []; // All raw readings from the store
  selectedReadings: IReading[] = [];
  selectedZone = "";
  selectedState = "";
  monthsData: IOption[] = [];
  statusData: IOption[] = [];
  counter = "";
  clientData: IOption[] = [];
  zoneData: IOption[] = [];
  zones: IZone[] = [];
  lastReading = 0;
  enterpriseData: IOption[] = [];
  readingColumns: { key: keyof IReading; label: string }[] = [];
  isEditing = false;
  enableExport = false;
  selectedReading!: IReading;
  selectedBulkStatus: any;
  setState = "";
  selectedZoneId = "";
  selectedZoneDesc = "";
  searchTerm = "";

  isReadingsLoading$: Observable<boolean>;
  isReadingSaving$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getReadingsByCustomerId$ = this.store.pipe(select(selectSelectedReading));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeter));
  readingColumnsWithCheckbox: { key: keyof IReading; label: string }[];

  // Pagination Properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // You can make this configurable if needed
  totalPages: number = 1;

  constructor(
    private _fb: FormBuilder,
    private store: Store<IAppState>,
    private fileService: FileHandlerService,
    private genericConfig: GenericConfig, // Inject GenericConfig
  ) {
    this.readingForm = this._fb.group({
      readingMonth: ["", Validators.required],
      currentReading: ["", Validators.required],
      counter: [""],
      lastReading: [""],
      readingYear: [""],
      state: ["", Validators.required], // Added Validators.required here
    });

    this.isReadingsLoading$ = this.store.select(selectReadingIsLoading);
    this.isReadingSaving$ = this.store.select(selectReadingIsSaving);

    this.readingColumns = [
      { key: "readingYear", label: "Ano" },
      { key: "readingMonth", label: "Mês" },
      { key: "meterId", label: "Contador" },
      { key: "previousReading", label: "Leitura Anterior" },
      { key: "currentReading", label: "Leitura Actual" },
      { key: "state", label: "Estado" },
      { key: "createdAt", label: "Data" },
    ];

    this.readingColumnsWithCheckbox = [{ key: "checkbox", label: "" }, ...this.readingColumns];
  }

  ngOnInit(): void {
    this.loadData();
    this.setFormControlState(false);
  }

  private loadData(): void {
    this.monthsData = this.genericConfig.generateMonths(); // Use GenericConfig to get months
    this.statusData = [
      { label: "Seleccione...", value: "" },
      { label: "PENDENTE", value: "PENDING" },
      { label: "APROVADO", value: "APPROVED" },
      { label: "CANCELADO", value: "CANCELED" },
    ];
    this.getAllReadings();
    this.getAllZones();
  }

  getAllZones() {
    this.store.dispatch(listAllZones());
    this.store
      .pipe(
        select(selectSelectedZones),
        filter((zones) => !!zones),
        first(),
      )
      .subscribe((zones) => {
        if (zones) {
          this.zones = zones;
          this.zoneData = [
            { label: "TODOS BAIRROS", value: "AZN" },
            ...zones.map((zone) => ({
              label: zone.designation.toUpperCase(),
              value: zone.zoneId,
            })),
          ];
          // Initial filter, will be re-applied by getter
          this.updatePagination();
        }
      });
  }

  getAllReadings() {
    this.store.dispatch(listAllReadings());
    this.store.pipe(select(selectSelectedReadings), takeUntil(this.destroy$)).subscribe((readings) => {
      if (readings) {
        this.readingsList = readings;
        // Store raw readings in readingsData to use original values for patching
        this.readingsData = readings;
        this.updatePagination(); // Update pagination when readingsData changes
      }
    });
  }

  translateState(state: string): string {
    switch (state) {
      case "PENDING":
        return "PENDENTE";
      case "APPROVED":
        return "APROVADO";
      case "CANCELED":
        return "CANCELADO";
      default:
        return state;
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "aprovado":
      case "approved": // Use original value for consistency
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pendente":
      case "pending": // Use original value for consistency
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelado":
      case "canceled": // Use original value for consistency
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  }

  getStatusLabel(status: string): string {
    return this.translateState(status);
  }

  exportExcel() {
    this.store.dispatch(exportReadingsByZone({ zoneId: this.selectedZoneId }));
    this.store
      .pipe(
        select(selectExportedReadingFile),
        filter((file) => !!file),
        first(),
      )
      .subscribe((fileContent) => {
        if (fileContent) {
          const date = new Date();
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          const blob = new Blob([fileContent], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
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
    const method = isEnabled ? "enable" : "disable";
    // Only enable/disable the editable fields, not the readonly ones
    this.readingForm.controls["readingMonth"][method]();
    this.readingForm.controls["currentReading"][method]();
    this.readingForm.controls["state"][method]();

    // Ensure readonly fields remain disabled
    this.readingForm.controls["readingYear"].disable();
    this.readingForm.controls["counter"].disable();
    this.readingForm.controls["lastReading"].disable();
  }

  editReading(reading: IReading): void {
    this.isEditing = true;
    this.selectedReading = reading;
    this.readingForm.patchValue({
      readingMonth:  this.monthsData.find(month => month.value === reading.readingMonth.toString())?.label, 
      currentReading: reading.currentReading,
      counter: reading.meterId,
      lastReading: reading.previousReading,
      readingYear: reading.readingYear,
      state: reading.state, // Patch with the original state value (e.g., "PENDING"), not the translated label
    });
    this.setFormControlState(true);
  }

  submitForm(): void {
    if (this.readingForm.valid && this.isEditing) {
      // Re-enable for submission if needed by API, then disable again
      this.readingForm.controls["readingYear"].enable();
      this.readingForm.controls["counter"].enable();
      this.readingForm.controls["lastReading"].enable();

      const payload = {
        readingMonth: this.readingForm.get("readingMonth")?.value,
        currentReading: this.readingForm.get("currentReading")?.value,
        readingYear: this.readingForm.get("readingYear")?.value,
        state: this.readingForm.get("state")?.value,
      };

      this.store.dispatch(updateReading({ readingId: this.selectedReading.readingId, reading: payload }));
      this.store.select(selectReadingIsSaving).pipe(
        filter(saving => !saving), // Wait for saving to complete
        first(),
        delay(500) // Small delay to ensure state update propagates
      ).subscribe(() => {
        this.isEditing = false;
        this.readingForm.reset();
        this.setFormControlState(false);
        this.getAllReadings(); // Reload data to reflect changes
      });
    }
  }

  filterByZone(event: { value: string; label: string }) {
    this.selectedZoneId = event.value;
    this.selectedZoneDesc = event.label;
    this.store.dispatch(resetReadingActions());
    if (event.value === "AZN") {
      this.enableExport = false;
      this.getAllReadings(); // Reload all readings
    } else {
      this.applyFilters(); // Apply zone filter
    }
    this.currentPage = 1; // Reset to first page on filter change
    this.updatePagination();
  }

  applyFilters() {
    this.cancel(); // Close edit form on filter change
    const payload = {
      zoneId: this.selectedZoneId,
    };
    if (this.selectedZoneId) {
      this.store.dispatch(getReadingByZone({ payload }));
      this.store
        .pipe(
          select(selectSelectedReadings),
          filter((readings) => !!readings),
          first(),
        )
        .subscribe((readings) => {
          if (readings) {
            this.readingsList = readings; // Update readingsList
            this.readingsData = readings; // Store raw readings
            this.enableExport = true;
            this.updatePagination(); // Update pagination after applying zone filter
          }
        });
    }
  }

  cancel() {
    this.isEditing = false;
    this.readingForm.reset();
    this.setFormControlState(false);
  }

  toggleSelection(reading: IReading) {
    const index = this.selectedReadings.findIndex((item) => item.readingId === reading.readingId);
    if (index > -1) {
      this.selectedReadings.splice(index, 1);
    } else {
      this.selectedReadings.push(reading);
    }
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedReadings = [];
    } else {
      this.selectedReadings = [...this.paginatedReadings]; // Select all on current page
    }
  }

  isAllSelected(): boolean {
    return this.paginatedReadings.length > 0 && this.selectedReadings.length === this.paginatedReadings.length &&
           this.paginatedReadings.every(reading => this.selectedReadings.includes(reading));
  }

  isIndeterminate(): boolean {
    return this.selectedReadings.length > 0 && !this.isAllSelected();
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, "");
  }

  onMonthSelect(selectedOption: { value: string }): void {
    this.readingForm.get("readingMonth")?.setValue(selectedOption.value);
  }

  filterReadings(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1; // Reset to first page on search change
    this.updatePagination(); // Re-calculate pagination based on new filters
  }
 

  private formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Pagination Logic ---

  get filteredReadings(): IReading[] {
    let readings = this.readingsData;

    // Apply search term filter
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      readings = readings.filter(reading =>
        Object.values(reading).some(value =>
          String(value).toLowerCase().includes(searchTermLower)
        )
      );
    }
    return readings;
  }

  get paginatedReadings(): IReading[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredReadings.slice(startIndex, endIndex);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReadings.length / this.itemsPerPage);
    // Adjust current page if it's out of bounds after filtering/data changes
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1; // Or 0, depending on desired empty state
    }
    // Clear selections if the current page data changes
    this.selectedReadings = [];
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.selectedReadings = []; // Clear selections on page change
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.selectedReadings = []; // Clear selections on page change
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.selectedReadings = []; // Clear selections on page change
    }
  }

  get enableExportButton(): boolean {
    // Enable export if there are any filtered readings, regardless of current page
    return this.filteredReadings.length > 0;
  }
}

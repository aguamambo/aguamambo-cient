import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Store, select } from "@ngrx/store";
import { Observable, Subject, combineLatest, takeUntil, filter, first } from "rxjs";
import { ISuspension } from "src/app/models/suspension";
import { IAppState, listAllSuspensions, updateSuspension } from "src/app/store";
import { selectSuspensionIsLoading, selectSuspensionIsSaving, selectSelectedSuspensions } from "src/app/store/selectors/suspension.selectors";

 
 

@Component({
  selector: 'app-list-suspensions',
  templateUrl: './list-suspensions.component.html',
  styleUrls: ['./list-suspensions.component.css']
})
export class ListSuspensionsComponent implements OnInit, OnDestroy {
suspensionForm: FormGroup;
  suspensionsList: ISuspension[] = []; // Raw list of suspensions from the store
  suspensionsData: ISuspension[] = []; // Used to hold the raw suspensions data for filtering and form patching
  filteredSuspensions: ISuspension[] = []; // Suspensions filtered by search term
  suspensionColumns: { key: keyof ISuspension; label: string }[] = [];
  isEditing: boolean = false;
  selectedSuspension!: ISuspension; // The suspension currently being edited

  isSuspensionLoading$: Observable<boolean>;
  isSuspensionSaving$: Observable<boolean>;
  isLoading: boolean = true; // Overall loading state for the component

  private destroy$ = new Subject<void>();

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of items to display per page
  totalPages: number = 0;
  paginatedSuspensions: ISuspension[] = [];

  // Selection properties for table rows
  selectedSuspensions: ISuspension[] = []; // Array to hold currently selected suspensions
  searchTerm: string = ''; // Current search term for filtering

  // Flag to enable/disable export button (can be dynamic based on data presence)
  enableExportButton: boolean = true;

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    // Initialize the form with controls and validators
    this.suspensionForm = this.fb.group({
      suspensionId: new FormControl({ value: '', disabled: true }, Validators.required),
      meterId: ['', Validators.required],
      suspensionReason: ['', Validators.required], // Corresponds to 'reason' in ISuspension
      startDate: ['', Validators.required],
      endDate: ['', Validators.required], // Added endDate form control
    });

    // Select loading and saving states from the NgRx store
    this.isSuspensionLoading$ = this.store.select(selectSuspensionIsLoading);
    this.isSuspensionSaving$ = this.store.select(selectSuspensionIsSaving);

    // Define columns for the suspensions table display
    this.suspensionColumns = [
      { key: 'suspensionId', label: 'Código da Suspensão' },
      { key: 'meterId', label: 'Contador Suspenso' },
      { key: 'reason', label: 'Motivo da Suspensão' }, // 'reason' is the property name in ISuspension
      { key: 'startDate', label: 'Data de Início' },
      { key: 'endDate', label: 'Data de Fim' }, // Added endDate column
      { key: 'updatedAt', label: 'Última Atualização' }, // Added updatedAt column
    ];
  }

  ngOnInit(): void {
    // Combine loading observables to manage a single isLoading state for the UI
    combineLatest([
      this.isSuspensionLoading$,
      this.isSuspensionSaving$
    ]).pipe(takeUntil(this.destroy$)).subscribe(
      ([suspensionLoading, suspensionSaving]) => {
        this.isLoading = suspensionLoading || suspensionSaving;
      }
    );

    this.loadSuspensions();
  }

  /**
   * Dispatches action to load all suspensions and subscribes to updates from the store.
   */
  private loadSuspensions(): void {
    this.store.dispatch(listAllSuspensions());
    this.store.pipe(select(selectSelectedSuspensions), takeUntil(this.destroy$)).subscribe(suspensions => {
      if (suspensions) {
        this.suspensionsList = suspensions; // Store original suspensions list
        this.suspensionsData = suspensions; // suspensionsData now holds the original ISuspension objects
        this.filterSuspensions(this.searchTerm); // Apply initial filter and pagination
      }
    });
  }

  /**
   * Filters the suspensions list based on a search term and recalculates pagination.
   * @param searchTerm The text to search for across suspension properties.
   */
  filterSuspensions(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase();
    let tempFilteredSuspensions = this.suspensionsData;

    if (this.searchTerm) {
      tempFilteredSuspensions = tempFilteredSuspensions.filter(suspension =>
        // Convert all values to string and lowercase for consistent searching
        Object.values(suspension).some(value =>
          String(value).toLowerCase().includes(this.searchTerm)
        )
      );
    }

    this.filteredSuspensions = tempFilteredSuspensions;
    this.currentPage = 1; // Reset to first page on filter change
    this.calculatePagination();
  }

  /**
   * Sets the component into editing mode and populates the form with the selected suspension's data.
   * Converts the startDate and endDate to YYYY-MM-DD format for the HTML date input.
   * @param suspension The ISuspension object to be edited.
   */
  editSuspension(suspension: ISuspension): void {
    this.isEditing = true;
    this.selectedSuspension = suspension;

    // Convert the startDate to 'YYYY-MM-DD' format required by input type="date"
    let formattedStartDateForInput = '';
    if (suspension.startDate) {
      const date = new Date(suspension.startDate);
      // Ensure the date is valid before formatting
      if (!isNaN(date.getTime())) {
        formattedStartDateForInput = date.toISOString().split('T')[0];
      }
    }

    // Convert the endDate to 'YYYY-MM-DD' format required by input type="date"
    let formattedEndDateForInput = '';
    if (suspension.endDate) {
      const date = new Date(suspension.endDate);
      if (!isNaN(date.getTime())) {
        formattedEndDateForInput = date.toISOString().split('T')[0];
      }
    }

    this.suspensionForm.patchValue({
      suspensionId: suspension.suspensionId,
      meterId: suspension.meterId,
      suspensionReason: suspension.reason, // Map 'reason' from model to 'suspensionReason' in form
      startDate: formattedStartDateForInput, // Patch with YYYY-MM-DD format
      endDate: formattedEndDateForInput, // Patch with YYYY-MM-DD format
    });
  }

  /**
   * Cancels the editing process, resets the form, and hides the edit section.
   */
  cancel(): void {
    this.isEditing = false;
    this.suspensionForm.reset();
  }

  /**
   * Handles form submission for updating a suspension.
   * Dispatches NgRx action for update.
   */
  submitForm(): void {
    if (this.suspensionForm.valid && this.isEditing) {
      // Use getRawValue() to include values from disabled form controls (like suspensionId)
      const formValues = this.suspensionForm.getRawValue();

      // Format startDate and endDate to YYYY-MM-DDTHH:mm:ss
      const formattedStartDate = formValues.startDate ? `${formValues.startDate}T22:00:00` : null;
      const formattedEndDate = formValues.endDate ? `${formValues.endDate}T22:00:00` : null;

      const payload = {
       ...formValues,
        startDate: formattedStartDate,
        endDate: formattedEndDate, 
      };

      this.store.dispatch(updateSuspension({ suspensionId: this.selectedSuspension.suspensionId, suspension: payload }));

      // Optionally, listen for success actions to reset form/hide edit section
      this.isSuspensionSaving$.pipe(
        filter(isSaving => !isSaving), // Wait until saving completes
        first(), // Take only the first emission after completion
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.isEditing = false; // Hide edit form
        this.suspensionForm.reset(); // Reset form
        // In a real app, you'd listen for a success action specifically
        // and potentially show a success message.
      });
    } else {
      // Mark all fields as touched to display validation errors
      this.suspensionForm.markAllAsTouched();
    }
  }

  // --- Pagination Logic ---

  /**
   * Calculates total pages and updates the paginatedSuspensions array based on current page and items per page.
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSuspensions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSuspensions = this.filteredSuspensions.slice(startIndex, endIndex);
    this.selectedSuspensions = []; // Clear selection when page changes
  }

  /**
   * Navigates to a specific page.
   * @param page The page number to navigate to.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }

  /**
   * Navigates to the previous page.
   */
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  /**
   * Navigates to the next page.
   */
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // --- Selection Logic ---

  /**
   * Checks if all suspensions on the current page are selected.
   * @returns True if all suspensions on the current page are selected, false otherwise.
   */
  isAllSelected(): boolean {
    return this.paginatedSuspensions.length > 0 && this.paginatedSuspensions.every(suspension => this.selectedSuspensions.includes(suspension));
  }

  /**
   * Checks if some, but not all, suspensions on the current page are selected.
   * Used for indeterminate checkbox state.
   * @returns True if some suspensions are selected but not all, false otherwise.
   */
  isIndeterminate(): boolean {
    return this.selectedSuspensions.length > 0 && !this.isAllSelected();
  }

  /**
   * Toggles selection of all suspensions on the current page.
   * If all are selected, deselects all. Otherwise, selects all.
   */
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedSuspensions = [];
    } else {
      this.selectedSuspensions = [...this.paginatedSuspensions];
    }
  }

  /**
   * Toggles the selection of a single suspension.
   * @param suspension The ISuspension object to toggle selection for.
   */
  toggleSelection(suspension: ISuspension): void {
    const index = this.selectedSuspensions.indexOf(suspension);
    if (index > -1) {
      this.selectedSuspensions.splice(index, 1); // Deselect
    } else {
      this.selectedSuspensions.push(suspension); // Select
    }
  }

  /**
   * Placeholder method for deleting selected suspensions.
   * In a real application, this would dispatch an NgRx action.
   */
  deleteSelected(): void {
    console.log('Deleting selected suspensions:', this.selectedSuspensions);
    // TODO: Dispatch NgRx action to delete suspensions
    // After successful deletion, refresh data or remove them from list
    this.selectedSuspensions = []; // Clear selection after action
  }

  /**
   * Placeholder method for exporting suspension data to Excel.
   * In a real application, this would trigger a data export service.
   */
  exportExcel(): void {
    console.log('Exporting suspensions to Excel');
    // TODO: Implement Excel export logic
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
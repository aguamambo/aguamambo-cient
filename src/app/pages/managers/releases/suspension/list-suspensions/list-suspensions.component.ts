import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, takeUntil, combineLatest, filter, first } from 'rxjs';
import { IOption } from 'src/app/models/option';
import { ISuspension } from 'src/app/models/suspension';
import { IAppState, listAllSuspensions, updateSuspension } from 'src/app/store';
import { selectSelectedSuspensions, selectSuspensionIsLoading, selectSuspensionIsSaving } from 'src/app/store/selectors/suspension.selectors';

@Component({
  selector: 'app-list-suspensions',
  templateUrl: './list-suspensions.component.html',
  styleUrls: ['./list-suspensions.component.css'] // Corrected styleUrl to styleUrls
})
export class ListSuspensionsComponent implements OnInit, OnDestroy {
  suspensionForm: FormGroup;
  suspensionsList: ISuspension[] = []; // Raw list of suspensions from the store
  suspensionsData: ISuspension[] = []; // Formatted suspensions list for display (e.g., formatted date)
  filteredSuspensions: ISuspension[] = []; // Suspensions filtered by search term
  clientsData: IOption[] = []; // Not used in this component currently, but kept for context
  suspensionColumns: { key: keyof ISuspension; label: string }[] = [];
  isEditing: boolean = false;
  selectedSuspension!: ISuspension;

  isSuspensionsLoading$: Observable<boolean>;
  isSuspensionSaving$: Observable<boolean>;
  isLoading: boolean = true; // Overall loading state for the component

  private destroy$ = new Subject<void>();

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of items to display per page - Explicitly set to 10
  totalPages: number = 0;
  paginatedSuspensions: ISuspension[] = [];

  // Selection properties
  selectedSuspensions: ISuspension[] = []; // Array to hold currently selected suspensions
  searchTerm: string = ''; // Current search term for filtering

  // Removed Status options for dropdown as status field is being removed
  // statusOptions: IOption[] = [
  //   { label: 'Activo', value: 'ACTIVE' },
  //   { label: 'Inactivo', value: 'INACTIVE' },
  //   { label: 'Pendente', value: 'PENDING' }
  // ];

  enableExportButton: boolean = true; // Flag to enable/disable export button

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.suspensionForm = this.fb.group({
      suspensionId: new FormControl({ value: '', disabled: true }), // Add suspensionId for patching
      meterId: ['', Validators.required],
      suspensionReason: ['', Validators.required], // FIX: Changed 'reason' to 'suspensionReason' to match HTML
      startDate: ['', Validators.required],
      // Removed status from form
      // Removed notes from form
    });

    this.isSuspensionsLoading$ = this.store.select(selectSuspensionIsLoading);
    this.isSuspensionSaving$ = this.store.select(selectSuspensionIsSaving);

    this.suspensionColumns = [
      { key: 'suspensionId', label: 'Código' },
      { key: 'meterId', label: 'Contador Suspenso' },
      { key: 'reason', label: 'Motivo' }, // Added reason to columns
      { key: 'startDate', label: 'Data Início' },
      // Removed status from columns
      // Removed notes from columns
    ];
  }

  ngOnInit(): void {
    // Combine loading observables to manage a single isLoading state for the UI
    combineLatest([
      this.isSuspensionsLoading$,
      this.isSuspensionSaving$
    ]).pipe(takeUntil(this.destroy$)).subscribe(
      ([suspensionsLoading, suspensionSaving]) => {
        this.isLoading = suspensionsLoading || suspensionSaving;
      }
    );

    this.loadSuspensionsData();
    // No need to disable status here, it will be enabled/disabled by setFormControlState
  }

  /**
   * Dispatches action to load all suspensions and subscribes to updates from the store.
   */
  private loadSuspensionsData(): void {
    this.store.dispatch(listAllSuspensions());
    this.store.pipe(select(selectSelectedSuspensions), takeUntil(this.destroy$)).subscribe(suspensions => {
      if (suspensions) {
        this.suspensionsList = suspensions; // Store original suspensions list
        this.suspensionsData = suspensions; // Store raw data for filtering and form patching
        console.log('Suspensions loaded from store:', this.suspensionsData.length); // Debugging log
        this.filterSuspensions(this.searchTerm); // Apply initial filter and pagination
      } else {
        console.log('No suspensions data received from store.'); // Debugging log
        this.suspensionsList = [];
        this.suspensionsData = [];
        this.filterSuspensions(this.searchTerm);
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
        Object.values(suspension).some(value =>
          String(value).toLowerCase().includes(this.searchTerm)
        )
      );
    }

    this.filteredSuspensions = tempFilteredSuspensions;
    this.currentPage = 1; // Reset to first page on filter change
    this.calculatePagination();
    console.log('Filtered suspensions count:', this.filteredSuspensions.length); // Debugging log
  }

  /**
   * Sets the component into editing mode and populates the form with the selected suspension's data.
   * Converts the startDate to YYYY-MM-DD format for the HTML date input.
   * @param suspension The ISuspension object to be edited.
   */
  editSuspension(suspension: ISuspension): void {
    this.isEditing = true;
    this.selectedSuspension = suspension;

    // Convert the startDate to 'YYYY-MM-DD' format required by input type="date"
    let formattedDateForInput = '';
    if (suspension.startDate) {
      const date = new Date(suspension.startDate);
      if (!isNaN(date.getTime())) {
        formattedDateForInput = date.toISOString().split('T')[0];
      }
    }

    this.suspensionForm.patchValue({
      suspensionId: suspension.suspensionId,
      meterId: suspension.meterId,
      suspensionReason: suspension.reason, // FIX: Map ISuspension.reason to formControlName 'suspensionReason'
      startDate: formattedDateForInput, // Patch with YYYY-MM-DD format
      // Removed status from patchValue
      // Removed notes from patchValue
    });
    this.setFormControlState(true); // Enable form controls for editing
  }

  /**
   * Handles form submission for updating a suspension.
   * Dispatches NgRx action for update.
   */
  submitForm(): void {
    // Ensure all controls are enabled before submitting if the API expects them
    this.setFormControlState(true);

    if (this.suspensionForm.valid && this.isEditing) {
      const formValues = this.suspensionForm.getRawValue(); // Use getRawValue to include disabled fields like suspensionId

      // Construct the payload for updateSuspension, ensuring all ISuspension properties are present
      const payload: ISuspension = {
        ...this.selectedSuspension, // Start with existing data to preserve unchanged fields
        suspensionId: formValues.suspensionId,
        meterId: formValues.meterId,
        reason: formValues.suspensionReason, // FIX: Map formControlName 'suspensionReason' back to ISuspension.reason
        startDate: formValues.startDate,
        // Removed status from payload
        // Removed notes from payload
        updatedAt: new Date().toISOString() // Update updatedAt on save
      };

      this.store.dispatch(updateSuspension({ suspensionId: payload.suspensionId!, suspension: payload }));

      // Optionally, listen for success actions to reset form/hide edit section
      this.isSuspensionSaving$.pipe(
        filter(isSaving => !isSaving), // Wait until saving completes
        first(), // Take only the first emission after saving completes
        takeUntil(this.destroy$) // Use takeUntil for consistent unsubscription
      ).subscribe(() => {
        this.isEditing = false; // Hide edit form
        this.suspensionForm.reset(); // Reset form
        this.setFormControlState(false); // Disable form controls after submission
        this.loadSuspensionsData(); // Reload data to reflect changes
      });
    } else {
      // Mark all fields as touched to display validation errors
      this.suspensionForm.markAllAsTouched();
    }
  }

  /**
   * Cancels the editing process, resets the form, and hides the edit section.
   */
  cancel(): void {
    this.isEditing = false;
    this.suspensionForm.reset();
    this.setFormControlState(false); // Disable form controls when canceling
  }

  /**
   * Formats a date string into 'dd-MM-yyyy' format.
   * @param dateString The date string to format.
   * @returns The formatted date string.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // Removed getStatusLabel method
  // getStatusLabel(status: string): string {
  //   const option = this.statusOptions.find(opt => opt.value === status);
  //   // FIX: If option is not found, return the label for 'ACTIVE'
  //   return option ? option.label : this.statusOptions.find(opt => opt.value === 'ACTIVE')?.label || 'Activo';
  // }

  // Removed getStatusColor method
  // getStatusColor(status: string): string {
  //   switch (status.toUpperCase()) {
  //     case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  //     case 'INACTIVE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  //     case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  //     default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  //   }
  // }

  /**
   * Controls the enable/disable state of form controls.
   * @param isEnabled True to enable, false to disable.
   */
  private setFormControlState(isEnabled: boolean): void {
    const method = isEnabled ? "enable" : "disable";
    this.suspensionForm.controls["meterId"][method]();
    this.suspensionForm.controls["suspensionReason"][method](); // FIX: Use 'suspensionReason'
    this.suspensionForm.controls["startDate"][method]();
    // Removed status from setFormControlState
    // Removed notes from setFormControlState

    // suspensionId should always remain disabled as it's an identifier
    this.suspensionForm.controls["suspensionId"].disable();
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
    console.log('Paginated suspensions count:', this.paginatedSuspensions.length); // Debugging log
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, combineLatest, filter, first, takeUntil } from 'rxjs';
import { ICut } from 'src/app/models/cut'; // Assuming ICut interface is defined here
import { IAppState, listAllCuts, updateCut } from 'src/app/store';
import { selectCutIsLoading, selectCutIsSaving, selectSelectedCuts } from 'src/app/store/selectors/cut.selectors';

@Component({
  selector: 'app-list-cuts',
  templateUrl: './list-cuts.component.html',
  styleUrls: ['./list-cuts.component.css'] // Corrected styleUrl to styleUrls
})
export class ListCutsComponent implements OnInit, OnDestroy {
  cutForm: FormGroup;
  cutsList: ICut[] = []; // Raw list of cuts from the store
  cutsData: ICut[] = []; // Used to hold the raw cuts data for filtering and form patching
  filteredCuts: ICut[] = []; // Cuts filtered by search term
  cutColumns: { key: keyof ICut; label: string }[] = [];
  isEditing: boolean = false;
  selectedCut!: ICut; // The cut currently being edited

  isCutsLoading$: Observable<boolean>;
  isCutSaving$: Observable<boolean>;
  isLoading: boolean = true; // Overall loading state for the component

  private destroy$ = new Subject<void>();

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Number of items to display per page
  totalPages: number = 0;
  paginatedCuts: ICut[] = [];

  // Selection properties
  selectedCuts: ICut[] = []; // Array to hold currently selected cuts
  searchTerm: string = ''; // Current search term for filtering

  // Flag to enable/disable export button (can be dynamic based on data presence)
  enableExportButton: boolean = true;

  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    // Initialize the form with controls and validators
   this.cutForm = this.fb.group({
      // cutId is typically read-only, so disable it in the form
      cutId: new FormControl({ value: '', disabled: true }, Validators.required),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required], // Added endDate form control
      meterId: ['', Validators.required]
    });

    // Select loading and saving states from the NgRx store
    this.isCutsLoading$ = this.store.select(selectCutIsLoading);
    this.isCutSaving$ = this.store.select(selectCutIsSaving);

    // Define columns for the cuts table display
    this.cutColumns = [
      { key: 'cutId', label: 'Código de Corte' },
      { key: 'startDate', label: 'Data de Início' },
      { key: 'endDate', label: 'Data de Fim' }, // Added endDate column
      { key: 'meterId', label: 'Contador afectado' }
    ];
  }

  ngOnInit(): void {
    // Combine loading observables to manage a single isLoading state for the UI
    combineLatest([
      this.isCutsLoading$,
      this.isCutSaving$
    ]).pipe(takeUntil(this.destroy$)).subscribe(
      ([cutsLoading, cutSaving]) => {
        this.isLoading = cutsLoading || cutSaving;
      }
    );

    this.loadCuts();
  }

  /**
   * Dispatches action to load all cuts and subscribes to updates from the store.
   */
  private loadCuts(): void {
    this.store.dispatch(listAllCuts());
    this.store.pipe(select(selectSelectedCuts), takeUntil(this.destroy$)).subscribe(cuts => {
      if (cuts) {
        this.cutsList = cuts; // Store original cuts list
        this.cutsData = cuts; // cutsData now holds the original ICut objects
        this.filterCuts(this.searchTerm); // Apply initial filter and pagination
      }
    });
  }

  /**
   * Filters the cuts list based on a search term and recalculates pagination.
   * @param searchTerm The text to search for across cut properties.
   */
  filterCuts(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase();
    let tempFilteredCuts = this.cutsData;

    if (this.searchTerm) {
      tempFilteredCuts = tempFilteredCuts.filter(cut =>
        // Convert all values to string and lowercase for consistent searching
        Object.values(cut).some(value =>
          String(value).toLowerCase().includes(this.searchTerm)
        )
      );
    }

    this.filteredCuts = tempFilteredCuts;
    this.currentPage = 1; // Reset to first page on filter change
    this.calculatePagination();
  }

  /**
   * Sets the component into editing mode and populates the form with the selected cut's data.
   * Converts the startDate to YYYY-MM-DD format for the HTML date input.
   * @param cut The ICut object to be edited.
   */
  editCut(cut: ICut): void {
    this.isEditing = true;
    this.selectedCut = cut;

    
    // Convert the startDate to 'YYYY-MM-DD' format required by input type="date"
    let formattedStartDateForInput = '';
    if (cut.startDate) {
      const date = new Date(cut.startDate);
      // Ensure the date is valid before formatting
      if (!isNaN(date.getTime())) {
        formattedStartDateForInput = date.toISOString().split('T')[0];
      }
    }

    // Convert the endDate to 'YYYY-MM-DD' format required by input type="date"
    let formattedEndDateForInput = '';
    if (cut.endDate) { // Assuming ICut now has an endDate property
      const date = new Date(cut.endDate);
      if (!isNaN(date.getTime())) {
        formattedEndDateForInput = date.toISOString().split('T')[0];
      }
    }


    this.cutForm.patchValue({
      cutId: cut.cutId,
      startDate: formattedStartDateForInput, // Patch with YYYY-MM-DD format
      endDate: formattedEndDateForInput, // Patch with YYYY-MM-DD format
      meterId: cut.meterId
    });
  }

  /**
   * Cancels the editing process, resets the form, and hides the edit section.
   */
  cancel(): void {
    this.isEditing = false;
    this.cutForm.reset();
  }

  /**
   * Handles form submission for updating a cut.
   * Dispatches NgRx action for update.
   */
  submitForm(): void {
    if (this.cutForm.valid && this.isEditing) {
       const formValues = this.cutForm.getRawValue();

      // Format startDate and endDate to YYYY-MM-DDTHH:mm:ss
      const formattedStartDate = formValues.startDate ? `${formValues.startDate}T00:00:00` : null;
      const formattedEndDate = formValues.endDate ? `${formValues.endDate}T00:00:00` : null;

      const payload = {
        ...formValues,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };

      this.store.dispatch(updateCut({ cutId: this.selectedCut.cutId, cut: payload }));

      // Optionally, listen for success actions to reset form/hide edit section
      this.isCutSaving$.pipe(
        filter(isSaving => !isSaving), // Wait until saving completes
        first(), // Take only the first emission after saving completes
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.isEditing = false; // Hide edit form
        this.cutForm.reset(); // Reset form
        // In a real app, you'd listen for a success action specifically
        // and potentially show a success message.
      });
    } else {
      // Mark all fields as touched to display validation errors
      this.cutForm.markAllAsTouched();
    }
  }

  // --- Pagination Logic ---

  /**
   * Calculates total pages and updates the paginatedCuts array based on current page and items per page.
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCuts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCuts = this.filteredCuts.slice(startIndex, endIndex);
    this.selectedCuts = []; // Clear selection when page changes
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
   * Checks if all cuts on the current page are selected.
   * @returns True if all cuts on the current page are selected, false otherwise.
   */
  isAllSelected(): boolean {
    return this.paginatedCuts.length > 0 && this.paginatedCuts.every(cut => this.selectedCuts.includes(cut));
  }

  /**
   * Checks if some, but not all, cuts on the current page are selected.
   * Used for indeterminate checkbox state.
   * @returns True if some cuts are selected but not all, false otherwise.
   */
  isIndeterminate(): boolean {
    return this.selectedCuts.length > 0 && !this.isAllSelected();
  }

  /**
   * Toggles selection of all cuts on the current page.
   * If all are selected, deselects all. Otherwise, selects all.
   */
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedCuts = [];
    } else {
      this.selectedCuts = [...this.paginatedCuts];
    }
  }

  /**
   * Toggles the selection of a single cut.
   * @param cut The ICut object to toggle selection for.
   */
  toggleSelection(cut: ICut): void {
    const index = this.selectedCuts.indexOf(cut);
    if (index > -1) {
      this.selectedCuts.splice(index, 1); // Deselect
    } else {
      this.selectedCuts.push(cut); // Select
    }
  }

  /**
   * Placeholder method for deleting selected cuts.
   * In a real application, this would dispatch an NgRx action.
   */
  deleteSelected(): void {
    console.log('Deleting selected cuts:', this.selectedCuts);
    // TODO: Dispatch NgRx action to delete cuts
    // After successful deletion, refresh data or remove them from list
    this.selectedCuts = []; // Clear selection after action
  }

  /**
   * Placeholder method for exporting cut data to Excel.
   * In a real application, this would trigger a data export service.
   */
  exportExcel(): void {
    console.log('Exporting cuts to Excel');
    // TODO: Implement Excel export logic
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

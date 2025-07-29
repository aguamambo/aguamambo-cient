import { IZone } from 'src/app/models/zone';
import { combineLatest, filter, first, pipe, take, takeUntil } from 'rxjs';
import { formatDate } from '@angular/common'; // This import is not used in the current component logic.
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { GenericConfig } from 'src/app/core/config/generic.config'; // Assuming this provides generic configuration
import { IClient } from 'src/app/models/client'; // Using the updated IClient interface 
import { listAllClients, listAllContracts, listAllContractTypes, listAllZones, updateClient, updateContract } from 'src/app/store';
import { selectClientIsLoading, selectClientIsSaving, selectSelectedClient, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedContractType, selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedZone, selectSelectedZones } from 'src/app/store/selectors/zone.selectors';
import { IContractType } from 'src/app/models/contractType';
import { IOption } from 'src/app/models/option'; // Assuming IOption is { label: string; value: string; }
import { selectSelectedContract, selectSelectedContracts } from 'src/app/store/selectors/contract.selectors';
import { IContract } from 'src/app/models/contract';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-list-customers',
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.css'
})
export class ListCustomersComponent implements OnInit, OnDestroy {
  generalForm: FormGroup;
  isEditing: boolean = false;
  selectedClient!: IClient; // Will hold the client currently being edited
  zonesList: IZone[] = []; // Raw list of zones from the store
  zoneData: IOption[] = []; // Formatted list of zones for select dropdown
  contractTypeData: IOption[] = []; // Formatted list of contract types for select dropdown
  contractTypes!: IContractType[]; // Raw list of contract types from the store
  contractsList!: IContract[]; // Raw list of contracts from the store
  private destroy$ = new Subject<void>(); // Used to unsubscribe from observables on component destruction
  filteredClients: IClient[] = []; // Clients filtered by search term and zone
  clientsList: IClient[] = []; // Original list of clients (enriched with contract/zone details)
  clientColumns: { key: keyof IClient; label: string }[] = []; // Configuration for table columns
  isClientSaving$!: Observable<boolean>; // Observable for client saving state from NgRx store
  isClientLoading$!: Observable<boolean>; // Observable for client loading state from NgRx store

  // Pagination properties
  currentPage: number = 1; // Current page number for pagination
  itemsPerPage: number = 10; // Number of items to display per page
  totalPages: number = 0; // Total number of pages
  paginatedClients: IClient[] = [];

  // Selection properties for table rows
  selectedClients: IClient[] = []; // Array to hold currently selected clients
  searchTerm: string = ''; // Current search term for filtering clients
  selectedZoneId: string = ''; // Current selected zone ID for filtering clients

  // NgRx Selectors for data from the store
  getContractTypes$ = this.store.pipe(select(selectSelectedContractTypes));
  getContracts$ = this.store.pipe(select(selectSelectedContracts));
  getZones$ = this.store.pipe(select(selectSelectedZones));
  getClients$ = this.store.pipe(select(selectSelectedClients));


  constructor(private fb: FormBuilder, private store: Store, private generic: GenericConfig, private auth: AuthService) {
    // Initialize the Reactive Form with controls and validators
    this.generalForm = this.fb.group({
      // clientId is typically a read-only identifier
      clientId: new FormControl({ value: null, disabled: true }),
      name: new FormControl(null, Validators.required),
      // phoneNumber requires at least 9 digits
      phoneNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d{9,}$/)]),
      alternativeNumber: new FormControl(null),
      observation: new FormControl(null),
      address: new FormControl(null, Validators.required),
      // nuit requires exactly 9 digits
      nuit: new FormControl(null, [Validators.pattern(/^\d{9}$/)]),
      exemptFromFines: new FormControl(false),
      wantsReceiptSMS: new FormControl(false),
      // balance is a derived value from the contract, typically not directly editable
      balance: new FormControl({ value: 0, disabled: true }),
      wantsInvoiceSMS: new FormControl(false),
      contractTypeId: new FormControl(null, Validators.required),
      // contractStatus is a derived value from the contract, typically not directly editable
      contractStatus: new FormControl({ value: 0, disabled: true }),
      zoneId: new FormControl(null, Validators.required),
      // contractId is used to link to the specific contract for updates
      contractId: new FormControl(null),
    });

    // Select loading and saving states from the NgRx store
    this.isClientLoading$ = this.store.select(selectClientIsLoading);
    this.isClientSaving$ = this.store.select(selectClientIsSaving);

    // Define columns for the client table display
    this.clientColumns = [
      { key: 'clientId', label: 'Código' },
      { key: 'name', label: 'Nome' },
      { key: 'phoneNumber', label: 'Contacto' },
      { key: 'address', label: 'Endereço' },
      { key: 'nuit', label: 'NUIT' },
      { key: 'contractStatus', label: 'Estado do Contracto' }, // This will be mapped to a human-readable label
      { key: 'exemptFromFines', label: 'Isento de Multas' },
      { key: 'contractType', label: 'Tipo de Contacto' },
      { key: 'zone', label: 'Zona' },
      { key: 'balance', label: 'Saldo' },
    ];
  }

  ngOnInit(): void {
    this.getData();
  }

  /**
   * Dispatches actions to load all necessary data (clients, zones, contract types, contracts)
   * and subscribes to their combined changes to update the component's state.
   */
  getData() {
    this.store.dispatch(listAllClients());
    this.store.dispatch(listAllZones());
    this.store.dispatch(listAllContractTypes());
    this.store.dispatch(listAllContracts());

    combineLatest([
      this.getZones$,
      this.getContracts$,
      this.getContractTypes$,
      this.getClients$,
    ])
      .pipe(
        takeUntil(this.destroy$), // Unsubscribe when component is destroyed
        filter(([zones, contracts, contractTypes, clients]) =>
          // Ensure all data streams have emitted non-null/undefined values
          Boolean(zones && contracts && contractTypes && clients)
        )
      )
      .subscribe(([zones, contracts, contractTypes, clients]) => {
        // Assign fetched data to component properties
        this.zonesList = zones || [];
        this.contractsList = contracts || [];
        this.contractTypes = contractTypes || [];
        this.clientsList = clients || [];

        // Prepare zone data for the select dropdown
        if (zones) {
          this.zoneData = [
            { label: 'Todos', value: '' }, // Option to show all zones
            ...zones.map(zone => ({
              label: zone.designation,
              value: zone.zoneId
            }))
          ];
        }

        // Prepare contract type data for the select dropdown
        if (contractTypes) {
          this.contractTypeData = [
            { label: 'Seleccione...', value: '' }, // Add a "Select..." option
            ...contractTypes.map(contract => ({
              label: contract.designation,
              value: contract.contractTypeId
            }))
          ];
        }
        // Enrich client list with details from related data and then apply filters/pagination
        this.updateClientsListWithDetails();
        this.filterClients(this.searchTerm, this.selectedZoneId);
      });
  }

  /**
   * Returns a human-readable label for a given contract status number.
   * @param status The numerical contract status.
   * @returns The corresponding string label.
   */
  getContractStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Inativo';
      case 1: return 'Ativo';
      case 2: return 'Pendente';
      default: return 'Desconhecido';
    }
  }

  /**
   * Returns Tailwind CSS classes for coloring based on contract status.
   * @param status The numerical contract status.
   * @returns Tailwind CSS classes for background and text color.
   */
  getContractStatusColor(status: number): string {
    switch (status) {
      case 0: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  /**
   * Sets the component into editing mode and populates the form with the selected client's data.
   * @param client The IClient object to be edited.
   */
  editClient(client: IClient): void {
    this.isEditing = true;
    this.selectedClient = client; // Store the selected client

    console.log(this.selectedClient); // For debugging purposes

    this.generalForm.patchValue({
      clientId: client.clientId,
      name: client.name,
      phoneNumber: client.phoneNumber,           // Ensure these are patched if they exist in IClient
      address: client.address,
      nuit: client.nuit,
      exemptFromFines: client.exemptFromFines,
      wantsReceiptSMS: client.wantsReceiptSMS,     // Ensure these are patched if they exist in IClient
      wantsInvoiceSMS: client.wantsInvoiceSMS,     // Ensure these are patched if they exist in IClient
      balance: client.balance, // Patching derived values for display in form
      contractStatus: client.contractStatus, // Patch the numerical value directly
      zoneId: client.zoneId,
      contractTypeId: client.contractTypeId, // This is the crucial fix for the dropdown
      contractId: client.contractId // Essential for finding and updating the correct contract
    });
  }

  ngOnDestroy(): void {
    // Ensure all subscriptions are unsubscribed to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Filters non-numeric characters from an input element's value.
   * @param inputElement The HTMLInputElement to process.
   */
  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

  /**
   * Handles saving client and related contract data when the form is valid.
   * Dispatches NgRx actions for update.
   */
  saveClient(): void {
    if (this.generalForm.valid) {
      // Use getRawValue() to include values from disabled form controls
      const formValues = this.generalForm.getRawValue();

      // Prepare client payload based on the IClient interface
      const clientPayload: IClient = {
        clientId: formValues.clientId,
        name: formValues.name,
        phoneNumber: formValues.phoneNumber,
        address: formValues.address,
        nuit: formValues.nuit,
        exemptFromFines: formValues.exemptFromFines,
        zoneId: formValues.zoneId,
        balance: formValues.balance,
        contractStatus: formValues.contractStatus,
        wantsReceiptSMS: formValues.wantsReceiptSMS,
        wantsInvoiceSMS: formValues.wantsInvoiceSMS,
        contractTypeId: formValues.contractTypeId,
        contractId: formValues.contractId,
        contractType: formValues.contractType,
        zone: formValues.zone
      };

      // Dispatch action to update the client
      this.store.dispatch(updateClient({ clientId: clientPayload.clientId!, client: clientPayload }));

      // Find the original contract to check for changes before updating
      const originalContract = this.contractsList.find(contract => contract.contractId === formValues.contractId);

      if (originalContract) {
        // Prepare contract payload based on IContract interface
        const contractPayload: IContract = {
          contractId: formValues.contractId,
          contractTypeId: formValues.contractTypeId,
          balance: formValues.balance,
          contractStatus: formValues.contractStatus,
          clientId: originalContract.clientId, // Ensure clientId is part of contract payload
          // Add other necessary contract properties if they exist and are not changing
          // For example: startDate, endDate, etc.
          startDate: originalContract.startDate, // Keep original start/end date if not updated via form
          endDate: originalContract.endDate,
          meterId: originalContract.meterId
        };

        // Check if there are actual changes in the contract data to avoid unnecessary dispatches
        const hasChanges = Object.keys(contractPayload).some(
          key => (contractPayload as Record<string, any>)[key] !== (originalContract as Record<string, any>)[key]
        );

        if (hasChanges) {
          // Dispatch action to update the contract
          this.store.dispatch(updateContract({ contractId: contractPayload.contractId!, contract: contractPayload }));
        }
      }

      // Subscribe to the saving observable to reset the form after the save operation completes.
      // In a production app, you might listen for a specific success action from your effects.
      this.isClientSaving$.pipe(
        filter(isSaving => !isSaving), // Wait until isClientSaving$ becomes false (indicating completion)
        first(), // Take only the first emission after completion
        takeUntil(this.destroy$) // Unsubscribe
      ).subscribe(() => {
        this.cancelEdit(); // Reset form and hide edit section after successful save
        // You might also add a success toast notification here
      });
    }
  }

  /**
   * Resets the form and hides the edit client section.
   */
  cancelEdit(): void {
    this.isEditing = false;
    this.generalForm.reset();
  }

  // --- Pagination Logic ---

  /**
   * Calculates total pages and updates the paginatedClients array based on current page and items per page.
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClients = this.filteredClients.slice(startIndex, endIndex);
    this.selectedClients = []; // Clear selection when page changes
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
   * Checks if all clients on the current page are selected.
   * @returns True if all clients on the current page are selected, false otherwise.
   */
  isAllSelected(): boolean {
    return this.paginatedClients.length > 0 && this.paginatedClients.every(client => this.selectedClients.includes(client));
  }

  /**
   * Checks if some, but not all, clients on the current page are selected.
   * Used for indeterminate checkbox state.
   * @returns True if some clients are selected but not all, false otherwise.
   */
  isIndeterminate(): boolean {
    return this.selectedClients.length > 0 && !this.isAllSelected();
  }

  /**
   * Toggles selection of all clients on the current page.
   * If all are selected, deselects all. Otherwise, selects all.
   */
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedClients = [];
    } else {
      this.selectedClients = [...this.paginatedClients];
    }
  }

  /**
   * Toggles the selection of a single client.
   * @param client The IClient object to toggle selection for.
   */
  toggleSelection(client: IClient): void {
    const index = this.selectedClients.indexOf(client);
    if (index > -1) {
      this.selectedClients.splice(index, 1); // Deselect
    } else {
      this.selectedClients.push(client); // Select
    }
  }

  /**
   * Placeholder method for deleting selected clients.
   * In a real application, this would dispatch an NgRx action.
   */
  deleteSelected(): void {
    console.log('Deleting selected clients:', this.selectedClients);
    // TODO: Dispatch NgRx action to delete clients
    // After successful deletion, refresh data or remove them from list
    this.selectedClients = []; // Clear selection after action
  }

  /**
   * Placeholder method for exporting client data to Excel.
   * In a real application, this would trigger a data export service.
   */
  exportExcel(): void {
    console.log('Exporting clients to Excel');
    // TODO: Implement Excel export logic
  }

  /**
   * Enriches the clientsList with details like zone designation and contract type designation
   * by mapping related data from zonesList, contractTypes, and contractsList.
   */
  private updateClientsListWithDetails() {
    // Ensure all necessary lists are populated before attempting to enrich data
    if (
      this.clientsList &&
      this.zonesList &&
      this.contractTypes &&
      this.contractsList &&
      this.clientsList.length > 0 &&
      this.zonesList.length > 0 &&
      this.contractTypes.length > 0 &&
      this.contractsList.length > 0
    ) {
      // Create maps for efficient lookup of designations by ID
      const zoneMap = new Map(this.zonesList.map(z => [z.zoneId, z.designation]));
      const contractTypeMap = new Map(this.contractTypes.map(ct => [ct.contractTypeId, ct.designation]));

      // Map over clients to add derived properties
      this.clientsList = this.clientsList.map(client => {
        // Find the most relevant contract for the client.
        // Assuming a client has one primary contract or the first one found is sufficient.
        const clientContract = this.contractsList.find(contract => contract.clientId === client.clientId);

        const clientContractType = clientContract ? this.contractTypes.find(contractType => contractType.contractTypeId === clientContract.contractTypeId) : undefined;
        const clientZone = this.zonesList.find(zone => zone.zoneId === client.zoneId);


        return {
          ...client,
          contractStatus: clientContract?.contractStatus ?? 0, // Default to 0 if not found
          balance: clientContract?.balance ?? 0, // Default to 0 if not found
          contractId: clientContract?.contractId ?? '', // Use undefined for optional properties not present
          contractTypeId: clientContract?.contractTypeId ?? '', // FIX: Correctly map contractTypeId
          contractType: clientContractType?.designation ?? '', // Default to empty string if not found
          zoneId: clientZone?.zoneId ?? '', // Default to undefined if not found
          zone: clientZone?.designation ?? '' // FIX: Use designation for zone name, default to empty string
        };
      });

      // Re-apply filters and pagination after the client list has been enriched
      this.filterClients(this.searchTerm, this.selectedZoneId);
    }
  }

  /**
   * Filters the clientsList based on a search term and selected zone ID,
   * then recalculates pagination.
   * @param searchTerm The text to search for across client properties.
   * @param zoneId The ID of the zone to filter by (optional, defaults to current selectedZoneId).
   */
  filterClients(searchTerm: string, zoneId: string = this.selectedZoneId): void {
    this.searchTerm = searchTerm.toLowerCase();
    this.selectedZoneId = zoneId;

    let tempFilteredClients = this.clientsList;

    // Apply search term filter
    if (this.searchTerm) {
      tempFilteredClients = tempFilteredClients.filter(client =>
        // Check if any string value in the client object includes the search term
        Object.values(client).some(value =>
          String(value).toLowerCase().includes(this.searchTerm)
        )
      );
    }

    // Apply zone filter
    if (this.selectedZoneId) {
      tempFilteredClients = tempFilteredClients.filter(client =>
        client.zoneId === this.selectedZoneId
      );
    }

    this.filteredClients = tempFilteredClients;
    this.currentPage = 1; // Reset to the first page whenever filters change
    this.calculatePagination(); // Recalculate pagination based on the new filtered list
  }

  // The following methods were previously in use but are now handled directly
  // within the HTML template's native select elements using formControlName or (change) events.
  // They are commented out to reflect the updated approach.
  // onZoneSelect(event: { value: string; label: string }): void {
  //   this.generalForm.get('zoneId')?.setValue(event.value);
  // }

  // onContractTypeSelect(event: { value: string; label: string }): void {
  //   this.generalForm.get('contractTypeId')?.setValue(event.value);
  // }
}

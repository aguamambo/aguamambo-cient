// invoice.reducer.ts
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IInvoice } from '../../models/invoice'; // Adjust the import to match your model's path
import { Action, createReducer, on } from '@ngrx/store';
import {
  getInvoice,
  getInvoiceSuccess,
  getInvoiceFailure,
  listAllInvoices,
  listAllInvoicesSuccess,
  listAllInvoicesFailure,
  createInvoice,
  createInvoiceSuccess,
  createInvoiceFailure,
  updateInvoice,
  updateInvoiceSuccess,
  updateInvoiceFailure,
  deleteInvoice,
  deleteInvoiceSuccess,
  deleteInvoiceFailure,
  loadInvoicesCount,
  loadInvoicesCountSuccess,
  loadInvoicesCountFailure,
  getInvoiceByReadingId,
  getInvoiceByReadingIdFailure,
  getInvoiceByReadingIdSuccess,
  getWaterBillByReadingIdSuccess,
  getWaterBillByReadingId,
  getWaterBillByReadingIdFailure,
  getInvoiceByClientId,
  getInvoiceByClientIdFailure,
  getInvoiceByClientIdSuccess,
  getInvoiceByStatus,
  getInvoiceByStatusFailure,
  getInvoiceByStatusSuccess,
  getInvoiceByMeter,
  getInvoiceByMeterFailure,
  getInvoiceByMeterSuccess,
  resetInvoiceActions,
  getWaterBillsByZoneId,
  getWaterBillsByZoneIdSuccess,
  getWaterBillsByZoneIdFailure,
  getInvoiceByZoneId,
  getInvoiceByZoneIdFailure,
  getInvoiceByZoneIdSuccess
} from '../actions/invoice.actions';
import { Update } from '@ngrx/entity';
import { IFile } from 'src/app/models/file';

export interface IInvoiceState extends EntityState<IInvoice> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedInvoice: IInvoice | null;
  selectedInvoices: IInvoice[] | null;
  selectedWaterBillFile: IFile | null; 
  selectedWaterBillsFile: IFile | null; 
  invoiceCount: number;
}

export const adapter: EntityAdapter<IInvoice> = createEntityAdapter<IInvoice>();
export const initialState: IInvoiceState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedInvoice: null,
  selectedInvoices: null,
  selectedWaterBillFile: null,
  selectedWaterBillsFile: null,
  invoiceCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get invoice by ID
  on(getInvoice, (state) => ({ ...state, isLoading: true })),
  on(getInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    selectedInvoice: invoice,
    isLoading: false,
  })),
  on(getInvoiceFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Get invoice by ID
  on(getInvoiceByReadingId, (state) => ({ ...state, isLoading: true })),
  on(getInvoiceByReadingIdSuccess, (state, { invoice }) => ({
    ...state,
    selectedInvoice: invoice,
    isLoading: false,
  })),
  on(getInvoiceByReadingIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Get invoice by ID
  on(getInvoiceByClientId, (state) => ({ ...state, isLoading: true })),
  on(getInvoiceByClientIdSuccess, (state, { invoice }) => ({
    ...state,
    selectedInvoices: invoice,
    isLoading: false,
  })),
  on(getInvoiceByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  on(getInvoiceByStatus, (state) => ({ ...state, isLoading: true })),
  on(getInvoiceByStatusSuccess, (state, { invoice }) => ({
    ...state,
    selectedInvoices: invoice,
    isLoading: false,
  })),
  on(getInvoiceByStatusFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  on(getInvoiceByMeter, (state) => ({ ...state, isLoading: true })),
  on(getInvoiceByMeterSuccess, (state, { invoice }) => ({
    ...state,
    selectedInvoices: invoice,
    isLoading: false,
  })),
  on(getInvoiceByMeterFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  on(getWaterBillByReadingId, (state) => ({ ...state, isLoading: true })),

  on(getWaterBillByReadingIdSuccess, (state, { payload }) => {
    return {
      ...state,
      selectedWaterBillFile: payload,
      isLoading: false
    };
  }),
  on(getWaterBillByReadingIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  on(getWaterBillsByZoneId, (state) => ({ ...state, isLoading: true })),

  on(getWaterBillsByZoneIdSuccess, (state, { payload }) => {
    return {
      ...state,
      selectedWaterBillsFile: payload,
      isLoading: false
    };
  }),
  on(getWaterBillsByZoneIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // List all invoices
  on(listAllInvoices, (state) => ({ ...state, isLoading: true })),
  on(listAllInvoicesSuccess, (state, { invoices }) =>
  ({
    ...state,
    selectedInvoices: invoices,
    isLoading: false
  })
  ),
  on(listAllInvoicesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

 on(getInvoiceByZoneId, (state) => ({ ...state, isLoading: true })),
  on(getInvoiceByZoneIdSuccess, (state, { invoices }) =>
  ({
    ...state,
    selectedInvoices: invoices,
    isLoading: false
  })
  ),
  on(getInvoiceByZoneIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Create invoice
  on(createInvoice, (state) => ({ ...state, isSaving: true })),
  on(createInvoiceSuccess, (state, { invoice }) =>
    ({ ...state, isSaving: false, selectedInvoice: invoice, successMessage: 'Invoice created successfully!' })
  ),
  on(createInvoiceFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error.error,
  })),

  // Update invoice
  on(updateInvoice, (state) => ({ ...state, isSaving: true })),
  on(updateInvoiceSuccess, (state, { invoice }) =>
  (
    { ...state, isSaving: false, selectedInvoice: invoice, successMessage: 'Invoice updated successfully!' }
  )
  ),
  on(updateInvoiceFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error.error,
  })),

  // Delete invoice
  on(deleteInvoice, (state) => ({ ...state, isLoading: true })),
  on(deleteInvoiceSuccess, (state, { invoiceId }) =>
    ({ ...state, isLoading: false, successMessage: 'Invoice deleted successfully!' })
  ),
  on(deleteInvoiceFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Load invoice count
  on(loadInvoicesCount, (state) => ({ ...state, isLoading: true })),
  on(loadInvoicesCountSuccess, (state, { count }) => ({
    ...state,
    invoiceCount: count,
    isLoading: false,
  })),
  on(loadInvoicesCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),
  
  on(resetInvoiceActions, () => initialState)
);

export function invoiceReducer(
  state: IInvoiceState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll
} = adapter.getSelectors();

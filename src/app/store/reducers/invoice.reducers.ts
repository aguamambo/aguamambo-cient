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
  getInvoiceByReadingIdSuccess
} from '../actions/invoice.actions';
import { Update } from '@ngrx/entity';

export interface IInvoiceState extends EntityState<IInvoice> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedInvoice: IInvoice | null;
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
    errorMessage: error,
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
    errorMessage: error,
  })),

  // List all invoices
  on(listAllInvoices, (state) => ({ ...state, isLoading: true })),
  on(listAllInvoicesSuccess, (state, { invoices }) =>
    adapter.setAll(invoices, { ...state, isLoading: false })
  ),
  on(listAllInvoicesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create invoice
  on(createInvoice, (state) => ({ ...state, isSaving: true })),
  on(createInvoiceSuccess, (state, { invoice }) =>
    adapter.addOne(invoice, { ...state, isSaving: false, successMessage: 'Invoice created successfully!' })
  ),
  on(createInvoiceFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update invoice
  on(updateInvoice, (state) => ({ ...state, isSaving: true })),
  on(updateInvoiceSuccess, (state, { invoice }) =>
    adapter.updateOne(
      { id: invoice.invoiceId, changes: invoice },
      { ...state, isSaving: false, successMessage: 'Invoice updated successfully!' }
    )
  ),
  on(updateInvoiceFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete invoice
  on(deleteInvoice, (state) => ({ ...state, isLoading: true })),
  on(deleteInvoiceSuccess, (state, { invoiceId }) =>
    adapter.removeOne(invoiceId, { ...state, isLoading: false, successMessage: 'Invoice deleted successfully!' })
  ),
  on(deleteInvoiceFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
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
    errorMessage: error,
  }))
);

export function invoiceReducer(
  state: IInvoiceState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllInvoices,
  selectEntities: selectInvoiceEntities,
  selectIds: selectInvoiceIds,
  selectTotal: selectTotalInvoices,
} = adapter.getSelectors();

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IInvoiceState } from '../reducers/invoice.reducers';

export const selectInvoiceState = createFeatureSelector<IInvoiceState>('invoice');

export const selectSelectedInvoices = createSelector(
  selectInvoiceState,
  (state) => state.selectedInvoice
);

export const selectSelectedInvoice = createSelector(
  selectInvoiceState,
  (state) => state.selectedInvoice
);

export const selectInvoiceIsLoading = createSelector(
  selectInvoiceState,
  (state) => state.isLoading
);

export const selectInvoiceIsSaving = createSelector(
  selectInvoiceState,
  (state) => state.isSaving
);

export const selectInvoiceErrorMessage = createSelector(
  selectInvoiceState,
  (state) => state.errorMessage
);

export const selectInvoiceSuccessMessage = createSelector(
  selectInvoiceState,
  (state) => state.successMessage
);


export const selectInvoiceCount = createSelector(
  selectInvoiceState,
  (state) => state.invoiceCount
);

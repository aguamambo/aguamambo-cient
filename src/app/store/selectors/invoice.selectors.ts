import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IInvoiceState } from '../reducers/invoice.reducers';

export const selectInvoiceState = createFeatureSelector<IInvoiceState>('invoice');

export const selectSelectedInvoices = createSelector(
  selectInvoiceState,
  (state) => state.selectedInvoices
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

export const selectInvoiceError = createSelector(
  selectInvoiceState,
  (state) => state.invoiceError
);

export const selectSelectedWaterBill = createSelector(
  selectInvoiceState,
  (state) => state.selectedWaterBillFile
);

export const selectSelectedWaterBills = createSelector(
  selectInvoiceState,
  (state) => state.selectedWaterBillsFile
);

export const selectInvoiceSuccessMessage = createSelector(
  selectInvoiceState,
  (state) => state.successMessage
);


export const selectInvoiceCount = createSelector(
  selectInvoiceState,
  (state) => state.invoiceCount
);

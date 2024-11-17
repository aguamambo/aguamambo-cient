import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IReceiptState } from '../reducers/receipt.reducers';

export const selectReceiptState = createFeatureSelector<IReceiptState>('receipt');

export const selectSelectedReceipts = createSelector(
  selectReceiptState,
  (state) => state.selectedReceipts
);

export const selectSelectedReceipt = createSelector(
  selectReceiptState,
  (state) => state.selectedReceipt
);

export const selectPaymentMethods = createSelector(
  selectReceiptState,
  (state) => state.selectedPaymentMethods
);

export const selectReceiptIsLoading = createSelector(
  selectReceiptState,
  (state) => state.isLoading
);

export const selectReceiptIsSaving = createSelector(
  selectReceiptState,
  (state) => state.isSaving
);

export const selectReceiptErrorMessage = createSelector(
  selectReceiptState,
  (state) => state.errorMessage
);

export const selectReceiptSuccessMessage = createSelector(
  selectReceiptState,
  (state) => state.successMessage
);

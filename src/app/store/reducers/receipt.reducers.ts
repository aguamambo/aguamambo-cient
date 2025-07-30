import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IReceipt } from '../../models/receipt';
import { Action, createReducer, on } from '@ngrx/store';
import {
  getReceipt,
  getReceiptSuccess,
  getReceiptFailure,
  listAllReceipts,
  listAllReceiptsSuccess,
  listAllReceiptsFailure,
  createReceipt,
  createReceiptSuccess,
  createReceiptFailure,
  updateReceipt,
  updateReceiptSuccess,
  updateReceiptFailure,
  deleteReceipt,
  deleteReceiptSuccess,
  deleteReceiptFailure,
  loadReceiptsCount,
  loadReceiptsCountSuccess,
  loadReceiptsCountFailure,
  getReceiptByClientId,
  getReceiptByClientIdFailure,
  getReceiptByClientIdSuccess,
  getReceiptPaymentMethods,
  getReceiptPaymentMethodsFailure,
  getReceiptPaymentMethodsSuccess,
  getReceiptFile,
  getReceiptFileFailure,
  getReceiptFileSuccess,
  resetReceiptActions,
  clearReceiptFile,
} from '../actions/receipt.actions';
import { IFile } from 'src/app/models/file';

export interface IReceiptState extends EntityState<IReceipt> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  selectedFile: IFile | null;
  error: any;
  selectedReceipt: IReceipt | null;
  selectedReceipts: IReceipt[] | null;
  selectedPaymentMethods: string[] | null;
  receiptCount: number;
}

export const adapter: EntityAdapter<IReceipt> = createEntityAdapter<IReceipt>();

export const initialState: IReceiptState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  selectedFile: null,
  error: null,
  selectedReceipt: null,
  selectedReceipts: null,
  selectedPaymentMethods: null,
  receiptCount: 0,
});

const reducer = createReducer(
  initialState,

  on(clearReceiptFile, (state) => ({
    ...state,
    selectedFile: null
  })),
  
  // Get receipt by ID
  on(getReceipt, (state) => ({ ...state, isLoading: true })),
  on(getReceiptSuccess, (state, { receipt }) => ({
    ...state,
    selectedReceipt: receipt,
    isLoading: false,
  })),
  on(getReceiptFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Get receipt by ID
  on(getReceiptPaymentMethods, (state) => ({ ...state, isLoading: true })),
  on(getReceiptPaymentMethodsSuccess, (state, { payload }) => ({
    ...state,
    selectedPaymentMethods: payload,
    isLoading: false,
  })),
  on(getReceiptPaymentMethodsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),
  // Get receipt by ID
  on(getReceiptFile, (state) => ({ ...state, isLoading: true })),
  on(getReceiptFileSuccess, (state, { payload }) => ({
    ...state,
    selectedFile: payload,
    isLoading: false,
  })),
  on(getReceiptFileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Get receipt by ID
  on(getReceiptByClientId, (state) => ({ ...state, isLoading: true })),
  on(getReceiptByClientIdSuccess, (state, { receipts }) => ({
    ...state,
    selectedReceipts: receipts,
    isLoading: false,
  })),
  on(getReceiptByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // List all receipts
  on(listAllReceipts, (state) => ({ ...state, isLoading: true })),
  on(listAllReceiptsSuccess, (state, { receipts }) =>
  ({
    ...state,
    selectedReceipts: receipts,
    isLoading: false
  })),
  on(listAllReceiptsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Create receipt
  on(createReceipt, (state) => ({ ...state, isSaving: true })),
  on(createReceiptSuccess, (state, { receipt }) =>
    ({ ...state, isSaving: false, selectedReceipt: receipt, successMessage: 'Receipt created successfully!' })
  ),
  on(createReceiptFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error.error,
  })),

  // Update receipt
  on(updateReceipt, (state) => ({ ...state, isSaving: true })),
  on(updateReceiptSuccess, (state, { receipt }) =>
  (
    { ...state, isSaving: false, selectedReceipt: receipt, successMessage: 'Receipt updated successfully!' }
  )
  ),
  on(updateReceiptFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error.error,
  })),

  // Delete receipt
  on(deleteReceipt, (state) => ({ ...state, isLoading: true })),
  on(deleteReceiptSuccess, (state, { receiptId }) =>
    adapter.removeOne(receiptId, { ...state, isLoading: false, successMessage: 'Receipt deleted successfully!' })
  ),
  on(deleteReceiptFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Load receipts count
  on(loadReceiptsCount, (state) => ({ ...state, isLoading: true })),
  on(loadReceiptsCountSuccess, (state, { count }) => ({
    ...state,
    receiptCount: count,
    isLoading: false,
  })),
  on(loadReceiptsCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  on(resetReceiptActions, () => initialState)
);

export function receiptReducer(
  state: IReceiptState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll
} = adapter.getSelectors();

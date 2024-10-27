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
} from '../actions/receipt.actions';
import { Update } from '@ngrx/entity';

export interface IReceiptState extends EntityState<IReceipt> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedReceipt: IReceipt | null;
  selectedReceipts: IReceipt[] | null;
  receiptCount: number;
}

export const adapter: EntityAdapter<IReceipt> = createEntityAdapter<IReceipt>();

export const initialState: IReceiptState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedReceipt: null,
  selectedReceipts: null,
  receiptCount: 0,
});

const reducer = createReducer(
  initialState,

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
    errorMessage: error,
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
    errorMessage: error,
  })),

  // List all receipts
  on(listAllReceipts, (state) => ({ ...state, isLoading: true })),
  on(listAllReceiptsSuccess, (state, { receipts }) =>
    ( { 
      ...state,
      selectedReceipts: receipts, 
      isLoading: false })),
  on(listAllReceiptsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create receipt
  on(createReceipt, (state) => ({ ...state, isSaving: true })),
  on(createReceiptSuccess, (state, { receipt }) =>
    adapter.addOne(receipt, { ...state, isSaving: false, successMessage: 'Receipt created successfully!' })
  ),
  on(createReceiptFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update receipt
  on(updateReceipt, (state) => ({ ...state, isSaving: true })),
  on(updateReceiptSuccess, (state, { receipt }) =>
    adapter.updateOne(
      { id: receipt.receiptID, changes: receipt },
      { ...state, isSaving: false, successMessage: 'Receipt updated successfully!' }
    )
  ),
  on(updateReceiptFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete receipt
  on(deleteReceipt, (state) => ({ ...state, isLoading: true })),
  on(deleteReceiptSuccess, (state, { receiptId }) =>
    adapter.removeOne(receiptId, { ...state, isLoading: false, successMessage: 'Receipt deleted successfully!' })
  ),
  on(deleteReceiptFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
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
    errorMessage: error,
  })),
);

export function receiptReducer(
  state: IReceiptState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllReceipts,
  selectEntities: selectReceiptEntities,
  selectIds: selectReceiptIds,
  selectTotal: selectTotalReceipts,
} = adapter.getSelectors();

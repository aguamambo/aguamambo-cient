import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IReceipt } from 'src/app/models/receipt';

// GET receipts/{id}
export const getReceipt = createAction(
  '[Receipt] Load Receipt',
  props<{ receiptId: string }>()
);

export const getReceiptSuccess = createAction(
  '[Receipt] Load Receipt Success',
  props<{ receipt: IReceipt }>()
);

export const getReceiptFailure = createAction(
  '[Receipt] Load Receipt Failure',
  props<{ error: any }>()
);

// GET receipts/{id}
export const getReceiptByClientId = createAction(
  '[Receipt] Load Receipt',
  props<{ clientId: string }>()
);

export const getReceiptByClientIdSuccess = createAction(
  '[Receipt] Load Receipt Success',
  props<{ receipts: IReceipt[] }>()
);

export const getReceiptByClientIdFailure = createAction(
  '[Receipt] Load Receipt Failure',
  props<{ error: any }>()
);

// GET /api/v1/receipts
export const listAllReceipts = createAction(
  '[Receipt] Load Receipts'
);

export const listAllReceiptsSuccess = createAction(
  '[Receipt] Load Receipts Success',
  props<{ receipts: IReceipt[] }>()
);

export const listAllReceiptsFailure = createAction(
  '[Receipt] Load Receipts Failure',
  props<{ error: any }>()
);

// POST /api/v1/receipts
export const createReceipt = createAction(
  '[Receipt] Create Receipt',
  props<{ receipt: IReceipt }>()
);

export const createReceiptSuccess = createAction(
  '[Receipt] Create Receipt Success',
  props<{ receipt: IReceipt }>()
);

export const createReceiptFailure = createAction(
  '[Receipt] Create Receipt Failure',
  props<{ error: any }>()
);

// PUT /api/v1/receipts/{id}
export const updateReceipt = createAction(
  '[Receipt] Update Receipt',
  props<{ receiptId: string, receipt: IReceipt }>()
);

export const updateReceiptSuccess = createAction(
  '[Receipt] Update Receipt Success',
  props<{ receipt: IReceipt }>()
);

export const updateReceiptFailure = createAction(
  '[Receipt] Update Receipt Failure',
  props<{ error: any }>()
);

// DELETE /api/v1/receipts/{id}
export const deleteReceipt = createAction(
  '[Receipt] Delete Receipt',
  props<{ receiptId: string }>()
);

export const deleteReceiptSuccess = createAction(
  '[Receipt] Delete Receipt Success',
  props<{ receiptId: string }>()
);

export const deleteReceiptFailure = createAction(
  '[Receipt] Delete Receipt Failure',
  props<{ error: any }>()
);

// GET /api/v1/receipts/count
export const loadReceiptsCount = createAction(
  '[Receipt] Load Receipts Count'
);

export const loadReceiptsCountSuccess = createAction(
  '[Receipt] Load Receipts Count Success',
  props<{ count: number }>()
);

export const loadReceiptsCountFailure = createAction(
  '[Receipt] Load Receipts Count Failure',
  props<{ error: any }>()
);
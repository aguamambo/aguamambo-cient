import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IReceipt } from "src/app/models/receipt";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getReceipt, getReceiptSuccess, getReceiptFailure, listAllReceipts, listAllReceiptsSuccess, listAllReceiptsFailure, createReceipt, createReceiptSuccess, createReceiptFailure, updateReceipt, updateReceiptSuccess, updateReceiptFailure, deleteReceipt, deleteReceiptSuccess, deleteReceiptFailure, loadReceiptsCount, loadReceiptsCountSuccess, loadReceiptsCountFailure, getReceiptByClientId, getReceiptByClientIdFailure, getReceiptByClientIdSuccess, getReceiptPaymentMethods, getReceiptPaymentMethodsFailure, getReceiptPaymentMethodsSuccess, getReceiptFile, getReceiptFileFailure, getReceiptFileSuccess } from "../actions";
import { IFile } from "src/app/models/file";

@Injectable()
export class ReceiptEffects {
  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private errorMessage: ErrorMessageService
  ) {}

  getReceipt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReceipt),
      exhaustMap(action =>
        this.apiService.get<IReceipt>(`/receipt/${action.receiptId}`).pipe(
          map(receipt => getReceiptSuccess({ receipt })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getReceiptFailure({ error }));
          })
        )
      )
    )
  );

  getReceiptPaymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReceiptPaymentMethods),
      exhaustMap(action =>
        this.apiService.get<string[]>(`/receipt/payment-methods`).pipe(
          map(paymentMethods => getReceiptPaymentMethodsSuccess({ payload: paymentMethods })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getReceiptPaymentMethodsFailure({ error }));
          })
        )
      )
    )
  );

  getReceiptFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReceiptFile),
      exhaustMap(action =>
        this.apiService.get<IFile>(`/receipt/file/${action.receiptId}`).pipe(
          map(file => getReceiptFileSuccess({ payload: file })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getReceiptFileFailure({ error }));
          })
        )
      )
    )
  );

  getReceiptByClientId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReceiptByClientId),
      exhaustMap(action =>
        this.apiService.get<IReceipt[]>(`/receipt/${action.clientId}`).pipe(
          map(receipts => getReceiptByClientIdSuccess({ receipts: receipts })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getReceiptByClientIdFailure({ error }));
          })
        )
      )
    )
  );

  listAllReceipts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listAllReceipts),
      exhaustMap(() =>
        this.apiService.get<IReceipt[]>('/receipt').pipe(
          map(receipts => listAllReceiptsSuccess({ receipts })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(listAllReceiptsFailure({ error }));
          })
        )
      )
    )
  );

  createReceipt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createReceipt),
      exhaustMap(action =>
        this.apiService.post<IReceipt>('/receipt', action.receipt).pipe(
          map(receipt => createReceiptSuccess({ receipt })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(createReceiptFailure({ error }));
          })
        )
      )
    )
  );

  updateReceipt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateReceipt),
      exhaustMap(action =>
        this.apiService.put<IReceipt>(`/receipt/${action.receiptId}`, action.receipt).pipe(
          map(receipt => updateReceiptSuccess({ receipt })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(updateReceiptFailure({ error }));
          })
        )
      )
    )
  );

  deleteReceipt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteReceipt),
      exhaustMap(action =>
        this.apiService.delete(`/receipt/${action.receiptId}`).pipe(
          map(() => deleteReceiptSuccess({ receiptId: action.receiptId })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(deleteReceiptFailure({ error }));
          })
        )
      )
    )
  );

  loadReceiptsCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadReceiptsCount),
      exhaustMap(() =>
        this.apiService.get<number>('/receipt/count').pipe(
          map(count => loadReceiptsCountSuccess({ count })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(loadReceiptsCountFailure({ error }));
          })
        )
      )
    )
  );

  refreshListAfterCreateOrUpdate$ = createEffect(() =>
    this.actions$.pipe(
        ofType(createReceiptSuccess, updateReceiptSuccess),
        map(() => listAllReceipts())
    )
);
}
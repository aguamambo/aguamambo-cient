import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of, tap } from "rxjs";
import { IReading } from "src/app/models/reading";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getReading, getReadingSuccess, getReadingFailure, listAllReadings, listAllReadingsSuccess, listAllReadingsFailure, createReading, createReadingSuccess, createReadingFailure, updateReading, updateReadingSuccess, updateReadingFailure, deleteReading, deleteReadingSuccess, deleteReadingFailure, getLastReadingByMeter, getLastReadingByMeterSuccess, getLastReadingByMeterFailure, loadReadingsCount, loadReadingsCountSuccess, loadReadingsCountFailure, getLastReadingByClient, getLastReadingByClientSuccess, getLastReadingByClientFailure, getReadingByClientId, getReadingByClientIdFailure, getReadingByClientIdSuccess, getReadingByMeterId, getReadingByMeterIdFailure, getReadingByMeterIdSuccess } from "../actions";
import { Router } from "@angular/router";
import { PdfService } from "src/app/services/pdf.service";

@Injectable()
export class ReadingEffects {
  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private pdfFile: PdfService,
    private errorMessage: ErrorMessageService
  ) { }

  getReading$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReading),
      exhaustMap(action =>
        this.apiService.get<IReading>(`/reading/${action.readingId}`).pipe(
          map(reading => getReadingSuccess({ reading })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getReadingFailure({ error }));
          })
        )
      )
    )
  );

  getReadingByMeterId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReadingByMeterId),
      exhaustMap(action =>
        this.apiService.get<IReading[]>(`/reading/by-meter/${action.meterId}`).pipe(
          map(readings => getReadingByMeterIdSuccess({ readings: readings })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getReadingByMeterIdFailure({ error }));
          })
        )
      )
    )
  );

  getReadingByClientId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        getReadingByClientId),
      exhaustMap(action =>
        this.apiService.get<IReading[]>(`/reading/by-client/${action.clientId}`).pipe(
          map(readings => getReadingByClientIdSuccess({ readings: readings })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getReadingByClientIdFailure({ error }));
          })
        )
      )
    )
  );

  listAllReadings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listAllReadings),
      exhaustMap(() =>
        this.apiService.get<IReading[]>('/reading').pipe(
          map(readings => listAllReadingsSuccess({ readings })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(listAllReadingsFailure({ error }));
          })
        )
      )
    )
  );

  createReading$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createReading),
      exhaustMap(action =>
        this.apiService.post<IReading>('/reading', action.reading).pipe(  
          map(reading => createReadingSuccess({reading: reading})),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(createReadingFailure({ error: error, statusCode: error.status }));
          })
        )
      )
    )
  );

//   createReadingSuccess$ = createEffect(
//     () =>
//         this.actions$.pipe(
//             ofType(createReadingSuccess),
//             map((action) => action.reading),
//             tap((result) => { 
//              this.apiService.get(`/invoice/waterBill/${result.readingId}`)  
              
//             })
//         ),
//     { dispatch: false }
// );

  updateReading$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateReading),
      exhaustMap(action =>
        this.apiService.put<IReading>(`/reading/${action.readingId}`, action.reading).pipe(
          map(reading => updateReadingSuccess({ reading })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(updateReadingFailure({ error }));
          })
        )
      )
    )
  );

  deleteReading$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteReading),
      exhaustMap(action =>
        this.apiService.delete(`/reading/${action.readingId}`).pipe(
          map(() => deleteReadingSuccess({ readingId: action.readingId })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(deleteReadingFailure({ error }));
          })
        )
      )
    )
  );

  getLastReadingByMeter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getLastReadingByMeter),
      exhaustMap(action =>
        this.apiService.get<IReading>(`/reading/meter/${action.meterId}/last`).pipe(
          map(reading => getLastReadingByMeterSuccess({ reading })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getLastReadingByMeterFailure({ error }));
          })
        )
      )
    )
  );

  loadReadingsCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadReadingsCount),
      exhaustMap(() =>
        this.apiService.get<number>('/reading/count').pipe(
          map(count => loadReadingsCountSuccess({ count })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(loadReadingsCountFailure({ error }));
          })
        )
      )
    )
  );

  getLastReadingByClient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getLastReadingByClient),
      exhaustMap(action =>
        this.apiService.get<IReading>(`/reading/client/${action.clientId}/last`).pipe(
          map(reading => getLastReadingByClientSuccess({ reading })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getLastReadingByClientFailure({ error }));
          })
        )
      )
    )
  );

  refreshListAfterCreateOrUpdate$ = createEffect(() =>
    this.actions$.pipe(
        ofType(createReadingSuccess, updateReadingSuccess),
        map(() => listAllReadings())
    )
);
}
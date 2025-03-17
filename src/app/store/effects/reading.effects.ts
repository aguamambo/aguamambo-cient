import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of, tap, switchMap } from "rxjs";
import { IReading } from "src/app/models/reading";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getReading, getReadingSuccess, getReadingFailure, listAllReadings, listAllReadingsSuccess, listAllReadingsFailure, createReading, createReadingSuccess, createReadingFailure, updateReading, updateReadingSuccess, updateReadingFailure, deleteReading, deleteReadingSuccess, deleteReadingFailure, getLastReadingByMeter, getLastReadingByMeterSuccess, getLastReadingByMeterFailure, loadReadingsCount, loadReadingsCountSuccess, loadReadingsCountFailure, getLastReadingByClient, getLastReadingByClientSuccess, getLastReadingByClientFailure, getReadingByClientId, getReadingByClientIdFailure, getReadingByClientIdSuccess, getReadingByMeterId, getReadingByMeterIdFailure, getReadingByMeterIdSuccess, getReadingByStatus, getReadingByStatusFailure, getReadingByStatusSuccess, updateBulkReadings, updateBulkReadingsFailure, updateBulkReadingsSuccess, uploadFile, uploadFileFailure, uploadFileSuccess, exportReadingsByZone, exportReadingsByZoneFailure, exportReadingsByZoneSuccess, getReadingByStateZone, getReadingByStateZoneFailure, getReadingByStateZoneSuccess, getReadingByZone, getReadingByZoneFailure, getReadingByZoneSuccess } from "../actions";
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
            this.errorMessage.getErrorMessage(error.status, error.error);
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
            this.errorMessage.getErrorMessage(error.status, error.error);
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
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getReadingByClientIdFailure({ error }));
          })
        )
      )
    )
  );

  getReadingByStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReadingByStatus),
      exhaustMap(action =>
        this.apiService.get<IReading[]>(`/reading/by-state?state=${action.state}`).pipe(
          map(readings => getReadingByStatusSuccess({ readings: readings })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getReadingByStatusFailure({ error }));
          })
        )
      )
    )
  );
 

  uploadFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(uploadFile),
      exhaustMap((action) =>
        this.apiService.upload<boolean>(action.payload, '/reading/upload').pipe(
          map(uploaded => uploadFileSuccess({uploaded})),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(uploadFileFailure({ error }));
          })
        )
      )
    )
  );

  exportReadingsByZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(exportReadingsByZone),
      exhaustMap((action) =>
        this.apiService.get<string>(`/reading/export/last-readings/by-zone?zoneId=${action.zoneId}`).pipe(
          map(fileContent => exportReadingsByZoneSuccess({fileContent:  JSON.stringify(fileContent)})),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(exportReadingsByZoneFailure({ error }));
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
            this.errorMessage.getErrorMessage(error.status, error.error);
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
          map(reading => createReadingSuccess({ reading: reading })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(createReadingFailure({ error: error, statusCode: error.status }));
          })
        )
      )
    )
  );

  updateReading$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateReading),
      exhaustMap(action =>
        this.apiService.put<IReading>(`/reading/${action.readingId}`, action.reading).pipe(
          map(reading => updateReadingSuccess({ reading })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(updateReadingFailure({ error }));
          })
        )
      )
    )
  );

  updateBulkReadings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateBulkReadings),
      exhaustMap(action =>
        this.apiService.put<IReading[]>(`/reading/bulk-update`, action.payload).pipe(
          map(readings => updateBulkReadingsSuccess({ readings })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(updateBulkReadingsFailure({ error }));
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
            this.errorMessage.getErrorMessage(error.status, error.error);
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
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getLastReadingByMeterFailure({ error }));
          })
        )
      )
    )
  );

  getReadingByStateZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReadingByStateZone),
      exhaustMap(action =>
        this.apiService.get<IReading[]>(`/reading/by-state-zone?zoneId=${action.payload.zoneId}&state=${action.payload.state}`).pipe(
          map(readings => getReadingByStateZoneSuccess({ readings })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getReadingByStateZoneFailure({ error }));
          })
        )
      )
    )
  );

  getReadingByZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getReadingByZone),
      exhaustMap(action =>
        this.apiService.get<IReading[]>(`/reading/last/by-zone?zoneId=${action.payload.zoneId}`).pipe(
          map(readings => getReadingByZoneSuccess({ readings })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getReadingByZoneFailure({ error }));
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
            this.errorMessage.getErrorMessage(error.status, error.error);
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
            this.errorMessage.getErrorMessage(error.status, error.error);
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

  refreshListAfterUpdateBulk$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateBulkReadingsSuccess),
      map(() => getReadingByStatus({ state: 'PENDING' }))
    )
  );
}
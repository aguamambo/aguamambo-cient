import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IRubric } from "src/app/models/rubric";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service"; 
import { getRubric, getRubricSuccess, getRubricFailure, getRubricByMeterId, getRubricByMeterIdSuccess, getRubricByMeterIdFailure, getRubricByClientId, getRubricByClientIdSuccess, getRubricByClientIdFailure, listAllRubrics, listAllRubricsSuccess, listAllRubricsFailure, createRubric, createRubricSuccess, createRubricFailure, updateRubric, updateRubricSuccess, updateRubricFailure, deleteRubric, deleteRubricSuccess, deleteRubricFailure, getLastRubricByMeter, getLastRubricByMeterSuccess, getLastRubricByMeterFailure, loadRubricsCount, loadRubricsCountSuccess, loadRubricsCountFailure, getLastRubricByClient, getLastRubricByClientSuccess, getLastRubricByClientFailure } from "../actions/rubric.actions";

@Injectable()
export class RubricEffects {
  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private errorMessage: ErrorMessageService
  ) { }

  getRubric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getRubric),
      exhaustMap(action =>
        this.apiService.get<IRubric>(`/rubric/${action.rubricId}`).pipe(
          map(rubric => getRubricSuccess({ rubric })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getRubricFailure({ error }));
          })
        )
      )
    )
  );

  getRubricByMeterId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getRubricByMeterId),
      exhaustMap(action =>
        this.apiService.get<IRubric[]>(`/rubric/by-meter/${action.meterId}`).pipe(
          map(rubrics => getRubricByMeterIdSuccess({ rubrics: rubrics })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getRubricByMeterIdFailure({ error }));
          })
        )
      )
    )
  );

  getRubricByClientId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        getRubricByClientId),
      exhaustMap(action =>
        this.apiService.get<IRubric[]>(`/rubric/by-client/${action.clientId}`).pipe(
          map(rubrics => getRubricByClientIdSuccess({ rubrics: rubrics })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getRubricByClientIdFailure({ error }));
          })
        )
      )
    )
  );

  listAllRubrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listAllRubrics),
      exhaustMap(() =>
        this.apiService.get<IRubric[]>('/rubric').pipe(
          map(rubrics => listAllRubricsSuccess({ rubrics })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(listAllRubricsFailure({ error }));
          })
        )
      )
    )
  );

  createRubric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createRubric),
      exhaustMap(action =>
        this.apiService.post<IRubric>('/rubric', action.rubric).pipe(
          map(rubric => createRubricSuccess({ rubric })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(createRubricFailure({ error }));
          })
        )
      )
    )
  );

  updateRubric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRubric),
      exhaustMap(action =>
        this.apiService.put<IRubric>(`/rubric/${action.rubricId}`, action.rubric).pipe(
          map(rubric => updateRubricSuccess({ rubric })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(updateRubricFailure({ error }));
          })
        )
      )
    )
  );

  deleteRubric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteRubric),
      exhaustMap(action =>
        this.apiService.delete(`/rubric/${action.rubricId}`).pipe(
          map(() => deleteRubricSuccess({ rubricId: action.rubricId })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(deleteRubricFailure({ error }));
          })
        )
      )
    )
  );

  
  loadRubricsCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRubricsCount),
      exhaustMap(() =>
        this.apiService.get<number>('/rubric/count').pipe(
          map(count => loadRubricsCountSuccess({ count })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(loadRubricsCountFailure({ error }));
          })
        )
      )
    )
  );

  getLastRubricByClient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getLastRubricByClient),
      exhaustMap(action =>
        this.apiService.get<IRubric>(`/rubric/client/${action.clientId}/last`).pipe(
          map(rubric => getLastRubricByClientSuccess({ rubric })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status);
            return of(getLastRubricByClientFailure({ error }));
          })
        )
      )
    )
  );

  refreshListAfterCreateOrUpdate$ = createEffect(() =>
    this.actions$.pipe(
        ofType(createRubricSuccess, updateRubricSuccess),
        map(() => listAllRubrics())
    )
);
}
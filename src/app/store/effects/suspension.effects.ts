import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { ISuspension } from "src/app/models/suspension";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getSuspension, getSuspensionSuccess, getSuspensionFailure, listAllSuspensions, listAllSuspensionsSuccess, listAllSuspensionsFailure, createSuspension, createSuspensionSuccess, createSuspensionFailure, updateSuspension, updateSuspensionSuccess, updateSuspensionFailure, deleteSuspension, deleteSuspensionSuccess, deleteSuspensionFailure, loadSuspensionsCount, loadSuspensionsCountSuccess, loadSuspensionsCountFailure, getSuspensionByClientId, getSuspensionByClientIdFailure, getSuspensionByClientIdSuccess } from "../actions";

@Injectable()
export class SuspensionEffects {
  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private errorMessage: ErrorMessageService
  ) {}

  getSuspension$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getSuspension),
      exhaustMap(action =>
        this.apiService.get<ISuspension>(`/suspension/${action.suspensionId}`).pipe(
          map(suspension => getSuspensionSuccess({ suspension })),
          catchError(error => {
            return of(getSuspensionFailure({ error }));
          })
        )
      )
    )
  );

  getSuspensionByClientId$ = createEffect(() =>
    this.actions$.pipe(
        ofType(getSuspensionByClientId),
        exhaustMap(action =>
            this.apiService.get<ISuspension[]>(`/suspension/by-client/${action.clientId}`).pipe(
                map(suspensions => getSuspensionByClientIdSuccess({ suspensions: suspensions })),
                catchError(error => {
                            return of(getSuspensionByClientIdFailure({ error }));
                })
            )
        )
    )
  );

  listAllSuspensions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listAllSuspensions),
      exhaustMap(() =>
        this.apiService.get<ISuspension[]>('/suspension').pipe(
          map(suspensions => listAllSuspensionsSuccess({ suspensions })),
          catchError(error => {
            return of(listAllSuspensionsFailure({ error }));
          })
        )
      )
    )
  );

  createSuspension$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createSuspension),
      exhaustMap(action =>
        this.apiService.post<ISuspension>('/suspension', action.suspension).pipe(
          map(suspension => createSuspensionSuccess({ suspension })),
          catchError(error => {
            return of(createSuspensionFailure({ error }));
          })
        )
      )
    )
  );

  updateSuspension$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateSuspension),
      exhaustMap(action =>
        this.apiService.put<ISuspension>(`/suspension/${action.suspensionId}`, action.suspension).pipe(
          map(suspension => updateSuspensionSuccess({ suspension })),
          catchError(error => {
            return of(updateSuspensionFailure({ error }));
          })
        )
      )
    )
  );

  deleteSuspension$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteSuspension),
      exhaustMap(action =>
        this.apiService.delete(`/suspension/${action.suspensionId}`).pipe(
          map(() => deleteSuspensionSuccess({ suspensionId: action.suspensionId })),
          catchError(error => {
            return of(deleteSuspensionFailure({ error }));
          })
        )
      )
    )
  );

  loadSuspensionsCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSuspensionsCount),
      exhaustMap(() =>
        this.apiService.get<number>('/suspension/count').pipe(
          map(count => loadSuspensionsCountSuccess({ count })),
          catchError(error => {
            return of(loadSuspensionsCountFailure({ error }));
          })
        )
      )
    )
  );

  refreshListAfterCreateOrUpdate$ = createEffect(() =>
    this.actions$.pipe(
        ofType(createSuspensionSuccess, updateSuspensionSuccess),
        map(() => listAllSuspensions())
    )
);
}
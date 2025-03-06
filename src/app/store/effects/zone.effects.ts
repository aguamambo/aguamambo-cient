import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IZone } from "src/app/models/zone";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getZone, getZoneSuccess, getZoneFailure, listAllZones, listAllZonesSuccess, listAllZonesFailure, createZone, createZoneSuccess, createZoneFailure, updateZone, updateZoneSuccess, updateZoneFailure, deleteZone, deleteZoneSuccess, deleteZoneFailure, loadZonesCount, loadZonesCountSuccess, loadZonesCountFailure, getZoneByEnterpriseId, getZoneByEnterpriseIdFailure, getZoneByEnterpriseIdSuccess, getZoneByClientId, getZoneByClientIdFailure, getZoneByClientIdSuccess } from "../actions";

@Injectable()
export class ZoneEffects {
  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private errorMessage: ErrorMessageService
  ) {}

  getZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getZone),
      exhaustMap(action =>
        this.apiService.get<IZone>(`/zone/${action.zoneId}`).pipe(
          map(zone => getZoneSuccess({ zone })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getZoneFailure({ error }));
          })
        )
      )
    )
  );

  getZoneByClientId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getZoneByClientId),
      exhaustMap(action =>
        this.apiService.get<IZone>(`/zone/by-client/${action.clientId}`).pipe(
          map(zone => getZoneByClientIdSuccess({ zone })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getZoneByClientIdFailure({ error }));
          })
        )
      )
    )
  );

  getZoneByEnterpriseId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getZoneByEnterpriseId),
      exhaustMap(action =>
        this.apiService.get<IZone[]>(`/zone/by-enterprise/${action.enterpriseId}`).pipe(
          map(zones => getZoneByEnterpriseIdSuccess({ zones: zones })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getZoneByEnterpriseIdFailure({ error }));
          })
        )
      )
    )
  );

  listAllZones$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listAllZones),
      exhaustMap(() =>
        this.apiService.get<IZone[]>('/zone').pipe(
          map(zones => listAllZonesSuccess({ zones })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(listAllZonesFailure({ error }));
          })
        )
      )
    )
  );

  createZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createZone),
      exhaustMap(action =>
        this.apiService.post<IZone>('/zone', action.zone).pipe(
          map(zone => createZoneSuccess({ zone })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(createZoneFailure({ error }));
          })
        )
      )
    )
  );

  updateZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateZone),
      exhaustMap(action =>
        this.apiService.put<IZone>(`/zone/${action.zoneId}`, action.zone).pipe(
          map(zone => updateZoneSuccess({ zone })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(updateZoneFailure({ error }));
          })
        )
      )
    )
  );

  deleteZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteZone),
      exhaustMap(action =>
        this.apiService.delete(`/zone/${action.zoneId}`).pipe(
          map(() => deleteZoneSuccess({ zoneId: action.zoneId })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(deleteZoneFailure({ error }));
          })
        )
      )
    )
  );

  loadZonesCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadZonesCount),
      exhaustMap(() =>
        this.apiService.get<{ count: number }>('/zone/count').pipe(
          map(response => loadZonesCountSuccess({ count: response.count })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(loadZonesCountFailure({ error }));
          })
        )
      )
    )
  );

  refreshListAfterCreateOrUpdate$ = createEffect(() =>
    this.actions$.pipe(
        ofType(createZoneSuccess, updateZoneSuccess),
        map(() => listAllZones())
    )
);
}
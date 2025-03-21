import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of, tap } from "rxjs";
import { IClientMeter } from "src/app/models/clientMeter";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getClientMeter, getClientMeterSuccess, getClientMeterFailure, listAllClientMeters, listAllClientMetersSuccess, listAllClientMetersFailure, createClientMeter, createClientMeterSuccess, createClientMeterFailure, updateClientMeter, updateClientMeterSuccess, updateClientMeterFailure, deleteClientMeter, deleteClientMeterSuccess, deleteClientMeterFailure, loadClientMetersCount, loadClientMetersCountSuccess, loadClientMetersCountFailure, getClientMeterByClient, getClientMeterByClientFailure, getClientMeterByClientSuccess, listAllAvailableMeters, listAllAvailableMetersFailure, listAllAvailableMetersSuccess } from "../actions";

@Injectable()
export class ClientMeterEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) {}

    getClientMeterByClientId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getClientMeterByClient),
            exhaustMap(action =>
                this.apiService.get<IClientMeter[]>(`/client-meter/client/${action.clientId}`).pipe(
                    map(clientMeters => getClientMeterByClientSuccess({ clientMeters:  clientMeters})),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getClientMeterByClientFailure({ error }));
                    })
                )
            )
        )
    );

    

    listAllClientMeters$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllClientMeters),
            exhaustMap(() =>
                this.apiService.get<IClientMeter[]>('/client-meter').pipe(
                  map(clientMeters => listAllClientMetersSuccess({ clientMeters })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(listAllClientMetersFailure({ error }));
                    })
                )
            )
        )
    );

    listAllAvailableMeters$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllAvailableMeters),
            exhaustMap(() =>
                this.apiService.get<IClientMeter[]>('/client-meter/available').pipe(
                    map(clientMeters => listAllAvailableMetersSuccess({ clientMeters })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(listAllAvailableMetersFailure({ error }));
                    })
                )
            )
        )
    );

    createClientMeter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createClientMeter),
            exhaustMap(action =>
                this.apiService.post<IClientMeter>('/client-meter', action.clientMeter).pipe(
                    map(clientMeter => createClientMeterSuccess({ clientMeter })),
                    catchError(error => {
                        return of(createClientMeterFailure({ error }));
                    })
                )
            )
        )
    );

    updateClientMeter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateClientMeter),
            exhaustMap(action =>
                this.apiService.put<IClientMeter>(`/client-meter/${action.meterId}`, action.meter).pipe(
                    map(clientMeter => updateClientMeterSuccess({ clientMeter })),
                    catchError(error => {
                        return of(updateClientMeterFailure({ error }));
                    })
                )
            )
        )
    );

    deleteClientMeter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteClientMeter),
            exhaustMap(action =>
                this.apiService.delete(`/client-meter/${action.meterId}`).pipe(
                    map(() => deleteClientMeterSuccess({ meterId: action.meterId })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(deleteClientMeterFailure({ error }));
                    })
                )
            )
        )
    );

    loadClientMetersCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadClientMetersCount),
            exhaustMap(() =>
                this.apiService.get<number>('/client-meter/count').pipe(
                    map(count => loadClientMetersCountSuccess({ count })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(loadClientMetersCountFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createClientMeterSuccess, updateClientMeterSuccess),
            map(() => listAllClientMeters())
        )
    );
}
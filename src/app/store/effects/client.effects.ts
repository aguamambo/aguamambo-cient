import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IClient } from "src/app/models/client";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getClient, getClientSuccess, getClientFailure, listAllClients, listAllClientsSuccess, listAllClientsFailure, createClient, createClientSuccess, createClientFailure, updateClient, updateClientSuccess, updateClientFailure, deleteClient, deleteClientSuccess, deleteClientFailure, loadClientsCount, loadClientsCountSuccess, loadClientsCountFailure, getClientByZoneId, getClientByZoneIdFailure, getClientByZoneIdSuccess, getClientByContractTypeId, getClientByContractTypeIdFailure, getClientByContractTypeIdSuccess } from "../actions";


@Injectable()
export class ClientEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) { }

    getClient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getClient),
            exhaustMap(action =>
                this.apiService.get<IClient>(`/client/${action.clientId}`).pipe(
                    map(client => getClientSuccess({ client })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getClientFailure({ error }));
                    })
                )
            )
        )
    );

    getClientByZoneId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getClientByZoneId),
            exhaustMap(action =>
                this.apiService.get<IClient[]>(`/client/by-zone/${action.zoneId}`).pipe(
                    map(clients => getClientByZoneIdSuccess({ clients: clients })),
                    catchError(error => {
                         this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getClientByZoneIdFailure({ error }));
                    })
                )
            )
        )
    );

    getClientByContractTypeId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getClientByContractTypeId),
            exhaustMap(action =>
                this.apiService.get<IClient[]>(`/client/by-contract-type/${action.contractTypeId}`).pipe(
                    map(clients => getClientByContractTypeIdSuccess({ clients: clients })),
                    catchError(error => {
                         this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getClientByContractTypeIdFailure({ error }));
                    })
                )
            )
        )
    );

    listAllClients$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllClients),
            exhaustMap(() =>
                this.apiService.get<IClient[]>('/client').pipe(
                    map(clients => listAllClientsSuccess({ clients })),
                    catchError(error => {
                         this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(listAllClientsFailure({ error }));
                    })
                )
            )
        )
    );

    createClient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createClient),
            exhaustMap(action =>
                this.apiService.post<{ client: IClient; statusCode: number }>('/client', action.client).pipe(
                    map(response => createClientSuccess({ client: response.client, statusCode: response.statusCode })),
                    catchError(error => { 
                        return of(createClientFailure({ error: error, statusCode: error.status }));
                    })
                )
            )
        )
    );

    updateClient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateClient),
            exhaustMap(action =>
                this.apiService.put<IClient>(`/client/${action.clientId}`, action.client).pipe(
                    map(client => updateClientSuccess({ client })),
                    catchError(error => { 
                        return of(updateClientFailure({ error }));
                    })
                )
            )
        )
    );

    deleteClient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteClient),
            exhaustMap(action =>
                this.apiService.delete(`/client/${action.clientId}`).pipe(
                    map(() => deleteClientSuccess({ clientId: action.clientId })),
                    catchError(error => {
                         this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(deleteClientFailure({ error }));
                    })
                )
            )
        )
    );

    loadClientsCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadClientsCount),
            exhaustMap(() =>
                this.apiService.get<number>('/client/count').pipe(
                    map(count => loadClientsCountSuccess({ count })),
                    catchError(error => {
                         this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(loadClientsCountFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createClientSuccess, updateClientSuccess),
            map(() => listAllClients())
        )
    );
}

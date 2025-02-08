import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IFineConfiguration } from "src/app/models/fineConfiguration";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getFineConfiguration, getFineConfigurationSuccess, getFineConfigurationFailure, createFineConfiguration, createFineConfigurationSuccess, createFineConfigurationFailure, updateFineConfiguration, updateFineConfigurationSuccess, updateFineConfigurationFailure, deleteFineConfiguration, deleteFineConfigurationSuccess, deleteFineConfigurationFailure, getLastActiveFineConfiguration, getLastActiveFineConfigurationSuccess, getLastActiveFineConfigurationFailure, listAllFineConfigurations, listAllFineConfigurationsFailure, listAllFineConfigurationsSuccess } from "../actions";

@Injectable()
export class FineConfigurationEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) {}

    getFineConfiguration$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getFineConfiguration),
            exhaustMap(action =>
                this.apiService.get<IFineConfiguration>(`/fine-configuration/${action.fineConfigurationId}`).pipe(
                    map(fineConfiguration => getFineConfigurationSuccess({ fineConfiguration })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getFineConfigurationFailure({ error }));
                    })
                )
            )
        )
    );

    listAllFineConfigurations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllFineConfigurations),
            exhaustMap(() =>
                this.apiService.get<IFineConfiguration[]>('/fine-configuration').pipe(
                    map(fineConfigurations => listAllFineConfigurationsSuccess({ fineConfigurations })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(listAllFineConfigurationsFailure({ error }));
                    })
                )
            )
        )
    );

    createFineConfiguration$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createFineConfiguration),
            exhaustMap(action =>
                this.apiService.post<IFineConfiguration>('/fine-configuration', action.fineConfiguration).pipe(
                    map(fineConfiguration => createFineConfigurationSuccess({ fineConfiguration })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(createFineConfigurationFailure({ error }));
                    })
                )
            )
        )
    );

    updateFineConfiguration$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateFineConfiguration),
            exhaustMap(action =>
                this.apiService.put<IFineConfiguration>(`/fine-configuration/${action.fineConfigurationId}`, action.fineConfiguration).pipe(
                    map(fineConfiguration => updateFineConfigurationSuccess({ fineConfiguration })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(updateFineConfigurationFailure({ error }));
                    })
                )
            )
        )
    );

    deleteFineConfiguration$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteFineConfiguration),
            exhaustMap(action =>
                this.apiService.delete(`/fine-configuration/${action.fineConfigurationId}`).pipe(
                    map(() => deleteFineConfigurationSuccess({ fineConfigurationId: action.fineConfigurationId })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(deleteFineConfigurationFailure({ error }));
                    })
                )
            )
        )
    );

    getLastActiveFineConfiguration$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getLastActiveFineConfiguration),
            exhaustMap(() =>
                this.apiService.get<IFineConfiguration>('/fine-configuration/last-active').pipe(
                    map(fineConfiguration => getLastActiveFineConfigurationSuccess({ fineConfiguration })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getLastActiveFineConfigurationFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createFineConfigurationSuccess, updateFineConfigurationSuccess),
            map(() => listAllFineConfigurations())
        )
    );
}
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IEnterprise } from "src/app/models/enterprise";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getEnterprise, getEnterpriseSuccess, getEnterpriseFailure, listAllEnterprises, listAllEnterprisesSuccess, listAllEnterprisesFailure, createEnterprise, createEnterpriseSuccess, createEnterpriseFailure, updateEnterprise, updateEnterpriseSuccess, updateEnterpriseFailure, deleteEnterprise, deleteEnterpriseSuccess, deleteEnterpriseFailure, loadEnterprisesCount, loadEnterprisesCountSuccess, loadEnterprisesCountFailure, getEnterpriseByZoneId, getEnterpriseByZoneIdFailure, getEnterpriseByZoneIdSuccess } from "../actions";

@Injectable()
export class EnterpriseEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) {}

    getEnterprise$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getEnterprise),
            exhaustMap(action =>
                this.apiService.get<IEnterprise>(`/enterprise/${action.enterpriseId}`).pipe(
                    map(enterprise => getEnterpriseSuccess({ enterprise })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getEnterpriseFailure({ error }));
                    })
                )
            )
        )
    );

    getEnterpriseByZoneId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getEnterpriseByZoneId),
            exhaustMap(action =>
                this.apiService.get<IEnterprise>(`/enterprise/enterprise/${action.zoneId}`).pipe(
                    map(enterprise => getEnterpriseByZoneIdSuccess({ enterprise })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getEnterpriseByZoneIdFailure({ error }));
                    })
                )
            )
        )
    );

    listAllEnterprises$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllEnterprises),
            exhaustMap(() =>
                this.apiService.get<IEnterprise[]>('/enterprise').pipe(
                    map(enterprises => listAllEnterprisesSuccess({ enterprises })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(listAllEnterprisesFailure({ error }));
                    })
                )
            )
        )
    );

    createEnterprise$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createEnterprise),
            exhaustMap(action =>
                this.apiService.post<IEnterprise>('/enterprise', action.enterprise).pipe(
                    map(enterprise => createEnterpriseSuccess({ enterprise })),
                    catchError(error => {
                        return of(createEnterpriseFailure({ error }));
                    })
                )
            )
        )
    );

    updateEnterprise$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateEnterprise),
            exhaustMap(action =>
                this.apiService.put<IEnterprise>(`/enterprise/${action.enterpriseId}`, action.enterprise).pipe(
                    map(enterprise => updateEnterpriseSuccess({ enterprise })),
                    catchError(error => { 
                        return of(updateEnterpriseFailure({ error }));
                    })
                )
            )
        )
    );

    deleteEnterprise$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteEnterprise),
            exhaustMap(action =>
                this.apiService.delete(`/enterprise/${action.enterpriseId}`).pipe(
                    map(() => deleteEnterpriseSuccess({ enterpriseId: action.enterpriseId })),
                    catchError(error => { 
                        return of(deleteEnterpriseFailure({ error }));
                    })
                )
            )
        )
    );

    loadEnterprisesCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadEnterprisesCount),
            exhaustMap(() =>
                this.apiService.get<number>('/enterprise/count').pipe(
                    map(count => loadEnterprisesCountSuccess({ count })),
                    catchError(error => {
                       this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(loadEnterprisesCountFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createEnterpriseSuccess, updateEnterpriseSuccess),
            map(() => listAllEnterprises())
        )
    );
}
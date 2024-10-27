import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IEnterprise } from "src/app/models/enterprise";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getEnterprise, getEnterpriseSuccess, getEnterpriseFailure, listAllEnterprises, listAllEnterprisesSuccess, listAllEnterprisesFailure, createEnterprise, createEnterpriseSuccess, createEnterpriseFailure, updateEnterprise, updateEnterpriseSuccess, updateEnterpriseFailure, deleteEnterprise, deleteEnterpriseSuccess, deleteEnterpriseFailure, loadEnterprisesCount, loadEnterprisesCountSuccess, loadEnterprisesCountFailure } from "../actions";

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
                        this.errorMessage.getErrorMessage(error.status);
                        return of(getEnterpriseFailure({ error }));
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
                        this.errorMessage.getErrorMessage(error.status);
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
                        this.errorMessage.getErrorMessage(error.status);
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
                        this.errorMessage.getErrorMessage(error.status);
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
                        this.errorMessage.getErrorMessage(error.status);
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
                        this.errorMessage.getErrorMessage(error.status);
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
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IContractType } from "src/app/models/contractType";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getContractType, getContractTypeSuccess, getContractTypeFailure, listAllContractTypes, listAllContractTypesSuccess, listAllContractTypesFailure, createContractType, createContractTypeSuccess, createContractTypeFailure, updateContractType, updateContractTypeSuccess, updateContractTypeFailure, deleteContractType, deleteContractTypeSuccess, deleteContractTypeFailure, loadContractTypesCount, loadContractTypesCountSuccess, loadContractTypesCountFailure } from "../actions";

@Injectable()
export class ContractTypeEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) {}

    getContractType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getContractType),
            exhaustMap(action =>
                this.apiService.get<IContractType>(`/contract-type/${action.contractTypeId}`).pipe(
                    map(contractType => getContractTypeSuccess({ contractType })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getContractTypeFailure({ error }));
                    })
                )
            )
        )
    );

    listAllContractTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllContractTypes),
            exhaustMap(() =>
                this.apiService.get<IContractType[]>('/contract-type').pipe(
                    map(contractTypes => listAllContractTypesSuccess({ contractTypes })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(listAllContractTypesFailure({ error }));
                    })
                )
            )
        )
    );

    createContractType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createContractType),
            exhaustMap(action =>
                this.apiService.post<IContractType>('/contract-type', action.contractType).pipe(
                    map(contractType => createContractTypeSuccess({ contractType })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(createContractTypeFailure({ error }));
                    })
                )
            )
        )
    );

    updateContractType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateContractType),
            exhaustMap(action =>
                this.apiService.put<IContractType>(`/contract-type/${action.contractTypeId}`, action.contractType).pipe(
                    map(contractType => updateContractTypeSuccess({ contractType })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(updateContractTypeFailure({ error }));
                    })
                )
            )
        )
    );

    deleteContractType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteContractType),
            exhaustMap(action =>
                this.apiService.delete(`/contract-type/${action.contractTypeId}`).pipe(
                    map(() => deleteContractTypeSuccess({ contractTypeId: action.contractTypeId })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(deleteContractTypeFailure({ error }));
                    })
                )
            )
        )
    );

    loadContractTypesCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadContractTypesCount),
            exhaustMap(() =>
                this.apiService.get<number>('/contract-type/count').pipe(
                    map(count => loadContractTypesCountSuccess({ count })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(loadContractTypesCountFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createContractTypeSuccess, updateContractTypeSuccess),
            map(() => listAllContractTypes())
        )
    );
}
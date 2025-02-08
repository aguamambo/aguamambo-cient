import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IContract } from "src/app/models/contract";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getContract, getContractSuccess, getContractFailure, listAllContracts, listAllContractsSuccess, listAllContractsFailure, createContract, createContractSuccess, createContractFailure, updateContract, updateContractSuccess, updateContractFailure, deleteContract, deleteContractSuccess, deleteContractFailure, loadContractsCount, loadContractsCountSuccess, loadContractsCountFailure, getContractByClientId, getContractByClientIdFailure, getContractByClientIdSuccess } from "../actions/contract.actions";
 
@Injectable()
export class ContractEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) {}

    getContract$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getContract),
            exhaustMap(action =>
                this.apiService.get<IContract>(`/contract/${action.contractId}`).pipe(
                    map(contract => getContractSuccess({ contract })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getContractFailure({ error }));
                    })
                )
            )
        )
    );

    getContractByClientId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getContractByClientId),
            exhaustMap(action =>
                this.apiService.get<IContract[]>(`/contract/by-client/${action.clientId}`).pipe(
                    map(contracts => getContractByClientIdSuccess({ contracts: contracts })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(getContractByClientIdFailure({ error }));
                    })
                )
            )
        )
    );

    listAllContracts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllContracts),
            exhaustMap(() =>
                this.apiService.get<IContract[]>('/contract').pipe(
                    map(contracts => listAllContractsSuccess({ contracts })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(listAllContractsFailure({ error }));
                    })
                )
            )
        )
    );

    createContract$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createContract),
            exhaustMap(action =>
                this.apiService.post<IContract>('/contract', action.contract).pipe(
                    map(contract => createContractSuccess({ contract })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(createContractFailure({ error }));
                    })
                )
            )
        )
    );

    updateContract$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateContract),
            exhaustMap(action =>
                this.apiService.put<IContract>(`/contract/${action.contractId}`, action.contract).pipe(
                    map(contract => updateContractSuccess({ contract })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(updateContractFailure({ error }));
                    })
                )
            )
        )
    );

    deleteContract$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteContract),
            exhaustMap(action =>
                this.apiService.delete(`/contract/${action.contractId}`).pipe(
                    map(() => deleteContractSuccess({ contractId: action.contractId })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(deleteContractFailure({ error }));
                    })
                )
            )
        )
    );

    loadContractsCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadContractsCount),
            exhaustMap(() =>
                this.apiService.get<number>('/contract/count').pipe(
                    map(count => loadContractsCountSuccess({ count })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(loadContractsCountFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createContractSuccess, updateContractSuccess),
            map(() => listAllContracts())
        )
    );
}
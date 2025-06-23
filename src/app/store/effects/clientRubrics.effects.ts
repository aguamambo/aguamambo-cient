import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IClientRubric } from "src/app/models/rubric";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getClientRubric, getClientRubricSuccess, getClientRubricFailure, listAllClientRubrics, listAllClientRubricsSuccess, listAllClientRubricsFailure, createClientRubricSuccess, createClientRubricFailure, updateClientRubric, updateClientRubricSuccess, updateClientRubricFailure, deleteClientRubric, deleteClientRubricSuccess, deleteClientRubricFailure, createClientRubric, getClientRubricsByClientId, getClientRubricsByClientIdFailure, getClientRubricsByClientIdSuccess } from "../actions/clientRubrics.actions";

 
@Injectable()
export class ClientRubricsEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) { }

    getClientRubrics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getClientRubric),
            exhaustMap(action =>
                this.apiService.get<IClientRubric>(`/client-rubrics/${action.clientRubricId}`).pipe(
                    map(clientRubric => getClientRubricSuccess({ clientRubric })),
                    catchError(error => {
                        return of(getClientRubricFailure({ error }));
                    })
                )
            )
        )
    );
 

    getClientRubricsByClientId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getClientRubricsByClientId),
            exhaustMap(action =>
                this.apiService.get<IClientRubric[]>(`/client-rubrics/client/${action.clientId}`).pipe(
                    map(clientRubrics => getClientRubricsByClientIdSuccess({ clientRubrics })),
                    catchError(error => {
                        return of(getClientRubricsByClientIdFailure({ error }));
                    })
                )
            )
        )
    );
 
    listAllClientRubricss$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllClientRubrics),
            exhaustMap(() =>
                this.apiService.get<IClientRubric[]>('/client-rubrics').pipe(
                    map(clientRubrics => listAllClientRubricsSuccess({ clientRubrics })),
                    catchError(error => {
                         return of(listAllClientRubricsFailure({ error }));
                    })
                )
            )
        )
    );

    createClientRubrics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createClientRubric),
            exhaustMap(action =>
                this.apiService.post<{ ClientRubrics: IClientRubric; statusCode: number }>('/client-rubrics', action.payload).pipe(
                    map(response => createClientRubricSuccess({ clientRubric: response.ClientRubrics, statusCode: response.statusCode })),
                    catchError(error => { 
                        return of(createClientRubricFailure({ error: error, statusCode: error.status }));
                    })
                )
            )
        )
    );

    updateClientRubrics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateClientRubric),
            exhaustMap(action =>
                this.apiService.put<IClientRubric>(`/client-rubrics/${action.clientRubricId}`, action.clientRubric).pipe(
                    map(clientRubric => updateClientRubricSuccess({ clientRubric })),
                    catchError(error => { 
                        return of(updateClientRubricFailure({ error }));
                    })
                )
            )
        )
    );

    deleteClientRubrics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteClientRubric),
            exhaustMap(action =>
                this.apiService.delete(`/client-rubrics/${action.clientRubricId}`).pipe(
                    map(() => deleteClientRubricSuccess({ clientRubricId: action.clientRubricId })),
                    catchError(error => {
                         return of(deleteClientRubricFailure({ error }));
                    })
                )
            )
        )
    );
 
    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createClientRubricSuccess, updateClientRubricSuccess),
            map(() => listAllClientRubrics())
        )
    );
}

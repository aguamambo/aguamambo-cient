import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { ICut } from "src/app/models/cut";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getCut, getCutSuccess, getCutFailure, listAllCuts, listAllCutsSuccess, listAllCutsFailure, createCut, createCutSuccess, createCutFailure, updateCut, updateCutSuccess, updateCutFailure, deleteCut, deleteCutSuccess, deleteCutFailure, loadCutsCount, loadCutsCountSuccess, loadCutsCountFailure, getCutByClientId, getCutByClientIdFailure, getCutByClientIdSuccess } from "../actions";

@Injectable()
export class CutEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) {}

    getCut$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getCut),
            exhaustMap(action =>
                this.apiService.get<ICut>(`/cut/${action.cutId}`).pipe(
                    map(cut => getCutSuccess({ cut })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(getCutFailure({ error }));
                    })
                )
            )
        )
    );

    getCutByClientId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getCutByClientId),
            exhaustMap(action =>
                this.apiService.get<ICut[]>(`/cut/by-client/${action.clientId}`).pipe(
                    map(cuts => getCutByClientIdSuccess({ cuts: cuts })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(getCutByClientIdFailure({ error }));
                    })
                )
            )
        )
    );

    listAllCuts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllCuts),
            exhaustMap(() =>
                this.apiService.get<ICut[]>('/cut').pipe(
                    map(cuts => listAllCutsSuccess({ cuts })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(listAllCutsFailure({ error }));
                    })
                )
            )
        )
    );

    createCut$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createCut),
            exhaustMap(action =>
                this.apiService.post<ICut>('/cut', action.cut).pipe(
                    map(cut => createCutSuccess({ cut })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(createCutFailure({ error }));
                    })
                )
            )
        )
    );

    updateCut$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateCut),
            exhaustMap(action =>
                this.apiService.put<ICut>(`/cut/${action.cutId}`, action.cut).pipe(
                    map(cut => updateCutSuccess({ cut })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(updateCutFailure({ error }));
                    })
                )
            )
        )
    );

    deleteCut$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteCut),
            exhaustMap(action =>
                this.apiService.delete(`/cut/${action.cutId}`).pipe(
                    map(() => deleteCutSuccess({ cutId: action.cutId })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(deleteCutFailure({ error }));
                    })
                )
            )
        )
    );

    loadCutsCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadCutsCount),
            exhaustMap(() =>
                this.apiService.get<number>('/cut/count').pipe(
                    map(count => loadCutsCountSuccess({ count })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(loadCutsCountFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createCutSuccess, updateCutSuccess),
            map(() => listAllCuts())
        )
    );
}
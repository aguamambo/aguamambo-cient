import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IInvoice } from "src/app/models/invoice";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getInvoice, getInvoiceSuccess, getInvoiceFailure, listAllInvoices, listAllInvoicesSuccess, listAllInvoicesFailure, createInvoice, createInvoiceSuccess, createInvoiceFailure, updateInvoice, updateInvoiceSuccess, updateInvoiceFailure, deleteInvoice, deleteInvoiceSuccess, deleteInvoiceFailure, loadInvoicesCount, loadInvoicesCountSuccess, loadInvoicesCountFailure, getInvoiceByReadingId, getInvoiceByReadingIdFailure, getInvoiceByReadingIdSuccess } from "../actions";

@Injectable()
export class InvoiceEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private errorMessage: ErrorMessageService
    ) {}

    getInvoice$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getInvoice),
            exhaustMap(action =>
                this.apiService.get<IInvoice>(`/invoice/${action.invoiceId}`).pipe(
                    map(invoice => getInvoiceSuccess({ invoice })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(getInvoiceFailure({ error }));
                    })
                )
            )
        )
    );

    getInvoiceByReadingId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getInvoiceByReadingId),
            exhaustMap(action =>
                this.apiService.get<IInvoice>(`/invoice/by-reading/${action.readingId}`).pipe(
                    map(invoice => getInvoiceByReadingIdSuccess({ invoice })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(getInvoiceByReadingIdFailure({ error }));
                    })
                )
            )
        )
    );

    listAllInvoices$ = createEffect(() =>
        this.actions$.pipe(
            ofType(listAllInvoices),
            exhaustMap(() =>
                this.apiService.get<IInvoice[]>('/invoice').pipe(
                    map(invoices => listAllInvoicesSuccess({ invoices })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(listAllInvoicesFailure({ error }));
                    })
                )
            )
        )
    );

    createInvoice$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createInvoice),
            exhaustMap(action =>
                this.apiService.post<IInvoice>('/invoice', action.invoice).pipe(
                    map(invoice => createInvoiceSuccess({ invoice })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(createInvoiceFailure({ error }));
                    })
                )
            )
        )
    );

    updateInvoice$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateInvoice),
            exhaustMap(action =>
                this.apiService.put<IInvoice>(`/invoice/${action.invoiceId}`, action.invoice).pipe(
                    map(invoice => updateInvoiceSuccess({ invoice })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(updateInvoiceFailure({ error }));
                    })
                )
            )
        )
    );

    deleteInvoice$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteInvoice),
            exhaustMap(action =>
                this.apiService.delete(`/invoice/${action.invoiceId}`).pipe(
                    map(() => deleteInvoiceSuccess({ invoiceId: action.invoiceId })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(deleteInvoiceFailure({ error }));
                    })
                )
            )
        )
    );

    loadInvoicesCount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadInvoicesCount),
            exhaustMap(() =>
                this.apiService.get<number>('/invoice/count').pipe(
                    map(count => loadInvoicesCountSuccess({ count })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status);
                        return of(loadInvoicesCountFailure({ error }));
                    })
                )
            )
        )
    );

    refreshListAfterCreateOrUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createInvoiceSuccess, updateInvoiceSuccess),
            map(() => listAllInvoices())
        )
    );
}
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ErrorMessageService } from 'src/app/services/error-message.service';
import { register, registerSuccess, registerFailure, login, loginSuccess, loginFailure, refreshToken, refreshTokenSuccess, refreshTokenFailure } from '../actions';
import { IAuthResponse } from 'src/app/models/authResponse';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private auth: AuthService,
        private router: Router,
        private errorMessage: ErrorMessageService
    ) {}

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(register),
            exhaustMap(action =>
                this.apiService.post<IAuthResponse>('/auth/register', action.user).pipe(
                    map(authResponse => registerSuccess({ authResponse })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(registerFailure({ error }));
                    })
                )
            )
        )
    );

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(login),
            exhaustMap(action =>
                // The actual login API call is now handled by auth.service.login
                // which includes the tap operator to save data and navigate.
                // This effect will simply map the success/failure of that service call.
                this.auth.login(action.credentials.username, action.credentials.password).pipe(
                    map(authResponse => loginSuccess({ authResponse: authResponse })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(loginFailure({ error: error.error }));
                    })
                )
            )
        )
    );

    // This effect is now simplified as auth.service.login already handles data storage and navigation.
    // However, if you still want to dispatch loginSuccess after the service handles it,
    // and perform *additional* actions here, you can keep this structure.
    // For the purpose of centralizing data handling in AuthService, the direct localStorage calls
    // are removed from here. The navigation logic remains here as it's an effect of the Ngrx state.
    onLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loginSuccess),
                map((action) => action.authResponse),
                tap((response: IAuthResponse) => {
                    // The auth.service.login method already calls saveAuthData.
                    // If this effect is still needed for other side effects,
                    // ensure saveAuthData is not called redundantly.
                    // For now, removing direct localStorage calls as per the request to use auth.service.
                    // this.auth.saveAuthData(response); // This is now handled inside auth.service.login

                    const userRole = response.role;
                    switch (userRole.toLowerCase()) {
                        case 'tech_field':
                        {
                            this.router.navigate(['/technical/dashboard']);
                        }
                        break;
                        case 'admin': {
                            this.router.navigate(['/manager/dashboard']);
                        }
                        break;
                        default : this.router.navigate(['/technical/dashboard']);
                        break;
                    }
                })
            ),
        { dispatch: false }
    );


    refreshToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(refreshToken),
            exhaustMap(action =>
                this.apiService.post<IAuthResponse>('/auth/refresh-token', action.tokenRefreshRequest).pipe(
                    map(authResponse => refreshTokenSuccess({ authResponse })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(refreshTokenFailure({ error }));
                    })
                )
            )
        )
    );
}

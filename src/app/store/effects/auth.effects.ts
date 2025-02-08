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
                this.auth.login(action.credentials.username, action.credentials.password).pipe(
                    map(authResponse => loginSuccess({ authResponse: authResponse })),
                    catchError(error => {
                        this.errorMessage.getErrorMessage(error.status, error.error);
                        return of(loginFailure({ error }));
                    })
                )
            )
        )
    );

    onLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loginSuccess),
                map((action) => action.authResponse),
                tap((response: IAuthResponse) => {

                    localStorage.setItem('token', response.token);
                    localStorage.setItem('refreshToken', response.refreshToken);
                    localStorage.setItem('userId', this.auth.encryptData(response.userId));
                    localStorage.setItem('name', this.auth.encryptData(response.name));
                    localStorage.setItem('username', this.auth.encryptData(response.username));
                    localStorage.setItem('role',    this.auth.encryptData( response.role));
                    const userRole = response.role
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

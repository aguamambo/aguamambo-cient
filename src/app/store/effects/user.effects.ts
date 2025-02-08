import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap, map, catchError, of } from "rxjs";
import { IUser } from "src/app/models/user";
import { ApiService } from "src/app/services/api.service";
import { ErrorMessageService } from "src/app/services/error-message.service";
import { getUser, getUserSuccess, getUserFailure, listAllUsers, listAllUsersSuccess, listAllUsersFailure, createUser, createUserSuccess, createUserFailure, updateUser, updateUserSuccess, updateUserFailure, deleteUser, deleteUserSuccess, deleteUserFailure, listAllRoles, listAllRolesFailure, listAllRolesSuccess } from "../actions";

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private errorMessage: ErrorMessageService
  ) {}

  getUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getUser),
      exhaustMap(action =>
        this.apiService.get<IUser>(`/user/${action.userId}`).pipe(
          map(user => getUserSuccess({ user })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(getUserFailure({ error }));
          })
        )
      )
    )
  );

  listAllUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listAllUsers),
      exhaustMap(() =>
        this.apiService.get<IUser[]>('/user').pipe(
          map(users => listAllUsersSuccess({ users })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(listAllUsersFailure({ error }));
          })
        )
      )
    )
  );

  listAllRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listAllRoles),
      exhaustMap(() =>
        this.apiService.get<string[]>('/user/roles').pipe(
          map(roles => listAllRolesSuccess({ roles: roles })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(listAllRolesFailure({ error }));
          })
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      exhaustMap(action =>
        this.apiService.post<IUser>('/user', action.user).pipe(
          map(user => createUserSuccess({ user })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(createUserFailure({ error }));
          })
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUser),
      exhaustMap(action =>
        this.apiService.put<IUser>(`/user/${action.userId}`, action.user).pipe(
          map(user => updateUserSuccess({ user })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(updateUserFailure({ error }));
          })
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteUser),
      exhaustMap(action =>
        this.apiService.delete(`/user/${action.userId}`).pipe(
          map(() => deleteUserSuccess({ userId: action.userId })),
          catchError(error => {
            this.errorMessage.getErrorMessage(error.status, error.error);
            return of(deleteUserFailure({ error }));
          })
        )
      )
    )
  );

  refreshListAfterCreateOrUpdate$ = createEffect(() =>
    this.actions$.pipe(
        ofType(createUserSuccess, updateUserSuccess),
        map(() => listAllUsers())
    )
);
}
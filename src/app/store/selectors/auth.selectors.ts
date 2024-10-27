import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducers'; 

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.currentUser 
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.currentUser 
);

export const selectLoggingIn = createSelector(
  selectAuthState,
  (state) => state.loggingIn
);


export const selectLoginFailed = createSelector(
  selectAuthState,
  (state) => state.loginFailed
);


export const selectLoginError = createSelector(
  selectAuthState,
  (state) => state.loginError
);


export const selectAuthErrorMessage = createSelector(
  selectAuthState,
  (state) => state.errorMessage 
);

export const selectAuthSuccessMessage = createSelector(
  selectAuthState,
  (state) => state.successMessage
);

export const selectUserRoles = createSelector(
  selectAuthState,
  (state) => state.role  
);

export const selectHasRole = (role: string) =>
  createSelector(selectUserRoles, (roles) => roles.includes(role));

export const selectIsAdmin = createSelector(
  selectUserRoles,
  (role) => role.includes('admin')
);

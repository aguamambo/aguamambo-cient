import { createAction, props } from '@ngrx/store';
import { IAuthResponse } from 'src/app/models/authResponse';

// POST auth/register
export const register = createAction(
  '[Auth] Register',
  props<{ user: any }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ authResponse: IAuthResponse }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: any }>()
);

// POST auth/login
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: { username: string, password: string } }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ authResponse: IAuthResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

// POST auth/refresh-token
export const refreshToken = createAction(
  '[Auth] Refresh Token',
  props<{ tokenRefreshRequest: any }>()
);

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ authResponse: IAuthResponse }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: any }>()
);

export const logout = createAction(
  '[Auth] Logout'
);

export const resetAuthActions = createAction(
  '[Auth] Reset all actions'
)

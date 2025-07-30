import { createReducer, on, Action } from "@ngrx/store";
import { register, registerSuccess, registerFailure, login, loginSuccess, loginFailure, refreshToken, refreshTokenSuccess, refreshTokenFailure, logout, resetAuthActions } from "../actions";
import { IAuthResponse } from "src/app/models/authResponse";
import { IUser } from "src/app/models/user";
import { Error } from "src/app/models/error";

export interface AuthState {
  currentUser: string;
  authResponse: IAuthResponse | null;
  isLoading: boolean;
  loggingIn: boolean;
  loginFailed: boolean;
  loginError: Error | null;
  errorMessage: string | null;
  successMessage: string | null;
  role: string;
}

export const initialAuthState: AuthState = {
  currentUser: '',
  authResponse: null,
  isLoading: false,
  loggingIn: false,
  loginFailed: false,
  loginError: null,
  errorMessage: null,
  successMessage: null,
  role: '',
};

const _authReducer = createReducer(
  initialAuthState,

  // Register Actions
  on(register, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: null,
    successMessage: null,
  })),
  on(registerSuccess, (state, { authResponse }) => ({
    ...state,
    isLoading: false,
    authResponse,
    currentUser: authResponse.username,
    role: authResponse.role, // Set role from authResponse
    errorMessage: null,
    successMessage: 'Registration successful!',
  })),
  on(registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error || 'Registration failed',
    successMessage: null,
  })),

  // Login Actions
  on(login, (state) => ({
    ...state,
    loggingIn: true,
    errorMessage: null,
    successMessage: null,
  })),
  on(loginSuccess, (state, { authResponse }) => ({
    ...state,
    loggingIn: false,
    authResponse,
    currentUser: authResponse.username,
    role: authResponse.role,
    errorMessage: null,
    successMessage: 'Login successful!',
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    loggingIn: false,
    loginFailed: true,
    loginError: error,
    errorMessage: error.error || 'Login failed',
    successMessage: null,
  })),

  // Refresh Token Actions
  on(refreshToken, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: null,
  })),
  on(refreshTokenSuccess, (state, { authResponse }) => ({
    ...state,
    isLoading: false,
    authResponse,
    currentUser: authResponse.username,
    role: authResponse.role,
    errorMessage: null,
    successMessage: 'Token refreshed successfully!',
  })),
  on(refreshTokenFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error || 'Token refresh failed',
    successMessage: null,
  })),

  on(logout, (state) => ({
    ...initialAuthState,
  })),
  
  on(resetAuthActions, () => initialAuthState)
);

export function authReducer(state: AuthState | undefined, action: Action) {
  return _authReducer(state, action);
}
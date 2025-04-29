import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IClientState } from '../reducers/client.reducers'; 

export const selectClientState = createFeatureSelector<IClientState>('client');

export const selectClientIsLoading = createSelector(
  selectClientState,
  (state) => state.isLoading
);

export const selectClientIsSaving = createSelector(
  selectClientState,
  (state) => state.isSaving
);

export const selectClientErrorMessage = createSelector(
  selectClientState,
  (state) => state.errorMessage
);

export const selectClientStatusCode = createSelector(
  selectClientState,
  (state) => state.statusCode
);

export const selectClientSuccessMessage = createSelector(
  selectClientState,
  (state) => state.successMessage
);

export const selectClientError = createSelector(
  selectClientState,
  (state) => state.clientError
);

export const selectSelectedClient = createSelector(
  selectClientState,
  (state) => state.selectedClient
);

export const selectSelectedClients = createSelector(
  selectClientState,
  (state) => state.selectedClients
);

export const selectClientCount = createSelector(
  selectClientState,
  (state) => state.clientCount
);

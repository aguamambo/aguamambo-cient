import { createFeatureSelector, createSelector } from '@ngrx/store'; 
import { IClientMeterState } from '../reducers/clientMeter.reducers';

export const selectClientMeterState = createFeatureSelector<IClientMeterState>('clientMeter');

export const selectClientMeterIsLoading = createSelector(
  selectClientMeterState,
  (state) => state.isLoading
);

export const selectClientMeterIsSaving = createSelector(
  selectClientMeterState,
  (state) => state.isSaving
);

export const selectClientMeterErrorMessage = createSelector(
  selectClientMeterState,
  (state) => state.errorMessage
);

export const selectClientMeterSuccessMessage = createSelector(
  selectClientMeterState,
  (state) => state.successMessage
);

export const selectError = createSelector(
  selectClientMeterState,
  (state) => state.error
);

export const selectSelectedClientMeter = createSelector(
  selectClientMeterState,
  (state) => state.selectedClientMeter
);

export const selectSelectedClientMeters = createSelector(
  selectClientMeterState,
  (state) => state.selectedClientMeters
);

export const selectSelectedAvailableMeters = createSelector(
  selectClientMeterState,
  (state) => state.selectedAvailableMeters
);

export const selectClientMeterCount = createSelector(
  selectClientMeterState,
  (state) => state.clientMeterCount
);

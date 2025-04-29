import { createFeatureSelector, createSelector } from '@ngrx/store'; 
import { ISuspensionState } from '../reducers/suspension.reducers';

export const selectSuspensionState = createFeatureSelector<ISuspensionState>('suspension');

export const selectSelectedSuspensions = createSelector(
  selectSuspensionState,
  (state) => state.selectedSuspensions
);

export const selectSelectedSuspension = createSelector(
  selectSuspensionState,
  (state) => state.selectedSuspension
);

export const selectSuspensionIsLoading = createSelector(
  selectSuspensionState,
  (state) => state.isLoading
);

export const selectSuspensionIsSaving = createSelector(
  selectSuspensionState,
  (state) => state.isSaving
);

export const selectSuspensionError = createSelector(
  selectSuspensionState,
  (state) => state.suspensionError
);

export const selectSuspensionSuccessMessage = createSelector(
  selectSuspensionState,
  (state) => state.successMessage
);

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

export const selectuspensionIsLoading = createSelector(
  selectSuspensionState,
  (state) => state.isLoading
);

export const selectuspensionIsSaving = createSelector(
  selectSuspensionState,
  (state) => state.isSaving
);

export const selectuspensionErrorMessage = createSelector(
  selectSuspensionState,
  (state) => state.errorMessage
);

export const selectuspensionSuccessMessage = createSelector(
  selectSuspensionState,
  (state) => state.successMessage
);

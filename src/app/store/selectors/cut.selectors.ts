import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ICutState } from '../reducers/cut.reducers';

export const selectCutState = createFeatureSelector<ICutState>('cut');

export const selectCutIsLoading = createSelector(
  selectCutState,
  (state) => state.isLoading
);

export const selectCutIsSaving = createSelector(
  selectCutState,
  (state) => state.isSaving
);

export const selectCutErrorMessage = createSelector(
  selectCutState,
  (state) => state.errorMessage
);

export const selectCutSuccessMessage = createSelector(
  selectCutState,
  (state) => state.successMessage
);

export const selectError = createSelector(
  selectCutState,
  (state) => state.error
);

export const selectSelectedCut = createSelector(
  selectCutState,
  (state) => state.selectedCut
);

export const selectSelectedCuts = createSelector(
  selectCutState,
  (state) => state.selectedCuts
);

export const selectCutCount = createSelector(
  selectCutState,
  (state) => state.cutsCount
);

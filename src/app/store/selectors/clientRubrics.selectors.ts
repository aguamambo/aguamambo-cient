import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IClientRubricState } from '../reducers/clientRubrics.reducers';

export const selectClientRubricState = createFeatureSelector<IClientRubricState>('clientRubric');

export const selectClientRubricIsLoading = createSelector(
  selectClientRubricState,
  (state) => state.isLoading
);

export const selectClientRubricIsSaving = createSelector(
  selectClientRubricState,
  (state) => state.isSaving
);

export const selectClientRubricErrorMessage = createSelector(
  selectClientRubricState,
  (state) => state.errorMessage
);

export const selectClientRubricStatusCode = createSelector(
  selectClientRubricState,
  (state) => state.statusCode
);

export const selectClientRubricSuccessMessage = createSelector(
  selectClientRubricState,
  (state) => state.successMessage
);

export const selectClientRubricError = createSelector(
  selectClientRubricState,
  (state) => state.clientRubricError
);

export const selectSelectedClientRubric = createSelector(
  selectClientRubricState,
  (state) => state.selectedClientRubric
);

export const selectSelectedClientRubrics = createSelector(
  selectClientRubricState,
  (state) => state.selectedClientRubrics
);

export const selectClientRubricCount = createSelector(
  selectClientRubricState,
  (state) => state.clientRubricCount
);

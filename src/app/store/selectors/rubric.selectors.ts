import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IRubricState } from '../reducers/rubric.reducers';

export const selectRubricState = createFeatureSelector<IRubricState>('rubric');

export const selectSelectedRubrics = createSelector(
  selectRubricState,
  (state) => state.selectedRubrics
);

export const selectSelectedRubric = createSelector(
  selectRubricState,
  (state) => state.selectedRubric
);

export const selectRubricIsLoading = createSelector(
  selectRubricState,
  (state) => state.isLoading
);

export const selectRubricIsSaving = createSelector(
  selectRubricState,
  (state) => state.isSaving
);

export const selectRubricErrorMessage = createSelector(
  selectRubricState,
  (state) => state.errorMessage
);

export const selectRubricSuccessMessage = createSelector(
  selectRubricState,
  (state) => state.successMessage
);

export const selectRubricCount = createSelector(
  selectRubricState,
  (state) => state.rubricCount
);

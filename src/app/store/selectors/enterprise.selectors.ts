// enterprise.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IEnterpriseState } from '../reducers/enterprise.reducers';

export const selectEnterpriseState = createFeatureSelector<IEnterpriseState>('enterprise');

export const selectEnterpriseIsLoading = createSelector(
  selectEnterpriseState,
  (state) => state.isLoading
);

export const selectEnterpriseIsSaving = createSelector(
  selectEnterpriseState,
  (state) => state.isSaving
);

export const selectEnterpriseErrorMessage = createSelector(
  selectEnterpriseState,
  (state) => state.errorMessage
);

export const selectEnterpriseSuccessMessage = createSelector(
  selectEnterpriseState,
  (state) => state.successMessage
);

export const selectSelectedEnterprise = createSelector(
  selectEnterpriseState,
  (state) => state.selectedEnterprise
);

export const selectSelectedEnterprises = createSelector(
  selectEnterpriseState,
  (state) => state.selectedEnterprises
);

export const selectEnterpriseCount = createSelector(
  selectEnterpriseState,
  (state) => state.enterprisesCount
);

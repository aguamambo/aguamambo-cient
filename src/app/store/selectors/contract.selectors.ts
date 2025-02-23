import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IContractState } from '../reducers/contract.reducers';

export const selectContractState = createFeatureSelector<IContractState>('contract');

export const selectContractIsLoading = createSelector(
  selectContractState,
  (state) => state.isLoading
);

export const selectContractIsSaving = createSelector(
  selectContractState,
  (state) => state.isSaving
);

export const selectContractErrorMessage = createSelector(
  selectContractState,
  (state) => state.errorMessage
);

export const selectContractSuccessMessage = createSelector(
  selectContractState,
  (state) => state.successMessage
);

export const selectContractError = createSelector(
  selectContractState,
  (state) => state.error
);

export const selectSelectedContract = createSelector(
  selectContractState,
  (state) => state.selectedContract
);

export const selectSelectedContracts = createSelector(
  selectContractState,
  (state) => state.selectedContracts
);

export const selectContractCount = createSelector(
  selectContractState,
  (state) => state.contractsCount
);

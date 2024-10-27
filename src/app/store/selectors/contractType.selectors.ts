import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IContractTypeState } from '../reducers/contractType.reducers'; 

export const selectContractTypeState = createFeatureSelector<IContractTypeState>('contractType');

export const selectContractTypeIsLoading = createSelector(
  selectContractTypeState,
  (state) => state.isLoading
);

export const selectContractTypeIsSaving = createSelector(
  selectContractTypeState,
  (state) => state.isSaving
);

export const selectContractTypeErrorMessage = createSelector(
  selectContractTypeState,
  (state) => state.errorMessage
);

export const selectContractTypeSuccessMessage = createSelector(
  selectContractTypeState,
  (state) => state.successMessage
);

export const selectError = createSelector(
  selectContractTypeState,
  (state) => state.error
);

export const selectSelectedContractType = createSelector(
  selectContractTypeState,
  (state) => state.selectedContractType
);

export const selectSelectedContractTypes = createSelector(
  selectContractTypeState,
  (state) => state.selectedContractTypes
);

export const selectContractTypeCount = createSelector(
  selectContractTypeState,
  (state) => state.totalContractTypesCount
);

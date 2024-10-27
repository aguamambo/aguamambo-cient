import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IFineConfigurationState } from '../reducers/fineConfiguration.reducers';

export const selectFineConfigurationState = createFeatureSelector<IFineConfigurationState>('fineConfiguration');

export const selectSelectedFineConfigurations = createSelector(
    selectFineConfigurationState,
    (state) => state.selectedFineConfigurations
);

export const selectSelectedFineConfiguration = createSelector(
    selectFineConfigurationState,
    (state) => state.selectedFineConfiguration
);
 
export const selectFineConfigurationIsLoading = createSelector(
    selectFineConfigurationState,
    (state) => state.isLoading
);

export const selectFineConfigurationIsSaving = createSelector(
    selectFineConfigurationState,
    (state) => state.isSaving
);

export const selectFineConfigurationErrorMessage = createSelector(
    selectFineConfigurationState,
    (state) => state.errorMessage
);

export const selectFineConfigurationSuccessMessage = createSelector(
    selectFineConfigurationState,
    (state) => state.successMessage
);

export const selectFineConfigurationError = createSelector(
    selectFineConfigurationState,
    (state) => state.error
);

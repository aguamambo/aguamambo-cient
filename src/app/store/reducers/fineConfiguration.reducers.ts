// fine-configuration.reducer.ts
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IFineConfiguration } from '../../models/fineConfiguration'; // Adjust the import to match your model's path
import { Action, createReducer, on } from '@ngrx/store';
import {
  getFineConfiguration,
  getFineConfigurationSuccess,
  getFineConfigurationFailure,
  listAllFineConfigurations,
  listAllFineConfigurationsSuccess,
  listAllFineConfigurationsFailure,
  createFineConfiguration,
  createFineConfigurationSuccess,
  createFineConfigurationFailure,
  updateFineConfiguration,
  updateFineConfigurationSuccess,
  updateFineConfigurationFailure,
  deleteFineConfiguration,
  deleteFineConfigurationSuccess,
  deleteFineConfigurationFailure,
  getLastActiveFineConfiguration,
  getLastActiveFineConfigurationSuccess,
  getLastActiveFineConfigurationFailure,
  resetFineConfigurationActions,
} from '../actions/fineConfiguration.actions';
import { Update } from '@ngrx/entity';

export interface IFineConfigurationState extends EntityState<IFineConfiguration> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedFineConfiguration: IFineConfiguration | null;
  selectedFineConfigurations: IFineConfiguration[] | null;
}

export const adapter: EntityAdapter<IFineConfiguration> = createEntityAdapter<IFineConfiguration>();
export const initialState: IFineConfigurationState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedFineConfiguration: null,
  selectedFineConfigurations: null,
});

const reducer = createReducer(
  initialState,

  // Get fine configuration by ID
  on(getFineConfiguration, (state) => ({ ...state, isLoading: true })),
  on(getFineConfigurationSuccess, (state, { fineConfiguration }) => ({
    ...state,
    selectedFineConfiguration: fineConfiguration,
    isLoading: false,
  })),
  on(getFineConfigurationFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all fine configurations
  on(listAllFineConfigurations, (state) => ({ ...state, isLoading: true })),
  on(listAllFineConfigurationsSuccess, (state, { fineConfigurations }) =>
   ({ 
    ...state, 
    selectedFineConfigurations: fineConfigurations,
    isLoading: false 
  })),
  on(listAllFineConfigurationsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create fine configuration
  on(createFineConfiguration, (state) => ({ ...state, isSaving: true })),
  on(createFineConfigurationSuccess, (state, { fineConfiguration }) =>
    adapter.addOne(fineConfiguration, { ...state, isSaving: false, successMessage: 'Fine configuration created successfully!' })
  ),
  on(createFineConfigurationFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update fine configuration
  on(updateFineConfiguration, (state) => ({ ...state, isSaving: true })),
  on(updateFineConfigurationSuccess, (state, { fineConfiguration }) =>
    adapter.updateOne(
      { id: fineConfiguration.fineConfigurationId, changes: fineConfiguration },
      { ...state, isSaving: false, successMessage: 'Fine configuration updated successfully!' }
    )
  ),
  on(updateFineConfigurationFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete fine configuration
  on(deleteFineConfiguration, (state) => ({ ...state, isLoading: true })),
  on(deleteFineConfigurationSuccess, (state, { fineConfigurationId }) =>
    adapter.removeOne(fineConfigurationId, { ...state, isLoading: false, successMessage: 'Fine configuration deleted successfully!' })
  ),
  on(deleteFineConfigurationFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get last active fine configuration
  on(getLastActiveFineConfiguration, (state) => ({ ...state, isLoading: true })),
  on(getLastActiveFineConfigurationSuccess, (state, { fineConfiguration }) => ({
    ...state,
    selectedFineConfiguration: fineConfiguration,
    isLoading: false,
  })),
  on(getLastActiveFineConfigurationFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),
  
  on(resetFineConfigurationActions, () => initialState)
);

export function fineConfigurationReducer(
  state: IFineConfigurationState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllFineConfigurations,
  selectEntities: selectFineConfigurationEntities,
  selectIds: selectFineConfigurationIds,
  selectTotal: selectTotalFineConfigurations,
} = adapter.getSelectors();

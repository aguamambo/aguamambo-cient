import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IFineConfiguration } from 'src/app/models/fineConfiguration';

// GET fine-configurations/{id}
export const getFineConfiguration = createAction(
  '[FineConfiguration] Load Fine Configuration',
  props<{ fineConfigurationId: string }>()
);

export const getFineConfigurationSuccess = createAction(
  '[FineConfiguration] Load Fine Configuration Success',
  props<{ fineConfiguration: IFineConfiguration }>()
);

export const getFineConfigurationFailure = createAction(
  '[FineConfiguration] Load Fine Configuration Failure',
  props<{ error: any }>()
);

// GET fine-configurations
export const listAllFineConfigurations = createAction(
  '[FineConfiguration] Load Fine Configurations'
);

export const listAllFineConfigurationsSuccess = createAction(
  '[FineConfiguration] Load Fine Configurations Success',
  props<{ fineConfigurations: IFineConfiguration[] }>()
);

export const listAllFineConfigurationsFailure = createAction(
  '[FineConfiguration] Load Fine Configurations Failure',
  props<{ error: any }>()
);

// POST fine-configurations
export const createFineConfiguration = createAction(
  '[FineConfiguration] Create Fine Configuration',
  props<{ fineConfiguration: IFineConfiguration }>()
);

export const createFineConfigurationSuccess = createAction(
  '[FineConfiguration] Create Fine Configuration Success',
  props<{ fineConfiguration: IFineConfiguration }>()
);

export const createFineConfigurationFailure = createAction(
  '[FineConfiguration] Create Fine Configuration Failure',
  props<{ error: any }>()
);

// PUT fine-configurations/{id}
export const updateFineConfiguration = createAction(
  '[FineConfiguration] Update Fine Configuration',
  props<{ fineConfigurationId: string, fineConfiguration: IFineConfiguration }>()
);

export const updateFineConfigurationSuccess = createAction(
  '[FineConfiguration] Update Fine Configuration Success',
  props<{ fineConfiguration: IFineConfiguration }>()
);

export const updateFineConfigurationFailure = createAction(
  '[FineConfiguration] Update Fine Configuration Failure',
  props<{ error: any }>()
);

// DELETE fine-configurations/{id}
export const deleteFineConfiguration = createAction(
  '[FineConfiguration] Delete Fine Configuration',
  props<{ fineConfigurationId: string }>()
);

export const deleteFineConfigurationSuccess = createAction(
  '[FineConfiguration] Delete Fine Configuration Success',
  props<{ fineConfigurationId: string }>()
);

export const deleteFineConfigurationFailure = createAction(
  '[FineConfiguration] Delete Fine Configuration Failure',
  props<{ error: any }>()
);

// GET fine-configurations/last-active
export const getLastActiveFineConfiguration = createAction(
  '[FineConfiguration] Load Last Active Fine Configuration'
);

export const getLastActiveFineConfigurationSuccess = createAction(
  '[FineConfiguration] Load Last Active Fine Configuration Success',
  props<{ fineConfiguration: IFineConfiguration }>()
);

export const getLastActiveFineConfigurationFailure = createAction(
  '[FineConfiguration] Load Last Active Fine Configuration Failure',
  props<{ error: any }>()
);


export const resetFineConfigurationActions = createAction(
  '[FineConfiguration] Reset all actions'
)

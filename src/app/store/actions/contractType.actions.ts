import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IContractType } from 'src/app/models/contractType';

// GET contract-types/{id}
export const getContractType = createAction(
  '[ContractType] Load Contract Type',
  props<{ contractTypeId: string }>()
);

export const getContractTypeSuccess = createAction(
  '[ContractType] Load Contract Type Success',
  props<{ contractType: IContractType }>()
);

export const getContractTypeFailure = createAction(
  '[ContractType] Load Contract Type Failure',
  props<{ error: any }>()
);

// GET contract-types
export const listAllContractTypes = createAction(
  '[ContractType] List A Contract Types'
);

export const listAllContractTypesSuccess = createAction(
  '[ContractType] List A Contract Types Success',
  props<{ contractTypes: IContractType[] }>()
);

export const listAllContractTypesFailure = createAction(
  '[ContractType] List A Contract Types Failure',
  props<{ error: any }>()
);

// POST contract-types
export const createContractType = createAction(
  '[ContractType] Create Contract Type',
  props<{ contractType: IContractType }>()
);

export const createContractTypeSuccess = createAction(
  '[ContractType] Create Contract Type Success',
  props<{ contractType: IContractType }>()
);

export const createContractTypeFailure = createAction(
  '[ContractType] Create Contract Type Failure',
  props<{ error: any }>()
);

// PUT contract-types/{id}
export const updateContractType = createAction(
  '[ContractType] Update Contract Type',
  props<{ contractTypeId: string, contractType: IContractType}>()
);

export const updateContractTypeSuccess = createAction(
  '[ContractType] Update Contract Type Success',
  props<{ contractType: IContractType }>()
);

export const updateContractTypeFailure = createAction(
  '[ContractType] Update Contract Type Failure',
  props<{ error: any }>()
);

// DELETE contract-types/{id}
export const deleteContractType = createAction(
  '[ContractType] Delete Contract Type',
  props<{ contractTypeId: string }>()
);

export const deleteContractTypeSuccess = createAction(
  '[ContractType] Delete Contract Type Success',
  props<{ contractTypeId: string }>()
);

export const deleteContractTypeFailure = createAction(
  '[ContractType] Delete Contract Type Failure',
  props<{ error: any }>()
);

// GET contract-types/count
export const loadContractTypesCount = createAction(
  '[ContractType] Load Contract Types Count'
);

export const loadContractTypesCountSuccess = createAction(
  '[ContractType] Load Contract Types Count Success',
  props<{ count: number }>()
);

export const loadContractTypesCountFailure = createAction(
  '[ContractType] Load Contract Types Count Failure',
  props<{ error: any }>()
);

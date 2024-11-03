import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IContract } from 'src/app/models/contract';

// GET contracts/{id}
export const getContract = createAction(
  '[Contract] Load Contract',
  props<{ contractId: string }>()
);

export const getContractSuccess = createAction(
  '[Contract] Load Contract Success',
  props<{ contract: IContract }>()
);

export const getContractFailure = createAction(
  '[Contract] Load Contract Failure',
  props<{ error: any }>()
);

// GET contracts/{clientId}
export const getContractByClientId = createAction(
  '[Contract] Load Contract By ClientId',
  props<{ clientId: string }>()
);

export const getContractByClientIdSuccess = createAction(
  '[Contract] Load Contract By ClientId Success',
  props<{ contracts: IContract[] }>()
);

export const getContractByClientIdFailure = createAction(
  '[Contract] Load Contract By ClientId Failure',
  props<{ error: any }>()
);

// GET contracts
export const listAllContracts = createAction(
  '[Contract] Load Contracts'
);

export const listAllContractsSuccess = createAction(
  '[Contract] Load Contracts Success',
  props<{ contracts: IContract[] }>()
);

export const listAllContractsFailure = createAction(
  '[Contract] Load Contracts Failure',
  props<{ error: any }>()
);

// POST contracts
export const createContract = createAction(
  '[Contract] Create Contract',
  props<{ contract: IContract }>()
);

export const createContractSuccess = createAction(
  '[Contract] Create Contract Success',
  props<{ contract: IContract }>()
);

export const createContractFailure = createAction(
  '[Contract] Create Contract Failure',
  props<{ error: any }>()
);

// Pontract contracts/{id}
export const updateContract = createAction(
  '[Contract] Update Contract',
  props<{contractId: string, contract: IContract }>()
);

export const updateContractSuccess = createAction(
  '[Contract] Update Contract Success',
  props<{ contract: IContract }>()
);

export const updateContractFailure = createAction(
  '[Contract] Update Contract Failure',
  props<{ error: any }>()
);

// DELETE contracts/{id}
export const deleteContract = createAction(
  '[Contract] Delete Contract',
  props<{contractId: string }>()
);

export const deleteContractSuccess = createAction(
  '[Contract] Delete Contract Success',
  props<{contractId: string }>()
);

export const deleteContractFailure = createAction(
  '[Contract] Delete Contract Failure',
  props<{ error: any }>()
);

// GET contracts/count
export const loadContractsCount = createAction(
  '[Contract] Load Contracts Count'
);

export const loadContractsCountSuccess = createAction(
  '[Contract] Load Contracts Count Success',
  props<{ count: number }>()
);

export const loadContractsCountFailure = createAction(
  '[Contract] Load Contracts Count Failure',
  props<{ error: any }>()
);

import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IEnterprise } from 'src/app/models/enterprise';

// GET enterprises/{id}
export const getEnterprise = createAction(
  '[Enterprise] Load Enterprise',
  props<{ enterpriseId: string }>()
);

export const getEnterpriseSuccess = createAction(
  '[Enterprise] Load Enterprise Success',
  props<{ enterprise: IEnterprise }>()
);

export const getEnterpriseFailure = createAction(
  '[Enterprise] Load Enterprise Failure',
  props<{ error: any }>()
);

// GET enterprises
export const listAllEnterprises = createAction(
  '[Enterprise] Load Enterprises'
);

export const listAllEnterprisesSuccess = createAction(
  '[Enterprise] Load Enterprises Success',
  props<{ enterprises: IEnterprise[] }>()
);

export const listAllEnterprisesFailure = createAction(
  '[Enterprise] Load Enterprises Failure',
  props<{ error: any }>()
);

// POST enterprises
export const createEnterprise = createAction(
  '[Enterprise] Create Enterprise',
  props<{ enterprise: IEnterprise }>()
);

export const createEnterpriseSuccess = createAction(
  '[Enterprise] Create Enterprise Success',
  props<{ enterprise: IEnterprise }>()
);

export const createEnterpriseFailure = createAction(
  '[Enterprise] Create Enterprise Failure',
  props<{ error: any }>()
);

// PUT enterprises/{id}
export const updateEnterprise = createAction(
  '[Enterprise] Update Enterprise',
  props<{ enterpriseId: string, enterprise: IEnterprise }>()
);

export const updateEnterpriseSuccess = createAction(
  '[Enterprise] Update Enterprise Success',
  props<{ enterprise: IEnterprise }>()
);

export const updateEnterpriseFailure = createAction(
  '[Enterprise] Update Enterprise Failure',
  props<{ error: any }>()
);

// DELETE enterprises/{id}
export const deleteEnterprise = createAction(
  '[Enterprise] Delete Enterprise',
  props<{ enterpriseId: string }>()
);

export const deleteEnterpriseSuccess = createAction(
  '[Enterprise] Delete Enterprise Success',
  props<{ enterpriseId: string }>()
);

export const deleteEnterpriseFailure = createAction(
  '[Enterprise] Delete Enterprise Failure',
  props<{ error: any }>()
);

// GET enterprises/count
export const loadEnterprisesCount = createAction(
  '[Enterprise] Load Enterprises Count'
);

export const loadEnterprisesCountSuccess = createAction(
  '[Enterprise] Load Enterprises Count Success',
  props<{ count: number }>()
);

export const loadEnterprisesCountFailure = createAction(
  '[Enterprise] Load Enterprises Count Failure',
  props<{ error: any }>()
);

import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ICut } from 'src/app/models/cut';

// GET cuts/{id}
export const getCut = createAction(
  '[Cut] Get Cut',
  props<{ cutId: string }>()
);

export const getCutSuccess = createAction(
  '[Cut] Get Cut Success',
  props<{ cut: ICut }>()
);

export const getCutFailure = createAction(
  '[Cut] Get Cut Failure',
  props<{ error: any }>()
);

// GET cuts/{clientId}
export const getCutByClientId = createAction(
  '[Cut] Get Cut By ClientId',
  props<{ clientId: string }>()
);

export const getCutByClientIdSuccess = createAction(
  '[Cut] Get Cut By ClientId Success',
  props<{ cuts: ICut[] }>()
);

export const getCutByClientIdFailure = createAction(
  '[Cut] Get Cut By ClientId Failure',
  props<{ error: any }>()
);

// GET cuts
export const listAllCuts = createAction(
  '[Cut] List Cuts'
);

export const listAllCutsSuccess = createAction(
  '[Cut] List Cuts Success',
  props<{ cuts: ICut[] }>()
);

export const listAllCutsFailure = createAction(
  '[Cut] List Cuts Failure',
  props<{ error: any }>()
);

// POST cuts
export const createCut = createAction(
  '[Cut] Create Cut',
  props<{ cut: any }>()
);

export const createCutSuccess = createAction(
  '[Cut] Create Cut Success',
  props<{ cut: ICut }>()
);

export const createCutFailure = createAction(
  '[Cut] Create Cut Failure',
  props<{ error: any }>()
);

// PUT cuts/{id}
export const updateCut = createAction(
  '[Cut] Update Cut',
  props<{cutId: string, cut: ICut }>()
);

export const updateCutSuccess = createAction(
  '[Cut] Update Cut Success',
  props<{ cut: ICut }>()
);

export const updateCutFailure = createAction(
  '[Cut] Update Cut Failure',
  props<{ error: any }>()
);

// DELETE cuts/{id}
export const deleteCut = createAction(
  '[Cut] Delete Cut',
  props<{cutId: string }>()
);

export const deleteCutSuccess = createAction(
  '[Cut] Delete Cut Success',
  props<{cutId: string }>()
);

export const deleteCutFailure = createAction(
  '[Cut] Delete Cut Failure',
  props<{ error: any }>()
);

// GET cuts/count
export const loadCutsCount = createAction(
  '[Cut] Load Cuts Count'
);

export const loadCutsCountSuccess = createAction(
  '[Cut] Load Cuts Count Success',
  props<{ count: number }>()
);

export const loadCutsCountFailure = createAction(
  '[Cut] Load Cuts Count Failure',
  props<{ error: any }>()
);


export const resetCutActions = createAction(
  '[Cut] Reset all actions'
)

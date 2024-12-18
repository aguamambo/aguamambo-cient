import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ISuspension } from 'src/app/models/suspension';

// GET suspensions/{id}
export const getSuspension = createAction(
  '[Suspension] Load Suspension',
  props<{ suspensionId: string }>()
);

export const getSuspensionSuccess = createAction(
  '[Suspension] Load Suspension Success',
  props<{ suspension: ISuspension }>()
);

export const getSuspensionFailure = createAction(
  '[Suspension] Load Suspension Failure',
  props<{ error: any }>()
);

export const getSuspensionByClientId = createAction(
  '[Suspension] Load Suspension',
  props<{ clientId: string }>()
);

export const getSuspensionByClientIdSuccess = createAction(
  '[Suspension] Load Suspension Success',
  props<{ suspensions: ISuspension[] }>()
);

export const getSuspensionByClientIdFailure = createAction(
  '[Suspension] Load Suspension Failure',
  props<{ error: any }>()
);

// GET suspensions
export const listAllSuspensions = createAction(
  '[Suspension] Load Suspensions'
);

export const listAllSuspensionsSuccess = createAction(
  '[Suspension] Load Suspensions Success',
  props<{ suspensions: ISuspension[] }>()
);

export const listAllSuspensionsFailure = createAction(
  '[Suspension] Load Suspensions Failure',
  props<{ error: any }>()
);

// POST suspensions
export const createSuspension = createAction(
  '[Suspension] Create Suspension',
  props<{ suspension: ISuspension }>()
);

export const createSuspensionSuccess = createAction(
  '[Suspension] Create Suspension Success',
  props<{ suspension: ISuspension }>()
);

export const createSuspensionFailure = createAction(
  '[Suspension] Create Suspension Failure',
  props<{ error: any }>()
);

// PUT suspensions/{id}
export const updateSuspension = createAction(
  '[Suspension] Update Suspension',
  props<{ suspensionId: string, suspension: ISuspension }>()
);

export const updateSuspensionSuccess = createAction(
  '[Suspension] Update Suspension Success',
  props<{ suspension: ISuspension }>()
);

export const updateSuspensionFailure = createAction(
  '[Suspension] Update Suspension Failure',
  props<{ error: any }>()
);

// DELETE suspensions/{id}
export const deleteSuspension = createAction(
  '[Suspension] Delete Suspension',
  props<{ suspensionId: string }>()
);

export const deleteSuspensionSuccess = createAction(
  '[Suspension] Delete Suspension Success',
  props<{ suspensionId: string }>()
);

export const deleteSuspensionFailure = createAction(
  '[Suspension] Delete Suspension Failure',
  props<{ error: any }>()
);

// GET suspensions/count
export const loadSuspensionsCount = createAction(
  '[Suspension] Load Suspensions Count'
);

export const loadSuspensionsCountSuccess = createAction(
  '[Suspension] Load Suspensions Count Success',
  props<{ count: number }>()
);

export const loadSuspensionsCountFailure = createAction(
  '[Suspension] Load Suspensions Count Failure',
  props<{ error: any }>()
);


export const resetSuspensionActions = createAction(
  '[Suspension] Reset all actions'
)

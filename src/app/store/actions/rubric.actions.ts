import { createAction, props } from '@ngrx/store'; 
import { Update } from '@ngrx/entity';
import { IRubric } from 'src/app/models/rubric';

// GET rubrics/{id}
export const getRubric = createAction(
  '[Rubric] Get Rubric',
  props<{ rubricId: string }>()
);

export const getRubricSuccess = createAction(
  '[Rubric] Get Rubric Success',
  props<{ rubric: IRubric }>()
);

export const getRubricFailure = createAction(
  '[Rubric] Get Rubric Failure',
  props<{ error: any }>()
);

// GET rubrics/{id}
export const getRubricByMeterId = createAction(
  '[Rubric] Get Rubric By MeterId',
  props<{ meterId: string }>()
);

export const getRubricByMeterIdSuccess = createAction(
  '[Rubric] Get Rubric By MeterId Success',
  props<{ rubrics: IRubric[] }>()
);

export const getRubricByMeterIdFailure = createAction(
  '[Rubric] Get Rubric By MeterId Failure',
  props<{ error: any }>()
);

// GET rubrics/{id}
export const getRubricByClientId = createAction(
  '[Rubric] Get Rubric By ClientId',
  props<{ clientId: string }>()
);

export const getRubricByClientIdSuccess = createAction(
  '[Rubric] Get Rubric By ClientId Success',
  props<{ rubrics: IRubric[] }>()
);

export const getRubricByClientIdFailure = createAction(
  '[Rubric] Get Rubric By ClientId Failure',
  props<{ error: any }>()
);

// GET rubrics
export const listAllRubrics = createAction(
  '[Rubric] List Rubrics'
);

export const listAllRubricsSuccess = createAction(
  '[Rubric] List Rubrics Success',
  props<{ rubrics: IRubric[] }>()
);

export const listAllRubricsFailure = createAction(
  '[Rubric] List Rubrics Failure',
  props<{ error: any }>()
);

// POST rubrics
export const createRubric = createAction(
  '[Rubric] Create Rubric',
  props<{ rubric: IRubric }>()
);

export const createRubricSuccess = createAction(
  '[Rubric] Create Rubric Success',
  props<{ rubric: IRubric }>()
);

export const createRubricFailure = createAction(
  '[Rubric] Create Rubric Failure',
  props<{ error: any }>()
);

// PUT rubrics/{id}
export const updateRubric = createAction(
  '[Rubric] Update Rubric',
  props<{ rubricId: string, rubric: IRubric }>()
);

export const updateRubricSuccess = createAction(
  '[Rubric] Update Rubric Success',
  props<{ rubric: IRubric }>()
);

export const updateRubricFailure = createAction(
  '[Rubric] Update Rubric Failure',
  props<{ error: any }>()
);

// DELETE rubrics/{id}
export const deleteRubric = createAction(
  '[Rubric] Delete Rubric',
  props<{ rubricId: string }>()
);

export const deleteRubricSuccess = createAction(
  '[Rubric] Delete Rubric Success',
  props<{ rubricId: string }>()
);

export const deleteRubricFailure = createAction(
  '[Rubric] Delete Rubric Failure',
  props<{ error: any }>()
);

// GET rubrics/meter/{meterId}/last
export const getLastRubricByMeter = createAction(
  '[Rubric] Load Last Rubric By Meter',
  props<{ meterId: string }>()
);

export const getLastRubricByMeterSuccess = createAction(
  '[Rubric] Load Last Rubric By Meter Success',
  props<{ rubric: IRubric }>()
);

export const getLastRubricByMeterFailure = createAction(
  '[Rubric] Load Last Rubric By Meter Failure',
  props<{ error: any }>()
);

// GET rubrics/count
export const loadRubricsCount = createAction(
  '[Rubric] Load Rubrics Count'
);

export const loadRubricsCountSuccess = createAction(
  '[Rubric] Load Rubrics Count Success',
  props<{ count: number }>()
);

export const loadRubricsCountFailure = createAction(
  '[Rubric] Load Rubrics Count Failure',
  props<{ error: any }>()
);

// GET rubrics/client/{clientId}/last
export const getLastRubricByClient = createAction(
  '[Rubric] Load Last Rubric By Client',
  props<{ clientId: string }>()
);

export const getLastRubricByClientSuccess = createAction(
  '[Rubric] Load Last Rubric By Client Success',
  props<{ rubric: IRubric }>()
);

export const getLastRubricByClientFailure = createAction(
  '[Rubric] Load Last Rubric By Client Failure',
  props<{ error: any }>()
);

export const resetRubricActions = createAction(
  '[Rubric] Reset all actions'
)

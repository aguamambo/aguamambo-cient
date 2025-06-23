import { createAction, props } from '@ngrx/store'; 
import { Error } from 'src/app/models/error';
import { IClientRubric } from 'src/app/models/rubric';

// GET clientRubrics/{id}
export const getClientRubric = createAction(
  '[ClientRubric] Get Client Rubric By ID',
  props<{ clientRubricId: string }>()
);

export const getClientRubricSuccess = createAction(
  '[ClientRubric] Get Client Rubric By ID Success',
  props<{ clientRubric: IClientRubric }>()
);

export const getClientRubricFailure = createAction(
  '[ClientRubric] Get Client Rubric By ID Failure',
  props<{ error: Error }>()
);

// GET clientRubrics/{clientId}
export const getClientRubricsByClientId = createAction(
  '[ClientRubric] Get Client Rubric By Client ID',
  props<{ clientId: string }>()
);

export const getClientRubricsByClientIdSuccess = createAction(
  '[ClientRubric] Get Client Rubric By Client ID Success',
  props<{ clientRubrics: IClientRubric[] }>()
);

export const getClientRubricsByClientIdFailure = createAction(
  '[ClientRubric] Get Client Rubric By Client ID Failure',
  props<{ error: Error }>()
);
 
// GET clientRubrics
export const listAllClientRubrics = createAction(
  '[ClientRubric] List All Client Rubrics'
);

export const listAllClientRubricsSuccess = createAction(
  '[ClientRubric] List All Client Rubrics Success',
  props<{ clientRubrics: IClientRubric[] }>()
);

export const listAllClientRubricsFailure = createAction(
  '[ClientRubric] List All Client Rubrics Failure',
  props<{ error: Error }>()
);

// POST clientRubrics
export const createClientRubric = createAction(
  '[ClientRubric] Create Client Rubric',
  props<{ payload: any }>()
);

export const createClientRubricSuccess = createAction(
  '[ClientRubric] Create Client Rubric Success',
  props<{ clientRubric: IClientRubric , statusCode: number}>()
);

export const createClientRubricFailure = createAction(
  '[ClientRubric] Create Client Rubric Failure',
  props<{ error: Error , statusCode: number }>()
);

// PUT clientRubrics/{id}
export const updateClientRubric = createAction(
  '[ClientRubric] Update Client Rubric',
  props<{ clientRubricId: string, clientRubric: any }>()
);

export const updateClientRubricSuccess = createAction(
  '[ClientRubric] Update Client Rubric Success',
  props<{ clientRubric: IClientRubric }>()
);

export const updateClientRubricFailure = createAction(
  '[ClientRubric] Update Client Rubric Failure',
  props<{ error: Error }>()
);

// DELETE clientRubrics/{id}
export const deleteClientRubric = createAction(
  '[ClientRubric] Delete Client Rubric',
  props<{ clientRubricId: string }>()
);

export const deleteClientRubricSuccess = createAction(
  '[ClientRubric] Delete Client Rubric Success',
  props<{ clientRubricId: string }>()
);

export const deleteClientRubricFailure = createAction(
  '[ClientRubric] Delete Client Rubric Failure',
  props<{ error: Error }>()
);
  
export const resetClientRubricActions = createAction(
  '[ClientRubric] Reset all actions'
)

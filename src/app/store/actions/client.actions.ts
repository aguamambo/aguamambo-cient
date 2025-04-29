import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IClient } from 'src/app/models/client';
import { Error } from 'src/app/models/error';

// GET clients/{id}
export const getClient = createAction(
  '[Client] Get Client By ID',
  props<{ clientId: string }>()
);

export const getClientSuccess = createAction(
  '[Client] Get Client By ID Success',
  props<{ client: IClient }>()
);

export const getClientFailure = createAction(
  '[Client] Get Client By ID Failure',
  props<{ error: Error }>()
);

// GET clients/{zoneId}
export const getClientByZoneId = createAction(
  '[Client] Get Client By ZoneId',
  props<{ zoneId: string }>()
);

export const getClientByZoneIdSuccess = createAction(
  '[Client] Get Client By ZoneId Success',
  props<{ clients: IClient[] }>()
);

export const getClientByZoneIdFailure = createAction(
  '[Client] Get Client By ZoneId Failure',
  props<{ error: Error }>()
);

// GET clients/{zoneId}
export const getClientByContractTypeId = createAction(
  '[Client] Get Client By ContractTypeId',
  props<{ contractTypeId: string }>()
);

export const getClientByContractTypeIdSuccess = createAction(
  '[Client] Get Client By ContractTypeId Success',
  props<{ clients: IClient[] }>()
);

export const getClientByContractTypeIdFailure = createAction(
  '[Client] Get Client By ContractTypeId Failure',
  props<{ error: Error }>()
);

// GET clients
export const listAllClients = createAction(
  '[Client] List All Clients'
);

export const listAllClientsSuccess = createAction(
  '[Client] List All Clients Success',
  props<{ clients: IClient[] }>()
);

export const listAllClientsFailure = createAction(
  '[Client] List All Clients Failure',
  props<{ error: Error }>()
);

// POST clients
export const createClient = createAction(
  '[Client] Create Client',
  props<{ client: IClient }>()
);

export const createClientSuccess = createAction(
  '[Client] Create Client Success',
  props<{ client: IClient , statusCode: number}>()
);

export const createClientFailure = createAction(
  '[Client] Create Client Failure',
  props<{ error: Error , statusCode: number }>()
);

// PUT clients/{id}
export const updateClient = createAction(
  '[Client] Update Client',
  props<{ clientId: string, client: any }>()
);

export const updateClientSuccess = createAction(
  '[Client] Update Client Success',
  props<{ client: IClient }>()
);

export const updateClientFailure = createAction(
  '[Client] Update Client Failure',
  props<{ error: Error }>()
);

// DELETE clients/{id}
export const deleteClient = createAction(
  '[Client] Delete Client',
  props<{ clientId: string }>()
);

export const deleteClientSuccess = createAction(
  '[Client] Delete Client Success',
  props<{ clientId: string }>()
);

export const deleteClientFailure = createAction(
  '[Client] Delete Client Failure',
  props<{ error: Error }>()
);

// GET clients/count
export const loadClientsCount = createAction(
  '[Client] Load Clients Count'
);

export const loadClientsCountSuccess = createAction(
  '[Client] Load Clients Count Success',
  props<{ count: number }>()
);

export const loadClientsCountFailure = createAction(
  '[Client] Load Clients Count Failure',
  props<{ error: Error }>()
);

export const resetClientActions = createAction(
  '[Client] Reset all actions'
)

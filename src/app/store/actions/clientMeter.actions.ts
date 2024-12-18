import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IClientMeter } from 'src/app/models/clientMeter';

// GET client-meters/{id}
export const getClientMeter = createAction(
  '[ClientMeter] Get Client Meter',
  props<{ meterId: string }>()
);

export const getClientMeterSuccess = createAction(
  '[ClientMeter] Get Client Meter Success',
  props<{ clientMeter: IClientMeter }>()
);

export const getClientMeterFailure = createAction(
  '[ClientMeter] Get Client Meter Failure',
  props<{ error: any }>()
);

// GET client-meters/{clientId}
export const getClientMeterByClient = createAction(
  '[ClientMeter] Get Meter By Client',
  props<{ clientId: string }>()
);

export const getClientMeterByClientSuccess = createAction(
  '[ClientMeter] Get Meter By Client Success',
  props<{ clientMeters: IClientMeter[] }>()
);

export const getClientMeterByClientFailure = createAction(
  '[ClientMeter] Get Meter By Client Failure',
  props<{ error: any }>()
);

// GET client-meters
export const listAllClientMeters = createAction(
  '[ClientMeter] List All Meters'
);

export const listAllClientMetersSuccess = createAction(
  '[ClientMeter] List All Meters Success',
  props<{ clientMeters: IClientMeter[] }>()
);

export const listAllClientMetersFailure = createAction(
  '[ClientMeter] List All Meters Failure',
  props<{ error: any }>()
);

// GET client-meters
export const listAllAvailableMeters = createAction(
  '[ClientMeter] Load Client Meters'
);

export const listAllAvailableMetersSuccess = createAction(
  '[ClientMeter] Load Client Meters Success',
  props<{ clientMeters: IClientMeter[] }>()
);

export const listAllAvailableMetersFailure = createAction(
  '[ClientMeter] Load Client Meters Failure',
  props<{ error: any }>()
);

// POST client-meters
export const createClientMeter = createAction(
  '[ClientMeter] Create Client Meter',
  props<{ clientMeter: { brand: string,  cubicMeters: number;} }>()
);

export const createClientMeterSuccess = createAction(
  '[ClientMeter] Create Client Meter Success',
  props<{ clientMeter: IClientMeter }>()
);

export const createClientMeterFailure = createAction(
  '[ClientMeter] Create Client Meter Failure',
  props<{ error: any }>()
);

// PUT client-meters/{id}
export const updateClientMeter = createAction(
  '[ClientMeter] Update Client Meter',
  props<{ meterId: string, meter: IClientMeter }>()
);

export const updateClientMeterSuccess = createAction(
  '[ClientMeter] Update Client Meter Success',
  props<{ clientMeter: IClientMeter }>()
);

export const updateClientMeterFailure = createAction(
  '[ClientMeter] Update Client Meter Failure',
  props<{ error: any }>()
);

// DELETE client-meters/{id}
export const deleteClientMeter = createAction(
  '[ClientMeter] Delete Client Meter',
  props<{ meterId: string }>()
);

export const deleteClientMeterSuccess = createAction(
  '[ClientMeter] Delete Client Meter Success',
  props<{ meterId: string }>()
);

export const deleteClientMeterFailure = createAction(
  '[ClientMeter] Delete Client Meter Failure',
  props<{ error: any }>()
);

// GET client-meters/count
export const loadClientMetersCount = createAction(
  '[ClientMeter] Load Client Meters Count'
);

export const loadClientMetersCountSuccess = createAction(
  '[ClientMeter] Load Client Meters Count Success',
  props<{ count: number }>()
);

export const loadClientMetersCountFailure = createAction(
  '[ClientMeter] Load Client Meters Count Failure',
  props<{ error: any }>()
);

export const resetClientMetersActions = createAction(
  '[ClientMeters] Reset all actions'
)

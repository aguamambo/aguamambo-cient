import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IClientMeter } from 'src/app/models/clientMeter';

// GET client-meters/{id}
export const getClientMeter = createAction(
  '[ClientMeter] Load Client Meter',
  props<{ meterId: string }>()
);

export const getClientMeterSuccess = createAction(
  '[ClientMeter] Load Client Meter Success',
  props<{ clientMeter: IClientMeter }>()
);

export const getClientMeterFailure = createAction(
  '[ClientMeter] Load Client Meter Failure',
  props<{ error: any }>()
);

// GET client-meters/{clientId}
export const getClientMeterByClientId = createAction(
  '[ClientMeter] Load Client Meter',
  props<{ clientId: string }>()
);

export const getClientMeterByClientIdSuccess = createAction(
  '[ClientMeter] Load Client Meter Success',
  props<{ clientMeters: IClientMeter[] }>()
);

export const getClientMeterByClientIdFailure = createAction(
  '[ClientMeter] Load Client Meter Failure',
  props<{ error: any }>()
);

// GET client-meters
export const listAllClientMeters = createAction(
  '[ClientMeter] Load Client Meters'
);

export const listAllClientMetersSuccess = createAction(
  '[ClientMeter] Load Client Meters Success',
  props<{ clientMeters: IClientMeter[] }>()
);

export const listAllClientMetersFailure = createAction(
  '[ClientMeter] Load Client Meters Failure',
  props<{ error: any }>()
);

// POST client-meters
export const createClientMeter = createAction(
  '[ClientMeter] Create Client Meter',
  props<{ clientMeter: IClientMeter }>()
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
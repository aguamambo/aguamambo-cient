import { IZone } from './../../models/zone';
import { createAction, props } from '@ngrx/store'; 
import { Update } from '@ngrx/entity';

// GET zones/{id}
export const getZone = createAction(
  '[Zone] Load Zone',
  props<{ zoneId: string }>()
);

export const getZoneSuccess = createAction(
  '[Zone] Load Zone Success',
  props<{ zone: IZone }>()
);

export const getZoneFailure = createAction(
  '[Zone] Load Zone Failure',
  props<{ error: any }>()
);

// GET zones/{enterpriseId}
export const getZoneByEnterpriseId = createAction(
  '[Zone] Load Zone By Enterprise Id',
  props<{ enterpriseId: string }>()
);

export const getZoneByEnterpriseIdSuccess = createAction(
  '[Zone] Load Zone By Enterprise Id Success',
  props<{ zones: IZone[] }>()
);

export const getZoneByEnterpriseIdFailure = createAction(
  '[Zone] Load Zone By Enterprise Id Failure',
  props<{ error: any }>()
);

// GET zones
export const listAllZones = createAction(
  '[Zone] Load Zones'
);

export const listAllZonesSuccess = createAction(
  '[Zone] Load Zones Success',
  props<{ zones: IZone[] }>()
);

export const listAllZonesFailure = createAction(
  '[Zone] Load Zones Failure',
  props<{ error: any }>()
);

// POST zones
export const createZone = createAction(
  '[Zone] Create Zone',
  props<{ zone: IZone }>()
);

export const createZoneSuccess = createAction(
  '[Zone] Create Zone Success',
  props<{ zone: IZone }>()
);

export const createZoneFailure = createAction(
  '[Zone] Create Zone Failure',
  props<{ error: any }>()
);

// PUT zones/{id}
export const updateZone = createAction(
  '[Zone] Update Zone',
  props<{ zoneId: string, zone: IZone }>()
);

export const updateZoneSuccess = createAction(
  '[Zone] Update Zone Success',
  props<{ zone: IZone }>()
);

export const updateZoneFailure = createAction(
  '[Zone] Update Zone Failure',
  props<{ error: any }>()
);

// DELETE zones/{id}
export const deleteZone = createAction(
  '[Zone] Delete Zone',
  props<{ zoneId: string }>()
);

export const deleteZoneSuccess = createAction(
  '[Zone] Delete Zone Success',
  props<{ zoneId: string }>()
);

export const deleteZoneFailure = createAction(
  '[Zone] Delete Zone Failure',
  props<{ error: any }>()
);

// GET zones/count
export const loadZonesCount = createAction(
  '[Zone] Load Zones Count'
);

export const loadZonesCountSuccess = createAction(
  '[Zone] Load Zones Count Success',
  props<{ count: number }>()
);

export const loadZonesCountFailure = createAction(
  '[Zone] Load Zones Count Failure',
  props<{ error: any }>()
);

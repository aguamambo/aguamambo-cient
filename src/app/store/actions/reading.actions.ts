import { createAction, props } from '@ngrx/store'; 
import { Update } from '@ngrx/entity';
import { IReading } from 'src/app/models/reading';

// GET readings/{id}
export const getReading = createAction(
  '[Reading] Load Reading',
  props<{ readingId: string }>()
);

export const getReadingSuccess = createAction(
  '[Reading] Load Reading Success',
  props<{ reading: IReading }>()
);

export const getReadingFailure = createAction(
  '[Reading] Load Reading Failure',
  props<{ error: any }>()
);

// upload File
export const uploadFile = createAction(
  '[Reading] upload Reading File',
  props<{ file: File }>()
);

export const uploadFileSuccess = createAction(
  '[Reading] upload Reading File Success',
  props<{uploaded: boolean}>()
);

export const uploadFileFailure = createAction(
  '[Reading] upload Reading File Failure',
  props<{ error: any }>()
);

// GET readings/{id}
export const getReadingByMeterId = createAction(
  '[Reading] Load Reading',
  props<{ meterId: string }>()
);

export const getReadingByMeterIdSuccess = createAction(
  '[Reading] Load Reading Success',
  props<{ readings: IReading[] }>()
);

export const getReadingByMeterIdFailure = createAction(
  '[Reading] Load Reading Failure',
  props<{ error: any }>()
);

// GET readings/{id}
export const getReadingByClientId = createAction(
  '[Reading] Load Reading',
  props<{ clientId: string }>()
);

export const getReadingByClientIdSuccess = createAction(
  '[Reading] Load Reading Success',
  props<{ readings: IReading[] }>()
);

export const getReadingByClientIdFailure = createAction(
  '[Reading] Load Reading Failure',
  props<{ error: any }>()
);

// GET readings
export const listAllReadings = createAction(
  '[Reading] Load Readings'
);

export const listAllReadingsSuccess = createAction(
  '[Reading] Load Readings Success',
  props<{ readings: IReading[] }>()
);

export const listAllReadingsFailure = createAction(
  '[Reading] Load Readings Failure',
  props<{ error: any }>()
);

// POST readings
export const createReading = createAction(
  '[Reading] Create Reading',
  props<{ reading: IReading }>()
);

export const createReadingSuccess = createAction(
  '[Reading] Create Reading Success',
  props<{ reading: IReading}>()
);

export const createReadingFailure = createAction(
  '[Reading] Create Reading Failure',
  props<{ error: any ; statusCode: number }>()
);

// PUT readings/{id}
export const updateReading = createAction(
  '[Reading] Update Reading',
  props<{ readingId: string, reading: any }>()
);

export const updateReadingSuccess = createAction(
  '[Reading] Update Reading Success',
  props<{ reading: IReading }>()
);

export const updateReadingFailure = createAction(
  '[Reading] Update Reading Failure',
  props<{ error: any }>()
);

// PUT readings/bulk
export const updateBulkReadings = createAction(
  '[Reading] Update Bulk Readings',
  props<{ payload: { readingIds: string[], state: string }}>()
);

export const updateBulkReadingsSuccess = createAction(
  '[Reading] Update Bulk Readings Success',
  props<{ readings: IReading[] }>()
);

export const updateBulkReadingsFailure = createAction(
  '[Reading] Update Bulk Readings Failure',
  props<{ error: any }>()
);

// DELETE readings/{id}
export const deleteReading = createAction(
  '[Reading] Delete Reading',
  props<{ readingId: string }>()
);

export const deleteReadingSuccess = createAction(
  '[Reading] Delete Reading Success',
  props<{ readingId: string }>()
);

export const deleteReadingFailure = createAction(
  '[Reading] Delete Reading Failure',
  props<{ error: any }>()
);

// GET readings/meter/{meterId}/last
export const getLastReadingByMeter = createAction(
  '[Reading] Load Last Reading By Meter',
  props<{ meterId: string }>()
);

export const getLastReadingByMeterSuccess = createAction(
  '[Reading] Load Last Reading By Meter Success',
  props<{ reading: IReading }>()
);

export const getLastReadingByMeterFailure = createAction(
  '[Reading] Load Last Reading By Meter Failure',
  props<{ error: any }>()
);

// GET readings/count
export const loadReadingsCount = createAction(
  '[Reading] Load Readings Count'
);

export const loadReadingsCountSuccess = createAction(
  '[Reading] Load Readings Count Success',
  props<{ count: number }>()
);

export const loadReadingsCountFailure = createAction(
  '[Reading] Load Readings Count Failure',
  props<{ error: any }>()
);

// GET readings/client/{clientId}/last
export const getLastReadingByClient = createAction(
  '[Reading] Load Last Reading By Client',
  props<{ clientId: string }>()
);

export const getLastReadingByClientSuccess = createAction(
  '[Reading] Load Last Reading By Client Success',
  props<{ reading: IReading }>()
);

export const getLastReadingByClientFailure = createAction(
  '[Reading] Load Last Reading By Client Failure',
  props<{ error: any }>()
);

// GET reading/by-state
export const getReadingByStatus = createAction(
  '[Reading] Load Last Reading By Status',
  props<{ state: string }>()
);

export const getReadingByStatusSuccess = createAction(
  '[Reading] Load Last Reading By Status Success',
  props<{ readings: IReading[] }>()
);

export const getReadingByStatusFailure = createAction(
  '[Reading] Load Last Reading By Status Failure',
  props<{ error: any }>()
);

export const resetReadingActions = createAction(
  '[Reading] Reset all actions'
)

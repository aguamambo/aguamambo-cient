import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IReading } from '../../models/reading'; // Adjust the import to match your model's path
import { Action, createReducer, on } from '@ngrx/store';
import {
  getReading,
  getReadingSuccess,
  getReadingFailure,
  listAllReadings,
  listAllReadingsSuccess,
  listAllReadingsFailure,
  createReading,
  createReadingSuccess,
  createReadingFailure,
  updateReading,
  updateReadingSuccess,
  updateReadingFailure,
  deleteReading,
  deleteReadingSuccess,
  deleteReadingFailure,
  getLastReadingByMeter,
  getLastReadingByMeterSuccess,
  getLastReadingByMeterFailure,
  loadReadingsCount,
  loadReadingsCountSuccess,
  loadReadingsCountFailure,
  getLastReadingByClient,
  getLastReadingByClientSuccess,
  getLastReadingByClientFailure,
  getReadingByClientId,
  getReadingByClientIdFailure,
  getReadingByClientIdSuccess,
  getReadingByMeterId,
  getReadingByMeterIdFailure,
  getReadingByMeterIdSuccess,
} from '../actions/reading.actions';
import { Update } from '@ngrx/entity';

export interface IReadingState extends EntityState<IReading> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedReading: IReading | null;
  selectedReadings: IReading[];  // New selectedReadings property
  lastMeterReading: IReading | null;
  lastClientReading: IReading | null;
  readingCount: number;
}

export const adapter: EntityAdapter<IReading> = createEntityAdapter<IReading>();
export const initialState: IReadingState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedReading: null,
  selectedReadings: [],   
  lastMeterReading: null,
  lastClientReading: null,
  readingCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get reading by ID
  on(getReading, (state) => ({ ...state, isLoading: true })),
  on(getReadingSuccess, (state, { reading }) => ({
    ...state,
    selectedReading: reading,
    isLoading: false,
  })),
  on(getReadingFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get reading by ID
  on(getReadingByMeterId, (state) => ({ ...state, isLoading: true })),
  on(getReadingByMeterIdSuccess, (state, { readings }) => ({
    ...state,
    selectedReadings: readings,
    isLoading: false,
  })),
  on(getReadingByMeterIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get reading by ID
  on(getReadingByClientId, (state) => ({ ...state, isLoading: true })),
  on(getReadingByClientIdSuccess, (state, { readings }) => ({
    ...state,
    selectedReadings: readings,
    isLoading: false,
  })),
  on(getReadingByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all readings
  on(listAllReadings, (state) => ({ ...state, isLoading: true })),
  on(listAllReadingsSuccess, (state, { readings }) =>
    ({ ...state, selectedReadings: readings, isLoading: false })
  ),
  on(listAllReadingsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create reading
  on(createReading, (state) => ({ ...state, isSaving: true })),
  on(createReadingSuccess, (state, { reading }) =>
    adapter.addOne(reading, { ...state, isSaving: false, successMessage: 'Reading created successfully!' })
  ),
  on(createReadingFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update reading
  on(updateReading, (state) => ({ ...state, isSaving: true })),
  on(updateReadingSuccess, (state, { reading }) =>
    adapter.updateOne(
      { id: reading.readingId, changes: reading },
      { ...state, isSaving: false, successMessage: 'Reading updated successfully!' }
    )
  ),
  on(updateReadingFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete reading
  on(deleteReading, (state) => ({ ...state, isLoading: true })),
  on(deleteReadingSuccess, (state, { readingId }) =>
    adapter.removeOne(readingId, { ...state, isLoading: false, successMessage: 'Reading deleted successfully!' })
  ),
  on(deleteReadingFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Load last reading by meter
  on(getLastReadingByMeter, (state) => ({ ...state, isLoading: true })),
  on(getLastReadingByMeterSuccess, (state, { reading }) => ({
    ...state,
    lastMeterReading: reading,
    isLoading: false,
  })),
  on(getLastReadingByMeterFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Load readings count
  on(loadReadingsCount, (state) => ({ ...state, isLoading: true })),
  on(loadReadingsCountSuccess, (state, { count }) => ({
    ...state,
    readingCount: count,
    isLoading: false,
  })),
  on(loadReadingsCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Load last reading by client
  on(getLastReadingByClient, (state) => ({ ...state, isLoading: true })),
  on(getLastReadingByClientSuccess, (state, { reading }) => ({
    ...state,
    lastClientReading: reading,
    isLoading: false,
  })),
  on(getLastReadingByClientFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

);

export function readingReducer(
  state: IReadingState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllReadings,
  selectEntities: selectReadingEntities,
  selectIds: selectReadingIds,
  selectTotal: selectTotalReadings,
} = adapter.getSelectors();
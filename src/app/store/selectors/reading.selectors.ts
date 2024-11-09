import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IReadingState } from '../reducers/reading.reducers';

export const selectReadingState = createFeatureSelector<IReadingState>('reading');

export const selectSelectedReadings = createSelector(
  selectReadingState,
  (state) => state.selectedReadings
);

export const selectSelectedReading = createSelector(
  selectReadingState,
  (state) => state.selectedReading
);

export const selectSelectedMeterReading = createSelector(
  selectReadingState,
  (state) => state.lastMeterReading
);

export const selectReadingIsLoading = createSelector(
  selectReadingState,
  (state) => state.isLoading
);

export const selectReadingStatusCode = createSelector(
  selectReadingState,
  (state) => state.statusCode
);

export const selectReadingId = createSelector(
  selectReadingState,
  (state) => state.readingId
);

export const selectReadingIsSaving = createSelector(
  selectReadingState,
  (state) => state.isSaving
);

export const selectReadingErrorMessage = createSelector(
  selectReadingState,
  (state) => state.errorMessage
);

export const selectReadingSuccessMessage = createSelector(
  selectReadingState,
  (state) => state.successMessage
);

export const selectReadingCount = createSelector(
  selectReadingState,
  (state) => state.readingCount
);

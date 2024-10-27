import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IZoneState } from '../reducers/zone.reducers';

export const selectZoneState = createFeatureSelector<IZoneState>('zone');

export const selectSelectedZones = createSelector(
  selectZoneState,
  (state) => state.selectedZones
);

export const selectSelectedZone = createSelector(
  selectZoneState,
  (state) => state.selectedZone
);

export const selectZoneIsLoading = createSelector(
  selectZoneState,
  (state) => state.isLoading
);

export const selectZoneIsSaving = createSelector(
  selectZoneState,
  (state) => state.isSaving
);

export const selectZoneErrorMessage = createSelector(
  selectZoneState,
  (state) => state.errorMessage
);

export const selectZoneSuccessMessage = createSelector(
  selectZoneState,
  (state) => state.successMessage
);

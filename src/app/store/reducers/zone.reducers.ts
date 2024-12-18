import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IZone } from '../../models/zone'; 
import { Action, createReducer, on } from '@ngrx/store';
import {
  getZone,
  getZoneSuccess,
  getZoneFailure,
  listAllZones,
  listAllZonesSuccess,
  listAllZonesFailure,
  createZone,
  createZoneSuccess,
  createZoneFailure,
  updateZone,
  updateZoneSuccess,
  updateZoneFailure,
  deleteZone,
  deleteZoneSuccess,
  deleteZoneFailure,
  loadZonesCount,
  loadZonesCountSuccess,
  loadZonesCountFailure,
  getZoneByEnterpriseId,
  getZoneByEnterpriseIdFailure,
  getZoneByEnterpriseIdSuccess,
  resetZonesActions,
} from '../actions/zone.actions';
import { Update } from '@ngrx/entity';

export interface IZoneState extends EntityState<IZone> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedZone: IZone | null;
  selectedZones: IZone[] | null;
  ZoneCount: number;
}

export const adapter: EntityAdapter<IZone> = createEntityAdapter<IZone>();

export const initialState: IZoneState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedZone: null,
  selectedZones: null,
  ZoneCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get Zone by ID
  on(getZone, (state) => ({ ...state, isLoading: true })),
  on(getZoneSuccess, (state, { zone }) => ({
    ...state,
    selectedZone: zone,
    isLoading: false,
  })),
  on(getZoneFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

// Get Zone by Enterprise ID
  on(getZoneByEnterpriseId, (state) => ({ ...state, isLoading: true })),
  on(getZoneByEnterpriseIdSuccess, (state, { zones }) => ({
    ...state,
    selectedZones: zones,
    isLoading: false,
  })),
  
  on(getZoneByEnterpriseIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all Zones
  on(listAllZones, (state) => ({ ...state, isLoading: true })),
  on(listAllZonesSuccess, (state, { zones }) => ({ 
    ...state,
    selectedZones: zones, 
    isLoading: false })
  ),
  on(listAllZonesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create Zone
  on(createZone, (state) => ({ ...state, isSaving: true })),
  on(createZoneSuccess, (state, { zone }) =>
    ({ ...state, isSaving: false, selectedZone: zone, successMessage: 'Zone created successfully!' })
  ),
  on(createZoneFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update Zone
  on(updateZone, (state) => ({ ...state, isSaving: true })),
  on(updateZoneSuccess, (state, { zone }) =>
    adapter.updateOne(
      { id: zone.zoneId, changes: zone },
      { ...state, isSaving: false, successMessage: 'Zone updated successfully!' }
    )
  ),
  on(updateZoneFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete Zone
  on(deleteZone, (state) => ({ ...state, isLoading: true })),
  on(deleteZoneSuccess, (state, { zoneId }) =>
    adapter.removeOne(zoneId, { ...state, isLoading: false, successMessage: 'Zone deleted successfully!' })
  ),
  on(deleteZoneFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Load Zones count
  on(loadZonesCount, (state) => ({ ...state, isLoading: true })),
  on(loadZonesCountSuccess, (state, { count }) => ({
    ...state,
    ZoneCount: count,
    isLoading: false,
  })),
  on(loadZonesCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),
  
  on(resetZonesActions, () => initialState)
);

export function zoneReducer(
  state: IZoneState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllZones,
  selectEntities: selectZoneEntities,
  selectIds: selectZoneIds,
  selectTotal: selectTotalZones,
} = adapter.getSelectors();

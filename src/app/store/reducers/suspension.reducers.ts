import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ISuspension } from '../../models/suspension'; 
import { Action, createReducer, on } from '@ngrx/store';
import {
  getSuspension,
  getSuspensionSuccess,
  getSuspensionFailure,
  listAllSuspensions,
  listAllSuspensionsSuccess,
  listAllSuspensionsFailure,
  createSuspension,
  createSuspensionSuccess,
  createSuspensionFailure,
  updateSuspension,
  updateSuspensionSuccess,
  updateSuspensionFailure,
  deleteSuspension,
  deleteSuspensionSuccess,
  deleteSuspensionFailure,
  loadSuspensionsCount,
  loadSuspensionsCountSuccess,
  loadSuspensionsCountFailure,
  getSuspensionByClientId,
  getSuspensionByClientIdFailure,
  getSuspensionByClientIdSuccess,
  resetSuspensionActions,
} from '../actions/suspension.actions';
import { Update } from '@ngrx/entity';

export interface ISuspensionState extends EntityState<ISuspension> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedSuspension: ISuspension | null;
  selectedSuspensions: ISuspension[] | null;
  SuspensionCount: number;
}

export const adapter: EntityAdapter<ISuspension> = createEntityAdapter<ISuspension>();

export const initialState: ISuspensionState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedSuspension: null,
  selectedSuspensions: null,
  SuspensionCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get Suspension by ID
  on(getSuspension, (state) => ({ ...state, isLoading: true })),
  on(getSuspensionSuccess, (state, { suspension }) => ({
    ...state,
    selectedSuspension: suspension,
    isLoading: false,
  })),
  on(getSuspensionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get Suspension by ID
  on(getSuspensionByClientId, (state) => ({ ...state, isLoading: true })),
  on(getSuspensionByClientIdSuccess, (state, { suspensions }) => ({
    ...state,
    selectedSuspensions: suspensions,
    isLoading: false,
  })),
  on(getSuspensionByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all Suspensions
  on(listAllSuspensions, (state) => ({ ...state, isLoading: true })),
  on(listAllSuspensionsSuccess, (state, { suspensions }) => ({
    ...state,
    selectedSuspensions: suspensions,
    isLoading: false,
  })),
  on(listAllSuspensionsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create Suspension
  on(createSuspension, (state) => ({ ...state, isSaving: true })),
  on(createSuspensionSuccess, (state, { suspension }) =>
    adapter.addOne(suspension, { ...state, isSaving: false, successMessage: 'Suspension created successfully!' })
  ),
  on(createSuspensionFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update Suspension
  on(updateSuspension, (state) => ({ ...state, isSaving: true })),
  on(updateSuspensionSuccess, (state, { suspension }) =>
    adapter.updateOne(
      { id: suspension.suspensionId, changes: suspension },
      { ...state, isSaving: false, successMessage: 'Suspension updated successfully!' }
    )
  ),
  on(updateSuspensionFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete Suspension
  on(deleteSuspension, (state) => ({ ...state, isLoading: true })),
  on(deleteSuspensionSuccess, (state, { suspensionId }) =>
    adapter.removeOne(suspensionId, { ...state, isLoading: false, successMessage: 'Suspension deleted successfully!' })
  ),
  on(deleteSuspensionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Load Suspensions count
  on(loadSuspensionsCount, (state) => ({ ...state, isLoading: true })),
  on(loadSuspensionsCountSuccess, (state, { count }) => ({
    ...state,
    SuspensionCount: count,
    isLoading: false,
  })),
  on(loadSuspensionsCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),
  
  on(resetSuspensionActions, () => initialState)
);

export function suspensionReducer(
  state: ISuspensionState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllSuspensions,
  selectEntities: selectSuspensionEntities,
  selectIds: selectSuspensionIds,
  selectTotal: selectTotalSuspensions,
} = adapter.getSelectors();

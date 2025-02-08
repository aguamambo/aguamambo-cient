import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IRubric } from '../../models/rubric'; // Adjust the import to match your model's path
import { Action, createReducer, on } from '@ngrx/store';
import {
  getRubric,
  getRubricSuccess,
  getRubricFailure,
  listAllRubrics,
  listAllRubricsSuccess,
  listAllRubricsFailure,
  createRubric,
  createRubricSuccess,
  createRubricFailure,
  updateRubric,
  updateRubricSuccess,
  updateRubricFailure,
  deleteRubric,
  deleteRubricSuccess,
  deleteRubricFailure,
  getLastRubricByMeter,
  getLastRubricByMeterSuccess,
  getLastRubricByMeterFailure,
  loadRubricsCount,
  loadRubricsCountSuccess,
  loadRubricsCountFailure,
  getLastRubricByClient,
  getLastRubricByClientSuccess,
  getLastRubricByClientFailure,
  getRubricByClientId,
  getRubricByClientIdFailure,
  getRubricByClientIdSuccess,
  getRubricByMeterId,
  getRubricByMeterIdFailure,
  getRubricByMeterIdSuccess,
  resetRubricActions,
} from '../actions/rubric.actions';
import { Update } from '@ngrx/entity';

export interface IRubricState extends EntityState<IRubric> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedRubric: IRubric | null;
  selectedRubrics: IRubric[];  // New selectedRubrics property
  lastMeterRubric: IRubric | null;
  lastClientRubric: IRubric | null;
  rubricCount: number;
}

export const adapter: EntityAdapter<IRubric> = createEntityAdapter<IRubric>();
export const initialState: IRubricState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedRubric: null,
  selectedRubrics: [],   
  lastMeterRubric: null,
  lastClientRubric: null,
  rubricCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get rubric by ID
  on(getRubric, (state) => ({ ...state, isLoading: true })),
  on(getRubricSuccess, (state, { rubric }) => ({
    ...state,
    selectedRubric: rubric,
    isLoading: false,
  })),
  on(getRubricFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Get rubric by ID
  on(getRubricByMeterId, (state) => ({ ...state, isLoading: true })),
  on(getRubricByMeterIdSuccess, (state, { rubrics }) => ({
    ...state,
    selectedRubrics: rubrics,
    isLoading: false,
  })),
  on(getRubricByMeterIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Get rubric by ID
  on(getRubricByClientId, (state) => ({ ...state, isLoading: true })),
  on(getRubricByClientIdSuccess, (state, { rubrics }) => ({
    ...state,
    selectedRubrics: rubrics,
    isLoading: false,
  })),
  on(getRubricByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // List all rubrics
  on(listAllRubrics, (state) => ({ ...state, isLoading: true })),
  on(listAllRubricsSuccess, (state, { rubrics }) =>
    ({ ...state, selectedRubrics: rubrics, isLoading: false })
  ),
  on(listAllRubricsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Create rubric
  on(createRubric, (state) => ({ ...state, isSaving: true })),
  on(createRubricSuccess, (state, { rubric }) =>
    adapter.addOne(rubric, { ...state, isSaving: false, successMessage: 'Rubric created successfully!' })
  ),
  on(createRubricFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error.error,
  })),

  // Update rubric
  on(updateRubric, (state) => ({ ...state, isSaving: true })),
  on(updateRubricSuccess, (state, { rubric }) =>
     (
      { ...state, isSaving: false, selectedRubric: rubric, successMessage: 'Rubric updated successfully!' }
    )
  ),
  on(updateRubricFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error.error,
  })),

  // Delete rubric
  on(deleteRubric, (state) => ({ ...state, isLoading: true })),
  on(deleteRubricSuccess, (state, { rubricId }) =>
    adapter.removeOne(rubricId, { ...state, isLoading: false, successMessage: 'Rubric deleted successfully!' })
  ),
  on(deleteRubricFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Load last rubric by meter
  on(getLastRubricByMeter, (state) => ({ ...state, isLoading: true })),
  on(getLastRubricByMeterSuccess, (state, { rubric }) => ({
    ...state,
    lastMeterRubric: rubric,
    isLoading: false,
  })),
  on(getLastRubricByMeterFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Load rubrics count
  on(loadRubricsCount, (state) => ({ ...state, isLoading: true })),
  on(loadRubricsCountSuccess, (state, { count }) => ({
    ...state,
    rubricCount: count,
    isLoading: false,
  })),
  on(loadRubricsCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),

  // Load last rubric by client
  on(getLastRubricByClient, (state) => ({ ...state, isLoading: true })),
  on(getLastRubricByClientSuccess, (state, { rubric }) => ({
    ...state,
    lastClientRubric: rubric,
    isLoading: false,
  })),
  on(getLastRubricByClientFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error,
  })),
  
  on(resetRubricActions, () => initialState)

);

export function rubricReducer(
  state: IRubricState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll 
} = adapter.getSelectors();

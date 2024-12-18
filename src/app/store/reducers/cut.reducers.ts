// cut.reducer.ts
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { ICut } from "../../models/cut"; // Adjust the import to match your model's path
import { Action, createReducer, on } from "@ngrx/store";
import {
  getCut,
  getCutSuccess,
  getCutFailure,
  listAllCuts,
  listAllCutsSuccess,
  listAllCutsFailure,
  createCut,
  createCutSuccess,
  createCutFailure,
  updateCut,
  updateCutSuccess,
  updateCutFailure,
  deleteCut,
  deleteCutSuccess,
  deleteCutFailure,
  loadCutsCount,
  loadCutsCountSuccess,
  loadCutsCountFailure,
  getCutByClientId,
  getCutByClientIdFailure,
  getCutByClientIdSuccess
} from "../actions/cut.actions";
import { Update } from "@ngrx/entity";

export interface ICutState extends EntityState<ICut> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedCut: ICut | null;
  selectedCuts: ICut[] | null;
  cutsCount: number;
}

export const adapter: EntityAdapter<ICut> = createEntityAdapter<ICut>();
export const initialState: ICutState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedCut: null,
  selectedCuts: null,
  cutsCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get cut by ID
  on(getCut, (state) => ({ ...state, isLoading: true })),
  on(getCutSuccess, (state, { cut }) => ({
    ...state,
    selectedCut: cut,
    isLoading: false,
  })),
  on(getCutFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })), 
  
  // Get cut by ID
  on(getCutByClientId, (state) => ({ ...state, isLoading: true })),
  on(getCutByClientIdSuccess, (state, { cuts }) => ({
    ...state,
    selectedCuts: cuts,
    isLoading: false,
  })),
  on(getCutByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all cuts
  on(listAllCuts, (state) => ({ ...state, isLoading: true })),
  on(listAllCutsSuccess, (state, { cuts }) =>
    ( { ...state, selectedCuts: cuts,isLoading: false })
  ),
  on(listAllCutsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create cut
  on(createCut, (state) => ({ ...state, isSaving: true })),
  on(createCutSuccess, (state, { cut }) =>
    ( { ...state, isSaving: false, selectedCut: cut, successMessage: 'Cut created successfully!' })
  ),
  on(createCutFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update cut
  on(updateCut, (state) => ({ ...state, isSaving: true })),
  on(updateCutSuccess, (state, { cut }) =>
   ( 
      { ...state, isSaving: false, selectedCut: cut, successMessage: 'Cut updated successfully!' }
    )
  ),
  on(updateCutFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete cut
  on(deleteCut, (state) => ({ ...state, isLoading: true })),
  on(deleteCutSuccess, (state, { cutId }) =>
    adapter.removeOne(cutId, { ...state, isLoading: false, successMessage: 'Cut deleted successfully!' })
  ),
  on(deleteCutFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get cuts count
  on(loadCutsCount, (state) => ({ ...state, isLoading: true })),
  on(loadCutsCountSuccess, (state, { count }) => ({
    ...state,
    cutsCount: count,
    isLoading: false,
  })),
  on(loadCutsCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  }))
);

export function cutReducer(state: ICutState | undefined, action: Action) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllCuts,
  selectEntities: selectCutEntities,
  selectIds: selectCutIds,
  selectTotal: selectTotalCuts,
} = adapter.getSelectors();

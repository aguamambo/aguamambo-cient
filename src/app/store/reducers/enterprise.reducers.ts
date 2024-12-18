// enterprise.reducer.ts
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { IEnterprise } from "../../models/enterprise"; // Adjust the import to match your model's path
import { Action, createReducer, on } from "@ngrx/store";
import {
  getEnterprise,
  getEnterpriseSuccess,
  getEnterpriseFailure,
  listAllEnterprises,
  listAllEnterprisesSuccess,
  listAllEnterprisesFailure,
  createEnterprise,
  createEnterpriseSuccess,
  createEnterpriseFailure,
  updateEnterprise,
  updateEnterpriseSuccess,
  updateEnterpriseFailure,
  deleteEnterprise,
  deleteEnterpriseSuccess,
  deleteEnterpriseFailure,
  loadEnterprisesCount,
  loadEnterprisesCountSuccess,
  loadEnterprisesCountFailure,
  resetEnterpriseActions
} from "../actions/enterprise.actions";
import { Update } from "@ngrx/entity";

export interface IEnterpriseState extends EntityState<IEnterprise> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedEnterprise: IEnterprise | null;
  selectedEnterprises: IEnterprise[] | null;
  enterprisesCount: number;
}

export const adapter: EntityAdapter<IEnterprise> = createEntityAdapter<IEnterprise>();
export const initialState: IEnterpriseState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedEnterprise: null,
  selectedEnterprises: null,
  enterprisesCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get enterprise by ID
  on(getEnterprise, (state) => ({ ...state, isLoading: true })),
  on(getEnterpriseSuccess, (state, { enterprise }) => ({
    ...state,
    selectedEnterprise: enterprise,
    isLoading: false,
  })),
  on(getEnterpriseFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all enterprises
  on(listAllEnterprises, (state) => ({ ...state, isLoading: true })),
  on(listAllEnterprisesSuccess, (state, { enterprises }) => ({ ...state, selectedEnterprises: enterprises, isLoading: false })
  ),
  on(listAllEnterprisesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create enterprise
  on(createEnterprise, (state) => ({ ...state, isSaving: true })),
  on(createEnterpriseSuccess, (state, { enterprise }) =>
    ({ ...state, selectedEnterprise: enterprise, isSaving: false, successMessage: 'Enterprise created successfully!' })
  ),
  on(createEnterpriseFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update enterprise
  on(updateEnterprise, (state) => ({ ...state, isSaving: true })),

  on(updateEnterpriseSuccess, (state, { enterprise }) => (
      { ...state,
         isSaving: false, 
         selectedEnterprise: enterprise,
         successMessage: 'Enterprise updated successfully!' }
    )
  ),
  
  on(updateEnterpriseFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete enterprise
  on(deleteEnterprise, (state) => ({ ...state, isLoading: true })),
  on(deleteEnterpriseSuccess, (state, { enterpriseId }) =>
   ({ ...state, isLoading: false,
      enterpriseId,
     successMessage: 'Enterprise deleted successfully!' })
  ),
  on(deleteEnterpriseFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get enterprises count
  on(loadEnterprisesCount, (state) => ({ ...state, isLoading: true })),
  on(loadEnterprisesCountSuccess, (state, { count }) => ({
    ...state,
    enterprisesCount: count,
    isLoading: false,
  })),
  on(loadEnterprisesCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),
  
  on(resetEnterpriseActions, () => initialState)
);

export function enterpriseReducer(state: IEnterpriseState | undefined, action: Action) {
  return reducer(state, action);
}

export const {
  selectAll
} = adapter.getSelectors();

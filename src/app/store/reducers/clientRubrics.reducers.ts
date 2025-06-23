import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { Action, createReducer, on } from "@ngrx/store";
import {
  getClientRubric,
  getClientRubricSuccess,
  getClientRubricFailure,
  listAllClientRubrics,
  listAllClientRubricsSuccess,
  listAllClientRubricsFailure,
  createClientRubric,
  createClientRubricSuccess,
  createClientRubricFailure,
  updateClientRubric,
  updateClientRubricSuccess,
  updateClientRubricFailure,
  deleteClientRubric,
  deleteClientRubricSuccess,
  deleteClientRubricFailure,
  resetClientRubricActions,
  getClientRubricsByClientId,
  getClientRubricsByClientIdSuccess,
  getClientRubricsByClientIdFailure
} from "../actions/clientRubrics.actions";
import { Error } from "src/app/models/error";
import { IClientRubric } from "src/app/models/rubric";

export interface IClientRubricState extends EntityState<IClientRubric> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  statusCode: number;
  successMessage: string;
  clientRubricError: Error| null;
  selectedClientRubric: IClientRubric | null;
  selectedClientRubrics: IClientRubric[] | null;
  clientRubricCount: number;
}

export const adapter: EntityAdapter<IClientRubric> = createEntityAdapter<IClientRubric>();
export const initialState: IClientRubricState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  statusCode: 0,
  clientRubricError: null,
  selectedClientRubric: null,
  selectedClientRubrics: null,
  clientRubricCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get clientRubric by ID
  on(getClientRubric, (state) => ({ ...state, isLoading: true })),
  on(getClientRubricSuccess, (state, { clientRubric }) => ({
    ...state,
    selectedClientRubric: clientRubric,
    isLoading: false,
  })),
  on(getClientRubricFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    clientRubricError: error
  })),
  
  // Get clientRubric by Client ID
  on(getClientRubricsByClientId, (state) => ({ ...state, isLoading: true })),
  on(getClientRubricsByClientIdSuccess, (state, { clientRubrics }) => ({
    ...state,
    selectedClientRubrics: clientRubrics,
    isLoading: false,
  })),
  on(getClientRubricsByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    clientRubricError: error
  })),
  

  // List all clientRubrics
  on(listAllClientRubrics, (state) => ({ ...state, isLoading: true })),
  on(listAllClientRubricsSuccess, (state, { clientRubrics }) =>
    ({ ...state, selectedClientRubrics: clientRubrics, isLoading: false })
  ),
  on(listAllClientRubricsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    clientRubricError: error
  })),

  // Create clientRubric
  on(createClientRubric, (state) => ({ ...state, isSaving: true })),
  on(createClientRubricSuccess, (state, { clientRubric, statusCode }) =>
    ({ ...state, 
      isSaving: false, 
      selectedClientRubric: clientRubric, 
      statusCode: statusCode,
      successMessage: 'ClientRubric created successfully!' })
  ),
  on(createClientRubricFailure, (state, { error, statusCode }) => ({
    ...state,
    isSaving: false,
    statusCode: statusCode,
    clientRubricError: error
  })),

  // Update clientRubric
  on(updateClientRubric, (state) => ({ ...state, isSaving: true })),
  on(updateClientRubricSuccess, (state, { clientRubric }) =>
    ( 
      { ...state, isSaving: false, selectedClientRubric: clientRubric, successMessage: 'ClientRubric updated successfully!' }
    )
  ),
  on(updateClientRubricFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    clientRubricError: error
  })),

  // Delete clientRubric
  on(deleteClientRubric, (state) => ({ ...state, isLoading: true })),
  on(deleteClientRubricSuccess, (state, { clientRubricId }) =>
    adapter.removeOne(clientRubricId, { ...state, isLoading: false, successMessage: 'ClientRubric deleted successfully!' })
  ),
  on(deleteClientRubricFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    clientRubricError: error
  })),

 
  
  on(resetClientRubricActions, () => initialState)
);

export function clientRubricReducer(state: IClientRubricState | undefined, action: Action) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllClientRubrics,
  selectEntities: selectClientRubricEntities,
  selectIds: selectClientRubricIds,
  selectTotal: selectTotalClientRubrics,
} = adapter.getSelectors();

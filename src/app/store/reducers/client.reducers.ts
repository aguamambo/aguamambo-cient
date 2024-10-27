import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { IClient } from "../../models/client"; // Adjust the import to match your model's path
import { Action, createReducer, on } from "@ngrx/store";
import {
  getClient,
  getClientSuccess,
  getClientFailure,
  listAllClients,
  listAllClientsSuccess,
  listAllClientsFailure,
  createClient,
  createClientSuccess,
  createClientFailure,
  updateClient,
  updateClientSuccess,
  updateClientFailure,
  deleteClient,
  deleteClientSuccess,
  deleteClientFailure,
  loadClientsCount,
  loadClientsCountSuccess,
  loadClientsCountFailure,
  getClientByZoneId,
  getClientByZoneIdFailure,
  getClientByZoneIdSuccess,
  getClientByContractTypeId,
  getClientByContractTypeIdFailure,
  getClientByContractTypeIdSuccess
} from "../actions/client.actions";
import { Update } from "@ngrx/entity";

export interface IClientState extends EntityState<IClient> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedClient: IClient | null;
  selectedClients: IClient[] | null;
  clientCount: number;
}

export const adapter: EntityAdapter<IClient> = createEntityAdapter<IClient>();
export const initialState: IClientState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedClient: null,
  selectedClients: null,
  clientCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get client by ID
  on(getClient, (state) => ({ ...state, isLoading: true })),
  on(getClientSuccess, (state, { client }) => ({
    ...state,
    selectedClient: client,
    isLoading: false,
  })),
  on(getClientFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get client by ZoneId
  on(getClientByZoneId, (state) => ({ ...state, isLoading: true })),
  on(getClientByZoneIdSuccess, (state, { clients }) => ({
    ...state,
    selectedClients: clients,
    isLoading: false,
  })),
  on(getClientByZoneIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get client by ZoneId
  on(getClientByContractTypeId, (state) => ({ ...state, isLoading: true })),
  on(getClientByContractTypeIdSuccess, (state, { clients }) => ({
    ...state,
    selectedClients: clients,
    isLoading: false,
  })),
  on(getClientByContractTypeIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all clients
  on(listAllClients, (state) => ({ ...state, isLoading: true })),
  on(listAllClientsSuccess, (state, { clients }) =>
    ({ ...state, selectedClients: clients, isLoading: false })
  ),
  on(listAllClientsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create client
  on(createClient, (state) => ({ ...state, isSaving: true })),
  on(createClientSuccess, (state, { client }) =>
    adapter.addOne(client, { ...state, isSaving: false, successMessage: 'Client created successfully!' })
  ),
  on(createClientFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update client
  on(updateClient, (state) => ({ ...state, isSaving: true })),
  on(updateClientSuccess, (state, { client }) =>
    adapter.updateOne(
      { id: client.clientId, changes: client },
      { ...state, isSaving: false, successMessage: 'Client updated successfully!' }
    )
  ),
  on(updateClientFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete client
  on(deleteClient, (state) => ({ ...state, isLoading: true })),
  on(deleteClientSuccess, (state, { clientId }) =>
    adapter.removeOne(clientId, { ...state, isLoading: false, successMessage: 'Client deleted successfully!' })
  ),
  on(deleteClientFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get client count
  on(loadClientsCount, (state) => ({ ...state, isLoading: true })),
  on(loadClientsCountSuccess, (state, { count }) => ({
    ...state,
    clientCount: count,
    isLoading: false,
  })),
  on(loadClientsCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  }))
);

export function clientReducer(state: IClientState | undefined, action: Action) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllClients,
  selectEntities: selectClientEntities,
  selectIds: selectClientIds,
  selectTotal: selectTotalClients,
} = adapter.getSelectors();

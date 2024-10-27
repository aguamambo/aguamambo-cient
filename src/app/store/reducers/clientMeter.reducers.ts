import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { IClientMeter } from "../../models/clientMeter"; // Adjust the import to match your model's path
import { Action, createReducer, on } from "@ngrx/store";
import {
  getClientMeter,
  getClientMeterSuccess,
  getClientMeterFailure,
  listAllClientMeters,
  listAllClientMetersSuccess,
  listAllClientMetersFailure,
  createClientMeter,
  createClientMeterSuccess,
  createClientMeterFailure,
  updateClientMeter,
  updateClientMeterSuccess,
  updateClientMeterFailure,
  deleteClientMeter,
  deleteClientMeterSuccess,
  deleteClientMeterFailure,
  loadClientMetersCount,
  loadClientMetersCountSuccess,
  loadClientMetersCountFailure,
  getClientMeterByClientId,
  getClientMeterByClientIdFailure,
  getClientMeterByClientIdSuccess
} from "../actions/clientMeter.actions";
import { Update } from "@ngrx/entity";

export interface IClientMeterState extends EntityState<IClientMeter> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedClientMeter: IClientMeter | null;
  selectedClientMeters: IClientMeter[] | null;
  clientMeterCount: number;
}

export const adapter: EntityAdapter<IClientMeter> = createEntityAdapter<IClientMeter>();
export const initialState: IClientMeterState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedClientMeter: null,
  selectedClientMeters: null,
  clientMeterCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get clientMeter by ID
  on(getClientMeter, (state) => ({ ...state, isLoading: true })),
  on(getClientMeterSuccess, (state, { clientMeter }) => ({
    ...state,
    selectedClientMeter: clientMeter,
    isLoading: false,
  })),
  on(getClientMeterFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get clientMeter by ID
  on(getClientMeterByClientId, (state) => ({ ...state, isLoading: true })),
  on(getClientMeterByClientIdSuccess, (state, { clientMeters }) => ({
    ...state,
    selectedClientMeters: clientMeters,
    isLoading: false,
  })),
  on(getClientMeterByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all clientMeters
  on(listAllClientMeters, (state) => ({ ...state, isLoading: true })),
  on(listAllClientMetersSuccess, (state, { clientMeters }) =>
    adapter.setAll(clientMeters, { ...state, isLoading: false })
  ),
  on(listAllClientMetersFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create clientMeter
  on(createClientMeter, (state) => ({ ...state, isSaving: true })),
  on(createClientMeterSuccess, (state, { clientMeter }) =>
    adapter.addOne(clientMeter, { ...state, isSaving: false, successMessage: 'ClientMeter created successfully!' })
  ),
  on(createClientMeterFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update clientMeter
  on(updateClientMeter, (state) => ({ ...state, isSaving: true })),
  on(updateClientMeterSuccess, (state, { clientMeter }) =>
    adapter.updateOne(
      { id: clientMeter.meterId, changes: clientMeter },
      { ...state, isSaving: false, successMessage: 'ClientMeter updated successfully!' }
    )
  ),
  on(updateClientMeterFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete clientMeter
  on(deleteClientMeter, (state) => ({ ...state, isLoading: true })),
  on(deleteClientMeterSuccess, (state, { meterId }) =>
    adapter.removeOne(meterId, { ...state, isLoading: false, successMessage: 'ClientMeter deleted successfully!' })
  ),
  on(deleteClientMeterFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Get clientMeter count
  on(loadClientMetersCount, (state) => ({ ...state, isLoading: true })),
  on(loadClientMetersCountSuccess, (state, { count }) => ({
    ...state,
    clientMeterCount: count,
    isLoading: false,
  })),
  on(loadClientMetersCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  }))
);

export function clientMeterReducer(state: IClientMeterState | undefined, action: Action) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllClientMeters,
  selectEntities: selectClientMeterEntities,
  selectIds: selectClientMeterIds,
  selectTotal: selectTotalClientMeters,
} = adapter.getSelectors();

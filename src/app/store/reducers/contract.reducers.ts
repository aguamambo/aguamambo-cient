// contract.reducer.ts
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { IContract } from "../../models/contract"; // Adjust the import to match your model's path
import { Action, createReducer, on } from "@ngrx/store";
import {
  getContract,
  getContractSuccess,
  getContractFailure,
  listAllContracts,
  listAllContractsSuccess,
  listAllContractsFailure,
  createContract,
  createContractSuccess,
  createContractFailure,
  updateContract,
  updateContractSuccess,
  updateContractFailure,
  deleteContract,
  deleteContractSuccess,
  deleteContractFailure,
  loadContractsCount,
  loadContractsCountSuccess,
  loadContractsCountFailure,
  getContractByClientId,
  getContractByClientIdFailure,
  getContractByClientIdSuccess,
  resetContractActions
} from "../actions/contract.actions"; 
import { Error } from "src/app/models/error";

export interface IContractState extends EntityState<IContract> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  contractError: Error | null;
  selectedContract: IContract | null;
  selectedContracts: IContract[] | null;
  contractsCount: number;
}

export const adapter: EntityAdapter<IContract> = createEntityAdapter<IContract>();
export const initialState: IContractState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  contractError: null,
  selectedContract: null,
  selectedContracts: null,
  contractsCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get contract by ID
  on(getContract, (state) => ({ ...state, isLoading: true })),
  on(getContractSuccess, (state, { contract }) => ({
    ...state,
    selectedContract: contract,
    isLoading: false,
  })),
  on(getContractFailure, (state, { error }) => ({
    ...state,
    isLoading: false, 
    contractError: error
  })), 
  
  // Get contract by ID
  on(getContractByClientId, (state) => ({ ...state, isLoading: true })),
  on(getContractByClientIdSuccess, (state, { contracts }) => ({
    ...state,
    selectedContracts: contracts,
    isLoading: false,
  })),
  on(getContractByClientIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false, 
    contractError: error
  })),

  // List all contracts
  on(listAllContracts, (state) => ({ ...state, isLoading: true })),
  on(listAllContractsSuccess, (state, { contracts }) =>
    ( { ...state, selectedContracts: contracts, isLoading: false })
  ),
  on(listAllContractsFailure, (state, { error }) => ({
    ...state,
    isLoading: false, 
    contractError: error
  })),

  // Create contract
  on(createContract, (state) => ({ ...state, isSaving: true })),
  on(createContractSuccess, (state, { contract }) =>
     ( { ...state, isSaving: false, selectedContract: contract, successMessage: 'Contract created successfully!' })
  ),
  on(createContractFailure, (state, { error }) => ({
    ...state,
    isSaving: false, 
    contractError: error
  })),

  // Update contract
  on(updateContract, (state) => ({ ...state, isSaving: true })),
  on(updateContractSuccess, (state, { contract }) =>
    ( 
      { ...state, isSaving: false,selectedContract : contract , successMessage: 'Contract updated successfully!' }
    )
  ),
  on(updateContractFailure, (state, { error }) => ({
    ...state,
    isSaving: false, 
    contractError: error
  })),

  // Delete contract
  on(deleteContract, (state) => ({ ...state, isLoading: true })),
  on(deleteContractSuccess, (state, { contractId }) =>
    adapter.removeOne(contractId, { ...state, isLoading: false, successMessage: 'Contract deleted successfully!' })
  ),
  on(deleteContractFailure, (state, { error }) => ({
    ...state,
    isLoading: false, 
    contractError: error
  })),

  // Get contracts count
  on(loadContractsCount, (state) => ({ ...state, isLoading: true })),
  on(loadContractsCountSuccess, (state, { count }) => ({
    ...state,
    contractsCount: count,
    isLoading: false,
  })),
  on(loadContractsCountFailure, (state, { error }) => ({
    ...state,
    isLoading: false, 
    contractError: error
  })),
  
  on(resetContractActions, () => initialState)
);

export function contractReducer(state: IContractState | undefined, action: Action) {
  return reducer(state, action);
}

export const {
  selectAll 
} = adapter.getSelectors();

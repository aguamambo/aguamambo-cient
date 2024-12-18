import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { Action, createReducer, on } from "@ngrx/store";
import {
    getContractType, getContractTypeSuccess, getContractTypeFailure,
    listAllContractTypes, listAllContractTypesSuccess, listAllContractTypesFailure,
    createContractType, createContractTypeSuccess, createContractTypeFailure,
    updateContractType, updateContractTypeSuccess, updateContractTypeFailure,
    deleteContractType, deleteContractTypeSuccess, deleteContractTypeFailure,
    loadContractTypesCount, loadContractTypesCountSuccess, loadContractTypesCountFailure,
    resetContractTypeActions
} from "../actions/contractType.actions";
import { IContractType } from "src/app/models/contractType";

// Contract Type state interface
export interface IContractTypeState extends EntityState<IContractType> {
    isLoading: boolean;
    isSaving: boolean;
    errorMessage: string;
    successMessage: string;
    error: any;
    selectedContractType: IContractType | null;
    selectedContractTypes: IContractType[] | null;
    totalContractTypesCount: number;
}

// Entity Adapter to manage the collection of contract types
export const adapter: EntityAdapter<IContractType> = createEntityAdapter<IContractType>();

// Initial state for the contract type store
export const initialState: IContractTypeState = adapter.getInitialState({
    isLoading: false,
    isSaving: false,
    errorMessage: '',
    successMessage: '',
    error: null,
    selectedContractType: null,
    selectedContractTypes: null,
    totalContractTypesCount: 0
});

// Contract type reducer using createReducer
const reducer = createReducer(
    initialState,
    
    // GET contract-type by ID
    on(getContractType, (state) => ({ ...state, isLoading: true })),
    on(getContractTypeSuccess, (state, { contractType }) => ({
        ...state,
        selectedContractType: contractType,
        isLoading: false
    })),
    on(getContractTypeFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        isLoading: false
    })),

    // GET list of contract-types
    on(listAllContractTypes, (state) => ({ ...state, isLoading: true })),
    on(listAllContractTypesSuccess, (state, { contractTypes }) =>
        ( { ...state,selectedContractTypes: contractTypes, isLoading: false })
    ),
    on(listAllContractTypesFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        isLoading: false
    })),

    // POST create contract-type
    on(createContractType, (state) => ({ ...state, isSaving: true })),
    on(createContractTypeSuccess, (state, { contractType }) =>
        adapter.addOne(contractType, { ...state, isSaving: false, successMessage: 'Contract type created successfully!' })
    ),
    on(createContractTypeFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        isSaving: false
    })),

    // PUT update contract-type
    on(updateContractType, (state) => ({ ...state, isSaving: true })),
    on(updateContractTypeSuccess, (state, { contractType }) =>
       ( { ...state, isSaving: false, selectedContractType: contractType, successMessage: 'Contract type updated successfully!' })
    ),
    on(updateContractTypeFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        isSaving: false
    })),

    // DELETE contract-type
    on(deleteContractType, (state) => ({ ...state, isLoading: true })),
    on(deleteContractTypeSuccess, (state, { contractTypeId }) =>
        adapter.removeOne(contractTypeId, { ...state, isLoading: false, successMessage: 'Contract type deleted successfully!' })
    ),
    on(deleteContractTypeFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        isLoading: false
    })),

    // GET contract-types count
    on(loadContractTypesCount, (state) => ({ ...state, isLoading: true })),
    on(loadContractTypesCountSuccess, (state, { count }) => ({
        ...state,
        totalContractTypesCount: count,
        isLoading: false
    })),
    on(loadContractTypesCountFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        isLoading: false
    })),
  
    on(resetContractTypeActions, () => initialState)
);

// Export the reducer function
export function contractTypeReducer(state: IContractTypeState | undefined, action: Action) {
    return reducer(state, action);
}

// Export adapter selectors for easy selection of contract types from the store
export const {
    selectAll: selectAllContractTypes,
    selectEntities: selectContractTypeEntities,
    selectIds: selectContractTypeIds,
    selectTotal: selectTotalContractTypes,
} = adapter.getSelectors();

import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IUser } from '../../models/user'; 
import { Action, createReducer, on } from '@ngrx/store';
import {
  getUser,
  getUserSuccess,
  getUserFailure,
  listAllUsers,
  listAllUsersSuccess,
  listAllUsersFailure,
  createUser,
  createUserSuccess,
  createUserFailure,
  updateUser,
  updateUserSuccess,
  updateUserFailure,
  deleteUser,
  deleteUserSuccess,
  deleteUserFailure,
  listAllRoles,
  listAllRolesFailure,
  listAllRolesSuccess
} from '../actions/user.actions';
import { Update } from '@ngrx/entity';

export interface IUserState extends EntityState<IUser> {
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  error: any;
  selectedUser: IUser | null;
  selectedUsers: IUser[] | null;
  selectedRoles: string[] | null;
  UserCount: number;
}

export const adapter: EntityAdapter<IUser> = createEntityAdapter<IUser>();

export const initialState: IUserState = adapter.getInitialState({
  isLoading: false,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  error: null,
  selectedUser: null,
  selectedUsers: null,
  selectedRoles: null,
  UserCount: 0,
});

const reducer = createReducer(
  initialState,

  // Get User by ID
  on(getUser, (state) => ({ ...state, isLoading: true })),
  on(getUserSuccess, (state, { user }) => ({
    ...state,
    selectedUser: user,
    isLoading: false,
  })),
  on(getUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // List all Users
  on(listAllUsers, (state) => ({ ...state, isLoading: true })),
  on(listAllUsersSuccess, (state, { users }) =>
    ( { ...state, selectedUsers: users,isLoading: false })
  ),
  on(listAllUsersFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

 // List all Roles
  on(listAllRoles, (state) => ({ ...state, isLoading: true })),
  on(listAllRolesSuccess, (state, { roles }) =>
    ( { ...state, selectedRoles: roles,isLoading: false })
  ),
  on(listAllRolesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  })),

  // Create User
  on(createUser, (state) => ({ ...state, isSaving: true })),
  on(createUserSuccess, (state, { user }) =>
    adapter.addOne(user, { ...state, isSaving: false, successMessage: 'User created successfully!' })
  ),
  on(createUserFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Update User
  on(updateUser, (state) => ({ ...state, isSaving: true })),
  on(updateUserSuccess, (state, { user }) =>
    adapter.updateOne(
      { id: user.userId, changes: user },
      { ...state, isSaving: false, successMessage: 'User updated successfully!' }
    )
  ),
  on(updateUserFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    errorMessage: error,
  })),

  // Delete User
  on(deleteUser, (state) => ({ ...state, isLoading: true })),
  on(deleteUserSuccess, (state, { userId }) =>
    adapter.removeOne(userId, { ...state, isLoading: false, successMessage: 'User deleted successfully!' })
  ),
  on(deleteUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error,
  }))
);

export function userReducer(
  state: IUserState | undefined,
  action: Action
) {
  return reducer(state, action);
}

export const {
  selectAll: selectAllUsers,
  selectEntities: selectUserEntities,
  selectIds: selectUserIds,
  selectTotal: selectTotalUsers,
} = adapter.getSelectors();

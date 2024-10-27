import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IUserState } from '../reducers/user.reducers';

export const selectUserState = createFeatureSelector<IUserState>('user');

export const selectSelectedUsers = createSelector(
  selectUserState,
  (state) => state.selectedUsers
);

export const selectSelectedRoles = createSelector(
  selectUserState,
  (state) => state.selectedRoles
);

export const selectSelectedUser = createSelector(
  selectUserState,
  (state) => state.selectedUser
);

export const selectUserIsLoading = createSelector(
  selectUserState,
  (state) => state.isLoading
);

export const selectUserIsSaving = createSelector(
  selectUserState,
  (state) => state.isSaving
);

export const selectUserErrorMessage = createSelector(
  selectUserState,
  (state) => state.errorMessage
);

export const selectUserSuccessMessage = createSelector(
  selectUserState,
  (state) => state.successMessage
);

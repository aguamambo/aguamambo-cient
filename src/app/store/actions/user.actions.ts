import { createAction, props } from '@ngrx/store'; 
import { Update } from '@ngrx/entity';
import { IUser } from 'src/app/models/user';

// GET user/{userId}
export const getUser = createAction(
  '[User] Load User',
  props<{ userId: string }>()
);

export const getUserSuccess = createAction(
  '[User] Load User Success',
  props<{ user: IUser }>()
);

export const getUserFailure = createAction(
  '[User] Load User Failure',
  props<{ error: any }>()
);

// GET user
export const listAllUsers = createAction(
  '[User] Load Users'
);

export const listAllUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ users: IUser[] }>()
);

export const listAllUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: any }>()
);

// GET user
export const listAllRoles = createAction(
  '[User] Load Users'
);

export const listAllRolesSuccess = createAction(
  '[User] Load Users Success',
  props<{ roles: string[] }>()
);

export const listAllRolesFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: any }>()
);

// POST user
export const createUser = createAction(
  '[User] Create User',
  props<{ user: IUser }>()
);

export const createUserSuccess = createAction(
  '[User] Create User Success',
  props<{ user: IUser }>()
);

export const createUserFailure = createAction(
  '[User] Create User Failure',
  props<{ error: any }>()
);

// PUT user/{userId}
export const updateUser = createAction(
  '[User] Update User',
  props<{ userId: string, user: IUser }>()
);

export const updateUserSuccess = createAction(
  '[User] Update User Success',
  props<{ user: IUser }>()
);

export const updateUserFailure = createAction(
  '[User] Update User Failure',
  props<{ error: any }>()
);

// DELETE user/{userId}
export const deleteUser = createAction(
  '[User] Delete User',
  props<{ userId: string }>()
);

export const deleteUserSuccess = createAction(
  '[User] Delete User Success',
  props<{ userId: string }>()
);

export const deleteUserFailure = createAction(
  '[User] Delete User Failure',
  props<{ error: any }>()
);

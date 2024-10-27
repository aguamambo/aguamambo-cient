import { takeUntil } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { IOption } from 'src/app/models/option';
import { IUser } from 'src/app/models/user';
import { createUser, IAppState, listAllRoles, listAllUsers, updateUser } from 'src/app/store';
import { selectSelectedRoles, selectSelectedUsers, selectUserIsLoading, selectUserIsSaving } from 'src/app/store/selectors/user.selectors';

interface User {
  name: string;
  username: string;
  password: string;
  phoneNumber: string;
  address: string;
  role: string;
}

const roleLabels: { [key: string]: string } = {
  "ADMIN": "Administrador",
  "FIELD_TECH": "Técnico"
};


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit {
  userForm: FormGroup;
  users: IUser[] = []; 
  user!: IUser;
  rolesList: IOption[] =[]
  usersColumns: {key: keyof IUser;  label: string}[] = [];
  isUsersLoading$: Observable<boolean>;
  isUserSaving$: Observable<boolean>;  
  isEditing: boolean = false;
  editIndex: number | null = null;
  private destroy$ = new Subject<void>();
 
  getUsers$ = this.store.pipe(select(selectSelectedUsers));
  getRoles$ = this.store.pipe(select(selectSelectedRoles));


  constructor(private fb: FormBuilder, private store: Store<IAppState>) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      role: ['', Validators.required],
    });
    this.isUsersLoading$ = this.store.select(selectUserIsLoading);
    this.isUserSaving$ = this.store.select(selectUserIsSaving);

    this.usersColumns = [
      {key:  'userId', label: 'Código'},
      {key:  'status', label: 'Estado'},
      {key:  'createdAt', label: 'Data de Criação'}, 
      {key:  'updatedAt', label: 'Data da Actualização'}, 
      {key:  'username', label: 'Nome de Utilizador'}, 
      {key:  'phoneNumber', label: 'Contacto'},
      {key:  'address', label: 'Endereço'},  
      {key:  'accountNonLocked', label: 'Conta Desbloqueada'} 
    ]
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
     this.store.dispatch(listAllUsers());
     this.store.dispatch(listAllRoles());

     this.getUsers$.pipe(takeUntil(this.destroy$)).subscribe(users => {
      if (users) {
        this.users = users.map( user => {
          return {
            ...user,
            status: user.active ? 'Activo' : 'Não Activo' 
          }
        });
      }
     })

     this.getRoles$.pipe(takeUntil(this.destroy$)).subscribe(roles => {
      if (roles) {
        this.rolesList = roles.map(role => ({
          label: roleLabels[role] || role,
          value: role
        }));
      }
     })


  }

  submitUserForm(): void {
    if (this.userForm.valid) {
      const payload = this.userForm.value;
      if (this.isEditing) {
         this.store.dispatch(updateUser({userId: this.user.userId, user: payload}))
        this.isEditing = false;
        this.editIndex = null;
      } else {
        this.store.dispatch(createUser({user: payload}))
      }
      this.store.dispatch(listAllUsers());
      this.userForm.reset();
    }
  }

  editUser(user: any): void {
    this.isEditing = true; 
    this.user = user;
    this.userForm.patchValue(user);
  }

  deleteUser(index: number): void {
    this.users.splice(index, 1);
  }
}

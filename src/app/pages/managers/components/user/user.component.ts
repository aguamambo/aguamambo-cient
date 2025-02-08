import { filter, takeUntil } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { IOption } from 'src/app/models/option';
import { IUser } from 'src/app/models/user';
import { createUser, IAppState, listAllRoles, listAllUsers, updateUser } from 'src/app/store';
import { selectSelectedRoles, selectSelectedUser, selectSelectedUsers, selectUserErrorMessage, selectUserIsLoading, selectUserIsSaving } from 'src/app/store/selectors/user.selectors';
import { ToasterService } from 'src/app/services/toaster.service';
import { DialogService } from 'src/app/services/dialog.service';

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
 
  getUsers$ = this._store.pipe(select(selectSelectedUsers));
  getRoles$ = this._store.pipe(select(selectSelectedRoles));


  constructor(
        private _fb: FormBuilder,
        private _store: Store<IAppState>,
        private _dialogService: DialogService
  ) {
    this.userForm = this._fb.group({
      userId: [''],
      name: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      role: ['', Validators.required],
    });
    this.isUsersLoading$ = this._store.select(selectUserIsLoading);
    this.isUserSaving$ = this._store.select(selectUserIsSaving);

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
     this._store.dispatch(listAllUsers());
     this._store.dispatch(listAllRoles());

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
          this._store.dispatch(updateUser({ userId: payload.userId, user: payload }));
          this._store.pipe(select(selectUserErrorMessage)).subscribe(
            error => {
              if (error) {
                this._dialogService.open({
                  title: 'Actualizacao do Utilizador',
                  type: 'error',
                  message: 'Um erro ocorreu ao actualizar o Utilizador! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                  isProcessing: false,
                  showConfirmButton: false,
                })
              } else {
                this._store.pipe(select(selectSelectedUsers), filter((user) => !!user))
                  .subscribe((user) => {
                    if (user) {
                      this.userForm.reset();
                      this.isEditing = false;
                      this._dialogService.open({
                        title: 'Actualizacao da Utilizador',
                        type: 'success',
                        message: 'Utilizador Actualizado com sucesso!',
                        isProcessing: false,
                        showConfirmButton: false,
                      })
                    } 
                  });
              }
            }
          )
        } else {
          this._store.dispatch(createUser({ user: payload }));
          this._store.pipe(select(selectUserErrorMessage)).subscribe(
            error => {
              if (error) {
                this._dialogService.open({
                  title: 'Criação do Utilizador',
                  type: 'error',
                  message: 'Um erro ocorreu ao criar o Utilizador! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
                  isProcessing: false,
                  showConfirmButton: false,
                })
              } else {
                this._store.pipe(select(selectSelectedUser), filter((user) => !!user))
                .subscribe((user) => {
                  if (user) {
                    this._dialogService.open({
                      title: 'Criação de Utilizador',
                      type: 'success',
                      message: 'Utilizador criado com sucesso!',
                      isProcessing: false,
                      showConfirmButton: false,
                    }) 
                    this.userForm.reset();
                  } 
                });
              }
            
            })
          
        }
      }
      else{
        this._dialogService.open({
          title: 'Validação de Dados',
          type: 'info',
          message: 'Por favor verifique se os campos estão devidadmente preenchidos e volte a submeter.',
          isProcessing: false,
          showConfirmButton: false,
        })
      }
    }

    eraseForm(){
      this.userForm.reset();
    }


  editUser(user: any): void {
    this.isEditing = true; 
    this.user = user;
    this.userForm.patchValue({
      userId: this.user.userId,
      active: this.user.active,
      createdAt: this.user.createdAt,
      updatedAt: this.user.updatedAt,
      name: this.user.name,
      role: this.user.role,
      username: this.user.username,
      password: this.user.password,
      phoneNumber: this.user.phoneNumber,
      address: this.user.address,
      enabled: this.user.enabled,
      accountNonExpired: this.user.accountNonExpired,
      accountNonLocked: this.user.accountNonLocked,
      credentialsNonExpired: this.user.credentialsNonExpired,
      status: this.user.status
    });
  }

  deleteUser(index: number): void {
    this.users.splice(index, 1);
  }
}

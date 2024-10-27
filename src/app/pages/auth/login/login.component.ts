import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { IAppState, login } from "src/app/store";
import { selectLoggingIn, selectLoginFailed, selectLoginError } from "src/app/store/selectors/auth.selectors";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  userNotValid: boolean = false 
  passNotValid: boolean = false
  isLoading$: Observable<boolean>;
  loginFailed$: Observable<boolean>;
  loginError$: Observable<string>;
  
  constructor(private fb: FormBuilder, private router: Router, private store: Store<IAppState>) {
    this.loginForm = this.fb.group({
      username: new FormControl(null, Validators.required), 
      password: new FormControl(null, Validators.required)
    });

    this.isLoading$ = this.store.select(selectLoggingIn);
    this.loginFailed$ = this.store.select(selectLoginFailed);
    this.loginError$ = this.store.select(selectLoginError);
  }
  
  ngOnInit(): void {}

  login() {
    if (this.loginForm.valid) {  
      
      this.store.dispatch(login({credentials: this.loginForm.value}));
       
    } else {
      console.log('Formulário de login inválido');
    }
  }
  
  validateForm() {
    if (this.loginForm.controls['password'].invalid && this.loginForm.controls['password'].touched) {
      this.passNotValid = true
    }
  }
}
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, Subscription } from "rxjs";
import { Error } from "src/app/models/error";
import { AuthService } from "src/app/services/auth.service";
import { IAppState, login } from "src/app/store";
import { selectLoggingIn, selectLoginFailed, selectLoginError } from "src/app/store/selectors/auth.selectors";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading$: Observable<boolean>;
  loginFailed$: Observable<boolean>;

  loginError: Error | null = null;
  errorMessage: string;

  private loginErrorSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store<IAppState>,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
    this.errorMessage = '';
    this.isLoading$ = this.store.select(selectLoggingIn);
    this.loginFailed$ = this.store.select(selectLoginFailed);
  }

  ngOnInit(): void {
    this.loginErrorSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.loginErrorSubscription?.unsubscribe();
  }

  login(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.loginError = null;

      this.store.dispatch(login({ credentials: this.loginForm.value }));

      this.loginErrorSubscription = this.store.select(selectLoginFailed).subscribe(loginFailed => {
        if (loginFailed) {
          this.store.select(selectLoginError).subscribe(error => {
            if (error) {
              this.loginError = error;
              this.errorMessage = error.message || 'Erro desconhecido ao tentar fazer login.';
            }
          });
        }
      });
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos.';
    }
  }

  validateForm(): void {
    this.passNotValid = this.loginForm.get('password')?.invalid && this.loginForm.get('password')?.touched || false;
  }

  // These properties are not used dynamically anymore
  userNotValid = false;
  passNotValid = false;
}

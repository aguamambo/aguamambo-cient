import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, Subscription } from "rxjs"; // Import Subscription
import { AuthService } from "src/app/services/auth.service";
import { IAppState, login } from "src/app/store";
import { selectLoggingIn, selectLoginFailed, selectLoginError } from "src/app/store/selectors/auth.selectors";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy { // Implement OnDestroy
  loginForm: FormGroup;
  userNotValid: boolean = false;
  passNotValid: boolean = false;
  isLoading$: Observable<boolean>;
  loginFailed$: Observable<boolean>;
  loginError: string | null = null; // Changed from Observable<string> to string | null
  private loginErrorSubscription: Subscription | undefined; // Subscription to manage

  constructor(private fb: FormBuilder, private router: Router, private store: Store<IAppState>, private auth: AuthService) {
    this.loginForm = this.fb.group({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
    });

    this.isLoading$ = this.store.select(selectLoggingIn);
    this.loginFailed$ = this.store.select(selectLoginFailed);

    // Subscribe to the loginError$ observable and update the local loginError string
    this.loginErrorSubscription = this.store.select(selectLoginError).subscribe(error => {
      this.loginError = error;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.loginErrorSubscription) {
      this.loginErrorSubscription.unsubscribe();
    }
  }

  login() {
    if (this.loginForm.valid) { 
      this.store.dispatch(login({ credentials: this.loginForm.value }));
    } else {
      // You might want to set a generic error message here if the form is invalid
      this.loginError = 'Por favor, preencha todos os campos.';
    }
  }

  validateForm() {
    if (this.loginForm.controls['password'].invalid && this.loginForm.controls['password'].touched) {
      this.passNotValid = true;
    }
  }
}

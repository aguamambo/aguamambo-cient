import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  userNotValid: boolean = true
  passNotValid: boolean = true

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required], 
      password: ['', [Validators.required, Validators.minLength(6)]] 
    });
  }
  
  ngOnInit(): void {}

  onSubmit() {

    this.validateForm()
    if (this.loginForm.valid) {
      // Simular login (você chamaria o serviço de autenticação aqui)
      console.log('Login bem-sucedido', this.loginForm.value);
      this.router.navigate(['/dashboard']);  // Redirecionar para o dashboard após o login
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
import { CanActivateFn } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const jwtHelper = new JwtHelperService();  
  const router = inject(Router); 
  const token = localStorage.getItem('token');
   
  if (token && !jwtHelper.isTokenExpired(token)) {
    return true;  
  }

  router.navigate(['/auth/login']);
  return false;
};

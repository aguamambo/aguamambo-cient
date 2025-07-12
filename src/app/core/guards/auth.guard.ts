import { CanActivateFn } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { inject } from '@angular/core'; 
import { AuthService } from 'src/app/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const jwtHelper = new JwtHelperService();
  const router = inject(Router);
  const authService = inject(AuthService); 
  const encryptedToken = localStorage.getItem('token'); 

  if (!encryptedToken) {
    router.navigate(['/auth/login']);
    return false;
  }

  try {
    const token = authService.decryptData(encryptedToken); 
    
    if (!token || jwtHelper.isTokenExpired(token)) {
      router.navigate(['/auth/login']);
      return false;
    }

    return true;
  } catch (e) {
    console.error('AuthGuard: Token decryption failed', e);
    router.navigate(['/auth/login']);
    return false;
  }
};

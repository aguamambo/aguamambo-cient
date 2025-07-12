import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private jwtHelper: JwtHelperService, private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const encryptedToken = localStorage.getItem('token');

    if (encryptedToken) {
      try {
        const token = this.authService.decryptData(encryptedToken);

        if (token && !this.jwtHelper.isTokenExpired(token)) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      } catch (e) {
        console.error('Failed to decrypt token in interceptor:', e);
      }
    }

    return next.handle(request);
  }
}

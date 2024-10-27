import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import {environment} from '../../environments/environment'
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private key = environment.PRIVATE_KEY 
private API_URL = environment.API_URL;
constructor(private router: Router, private jwtHelperService: JwtHelperService, private http: HttpClient) {
}

public login(username: string, password: string): Observable<any> {
  return this.http.post(`${this.API_URL}/auth/login`, { username, password });
}

async authenticated(): Promise<boolean> {
  const token = await this.jwtHelperService.tokenGetter();

  if (!token) {
    return false;
  }
  return !this.jwtHelperService.isTokenExpired(token);
}
  public logout() {
    localStorage.clear();
    this.router.navigateByUrl('/auth/login');
  }

  public encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.key).toString();
  }

  public decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public checkSession(): string {
    if (!this.authenticated()) {
      this.logout()
      return ''
    } else {
      return this.decryptData(localStorage.getItem('name') || '')
    }

    return ''
  }

}

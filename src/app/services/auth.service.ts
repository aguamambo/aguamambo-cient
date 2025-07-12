import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import {environment} from '../../environments/environment'
import { Observable, tap } from 'rxjs';
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
    return this.http.post<any>(`${this.API_URL}/auth/login`, { username, password }).pipe(
      tap(response => {
        // Handle the successful login response
        this.saveAuthData(response);
      })
    );
  }

  /**
   * Saves authentication data to local storage after successful login.
   * Encrypts sensitive data before storing.
   * @param data The response object from the login endpoint.
   */
  private saveAuthData(data: any): void {
    if (data.token) {
      localStorage.setItem('token', this.encryptData(data.token));
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', this.encryptData(data.refreshToken));
    }
    if (data.userId) {
      localStorage.setItem('userId', this.encryptData(data.userId));
    }
    if (data.name) {
      localStorage.setItem('name', this.encryptData(data.name));
    }
    if (data.username) {
      localStorage.setItem('username', this.encryptData(data.username));
    }
    if (data.role) {
      localStorage.setItem('role', this.encryptData(data.role));
    }
  }

  async authenticated(): Promise<boolean> {
    const encryptedToken = localStorage.getItem('token');
    if (!encryptedToken) {
      return false;
    }
    try {
      const token = this.decryptData(encryptedToken);
      return !this.jwtHelperService.isTokenExpired(token);
    } catch (e) {
      console.error("Error decrypting token:", e);
      return false;
    }
  }

  public logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/auth/login');
  }

  public encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.key).toString();
  }

  public decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error("Decryption failed:", e);
      return ''; // Return empty string or handle error appropriately
    }
  }

  /**
   * Checks the user's session and returns their decrypted name if authenticated.
   * Logs out and returns an empty string if not authenticated or decryption fails.
   * @returns A Promise that resolves to the decrypted user name (string) or an empty string.
   */
  public async checkSession(): Promise<string> { // Changed to async and returns Promise<string>
    const isAuthenticated = await this.authenticated(); // Await the promise to get the boolean result
  
    if (!isAuthenticated) {
      this.logout();
      return '';  
    }

    const encryptedName = localStorage.getItem('name');
    if (encryptedName) {
      try {
        return this.decryptData(encryptedName);
      } catch (e) {
        console.error("Error decrypting name during session check:", e);
        return ''; // Handle decryption error for the name
      }
    }
    return ''; // Return empty string if no encrypted name is found
  }

  /**
   * Retrieves the user's role from local storage.
   * @returns The user's role as a string, or null if not found/decrypted.
   */
  public getUserRole(): string | null {
    const encryptedRole = localStorage.getItem('role');
    if (encryptedRole) {
      try {
        return this.decryptData(encryptedRole);
      } catch (e) {
        console.error("Error decrypting role:", e);
        return null;
      }
    }
    return null;
  }

  /**
   * Retrieves the user's ID from local storage.
   * @returns The user's ID as a string, or null if not found/decrypted.
   */
  public getUserId(): string | null {
    const encryptedUserId = localStorage.getItem('userId');
    if (encryptedUserId) {
      try {
        return this.decryptData(encryptedUserId);
      } catch (e) {
        console.error("Error decrypting userId:", e);
        return null;
      }
    }
    return null;
  }

  /**
   * Retrieves the user's username from local storage.
   * @returns The user's username as a string, or null if not found/decrypted.
   */
  public getUsername(): string | null {
    const encryptedUsername = localStorage.getItem('username');
    if (encryptedUsername) {
      try {
        return this.decryptData(encryptedUsername);
      } catch (e) {
        console.error("Error decrypting username:", e);
        return null;
      }
    }
    return null;
  }
}

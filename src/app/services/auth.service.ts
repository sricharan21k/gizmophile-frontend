import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { User } from '../model/user/user';
import { CartService } from './cart.service';
import { API_URL } from '../app.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiLoginUrl = `${API_URL}:8080`;
  username: string = '';
  constructor(
    private http: HttpClient,
    private router: Router,
    private appService: AppService
  ) {}

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  login(loginData: any) {
    console.log('loginData', loginData);
    this.http
      .post<{ authToken: string; username: string }>(
        `${this.apiLoginUrl}/login`,
        loginData
      )
      .subscribe((data) => {
        console.log('log', data);
        const token = data.authToken;
        if (token) {
          localStorage.setItem('authToken', token);
          this.appService.saveUserDataInApp(data.username);
          this.router.navigate(['/home']);
        }
      });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.clear();
    this.router.navigate(['/home']);
    location.reload();
  }

  getUser(): User {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : undefined;
  }
}

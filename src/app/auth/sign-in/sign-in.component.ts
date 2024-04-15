import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { requireUsernameOrEmailValidator } from './validate-username';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group(
      {
        username: [''],
        email: ['', Validators.email],
        password: ['', Validators.required],
      },
      { validators: requireUsernameOrEmailValidator() }
    );
  }

  login() {
    const loginData = {
      username: this.loginForm.get('username')?.valid
        ? this.loginForm.get('username')?.value
        : this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    console.log(loginData);

    this.authService.login(loginData);
  }
  remove() {
    localStorage.removeItem('token');
  }
}

import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../services/app.service';
import { UserService } from '../../services/user.service';
import { validatePasswordMatch } from '../sign-up/validate-password-match';
import { validatePasswordStrength } from '../sign-up/validate-password-strength';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css',
})
export class RecoverComponent {
  userEmail: string = '';
  recoveryForm: FormGroup;
  verified: boolean = false;
  showHeader: boolean = true;
  showSpinner: boolean = false;
  showSuccessMessage: boolean = false;
  showForm: boolean = true;
  verificationResult: string | undefined;
  timeoutId: any;

  passwordForm: FormGroup;
  showPasswordForm: boolean = false;
  passwordUpdated: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private appService: AppService,
    private userService: UserService,
    private cookieService: CookieService
  ) {
    this.recoveryForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.passwordForm = this.fb.group({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        validatePasswordStrength(),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        validatePasswordMatch(),
      ]),
    });
  }
  ngOnInit(): void {
    this.checkCookieValue();
  }

  sendRecoveryEmail() {
    if (this.recoveryForm.valid) {
      this.showSpinner = true;
      this.showForm = false;
      this.userEmail = this.recoveryForm.get('email')?.value;
      console.log('email', this.userEmail);
      this.appService.sendRecoveryEmail(this.userEmail).subscribe((res) => {
        if (res) {
          this.showSpinner = false;
          this.showSuccessMessage = true;
        }
      });
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      console.log('form', this.passwordForm);
      const password = this.passwordForm.get('password')?.value;
      console.log('email', this.userEmail);
      this.userService
        .updatePassword(this.userEmail, password)
        .subscribe((res) => {
          this.router.navigate(['login']);
        });
    }
  }

  checkCookieValue(): void {
    this.timeoutId = setTimeout(() => {
      this.verificationResult = this.cookieService.get('verificationResult');
      if (this.verificationResult) {
        if (this.verificationResult === 'success') {
          this.verified = true;
          this.showSpinner = false;
          this.showSuccessMessage = false;
          this.cookieService.delete('verificationResult');
        }
      } else {
        this.checkCookieValue(); // Retry after 2 seconds if the cookie is not found
      }
    }, 2000); // Check every 2 seconds

    // Stop checking after 2 minutes
    setTimeout(() => {
      clearTimeout(this.timeoutId);
    }, 120000); // 2 minutes
  }
}

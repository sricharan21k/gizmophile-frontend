import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { UserService } from '../../services/user.service';
import { validatePasswordMatch } from './validate-password-match';
import { validatePasswordStrength } from './validate-password-strength';
import { NewUser } from '../../model/user/new-user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  singnupForm: FormGroup;
  userExists: boolean = false;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.singnupForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]),
      firstname: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]+$/),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]+$/),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        validatePasswordStrength(),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        validatePasswordMatch(),
      ]),
      // validatePasswordMatch
    });
  }
  ngOnInit(): void {}

  checkUsername() {
    this.singnupForm
      .get('username')
      ?.valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((query) => this.userService.checkUserExists(query))
      )
      .subscribe((res) => (this.userExists = res));
  }

  register() {
    const formData = this.singnupForm.value;
    const newUser: NewUser = {
      ...formData,
    };

    this.userService.addNewUser(newUser).subscribe((data) => {
      localStorage.clear();
      // localStorage.setItem('user', JSON.stringify(data));
      this.router.navigate(['login']);
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { User } from '../../model/user/user';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserInfo } from '../../model/user/user-info';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  user?: User;
  profileImage?: string;
  showEditModl: boolean = false;
  showProfileModal: boolean = false;
  userData: FormGroup;
  days: number[] = [];
  imageData: FormData;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.imageData = new FormData();
    const currentDate = new Date();
    this.userData = this.fb.group({
      username: [''],
      firstname: [''],
      lastname: [''],
      email: [''],
      phone: [''],
    });
  }

  ngOnInit(): void {
    console.log(this.user);
    this.user = this.authService.getUser();
    this.profileImage = this.userService.getProfileImage(this.user.username);
  }

  populateUserData() {
    this.userData?.patchValue({
      username: this.user?.username,
      firstname: this.user?.firstname,
      lastname: this.user?.lastname,
      email: this.user?.email,
      phone: this.user?.phone,
    });

    this.openEditModal();
  }

  hideEmail() {
    const email: string = this.user?.email ?? '';
    const atIndex = email.indexOf('@');
    if (atIndex === -1 || atIndex < 5) {
      return email;
    }
    const mainPart = email?.substring(0, atIndex);
    const domainPart = email?.substring(atIndex);

    const hide = mainPart.substring(0, mainPart.length - 5) + '*****';
    return hide + domainPart;
  }

  updateUserInfo() {
    const data = this.userData.value;
    const dob = this.user?.dateOfBirth ?? new Date();
    dob.setMonth(this.userData.get('month')?.value);
    dob.setDate(this.userData.get('month')?.value);

    const user: UserInfo = {
      ...data,
      dateOfBirth: dob,
    };
    console.log('user', user);
    this.userService
      .updateUser(this.user?.username as string, user)
      .subscribe((user) => {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
      });
    this.closeEditModal();
  }

  selectImage(event: any) {
    const image: File = event.target.files[0];
    const imageData = new FormData();
    imageData.append('profileImage', image, image.name);
    this.imageData = imageData;
    console.log('before', this.imageData.get('profileImage'));
  }

  uploadImage() {
    this.profileImage = '';
    console.log('data', this.imageData.get('profileImage'));
    this.userService
      .uploadProfile(this.imageData, this.user?.username as string)
      .subscribe((data) => {
        console.log('res data', data);
        this.profileImage = this.userService.getProfileImage(
          this.user?.username as string
        );
        this.closeProfileModal();
      });
  }

  getImage() {
    return this.userService.getProfileImage(this.user?.username as string);
  }

  openEditModal() {
    this.showEditModl = true;
  }
  closeEditModal() {
    this.showEditModl = false;
  }

  openProfileModal() {
    this.showProfileModal = true;
  }
  closeProfileModal() {
    // this.profileImage = this.user?.profile ?? '';
    this.showProfileModal = false;
  }
}

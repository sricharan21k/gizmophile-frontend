import { ChangeDetectorRef, Component } from '@angular/core';
import { Address } from '../../model/address';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../services/user.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent {
  username: string = '';
  addressDefaults: { [key: number]: boolean } = [];
  isDefaultAddress: boolean = false;
  addressList: Address[] = [];
  addressForm: FormGroup;
  newAddressForm: FormGroup;
  selectedAddress?: Address;
  showAddAddressModal: boolean = false;
  showEditAddressModal: { [key: number]: boolean } = {};
  showSpinner: boolean = false;
  constructor(private fb: FormBuilder, private userService: UserService) {
    this.addressForm = this.fb.group({
      house: [''],
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipcode: [''],
      landmark: [''],
      addressType: [''],
      directions: [''],
      isDefault: [false],
    });

    this.newAddressForm = this.fb.group({
      house: [''],
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipcode: [''],
      landmark: [''],
      addressType: [''],
      directions: [''],
      isDefault: [false],
    });
  }
  ngOnInit(): void {
    this.showSpinner = true;
    this.username = this.userService.getUsername();
    this.userService.getAddresses(this.username).subscribe((data) => {
      this.showSpinner = false;
      this.addressList = data;
      this.addressList.forEach((address) => {
        this.showEditAddressModal[address.id] = false;
      });
    });
  }

  populateAddressData(address: Address) {
    this.selectedAddress = address;
    this.addressForm.patchValue({
      house: address.house,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipcode: address.zipcode,
      landmark: address.landmark,
      addressType: address.addressType,
      directions: address.directions,
      isDefault: address.isDefault,
    });
    this.openEditAddressModal(address.id);
  }

  getDefaultAddress() {
    return this.userService.getDefaultAddress();
  }

  addAddress() {
    const data = this.newAddressForm.value;
    const address: Address = {
      ...data,
    };

    this.userService.addAddress(this.username, address).subscribe((data) => {
      if (data) {
        this.userService.getAddresses(this.username).subscribe((data) => {
          this.addressList = data;
          this.CloseAddAddressModal();
        });
      }
    });
  }

  updateAddress(addressId: number) {
    if (this.selectedAddress) {
      this.selectedAddress.house = this.addressForm.value.house;
      this.selectedAddress.street = this.addressForm.value.street;
      this.selectedAddress.city = this.addressForm.value.city;
      this.selectedAddress.state = this.addressForm.value.state;
      this.selectedAddress.country = this.addressForm.value.country;
      this.selectedAddress.zipcode = this.addressForm.value.zipcode;
      this.selectedAddress.landmark = this.addressForm.value.landmark;
      this.selectedAddress.addressType = this.addressForm.value.addressType;
      this.selectedAddress.directions = this.addressForm.value.directions;
      this.selectedAddress.isDefault = this.addressForm.value.isDefault;

      this.userService.updateAddress(this.username, this.selectedAddress);

      this.closeEditAddressModal(addressId);
    }
  }

  setDefaultAddress(addressId: number) {
    this.userService
      .setDefaultAddress(this.username, addressId)
      .subscribe((data) => {
        this.setDefault(addressId);
      });
  }
  setDefault(addressId: number) {
    this.addressList.forEach((i) => {
      i.isDefault = false;
    });
    const index = this.addressList.findIndex((i) => i.id === addressId);
    this.addressList[index].isDefault = true;
  }

  deleteAddress(addressId: number) {
    const address = this.addressList.find((i) => i.id === addressId);
    if (address?.isDefault) {
      return;
    } else {
      this.userService
        .deleteAddress(this.username, addressId)
        .subscribe((res) => {
          if (res) {
            this.userService.getAddresses(this.username).subscribe((data) => {
              this.addressList = data;
            });
          }
        });
    }
  }

  OpenAddAddressModal() {
    this.showAddAddressModal = true;
  }

  CloseAddAddressModal() {
    this.showAddAddressModal = false;
  }

  openEditAddressModal(addressId: number) {
    this.showEditAddressModal[addressId] = true;
  }
  closeEditAddressModal(addressId: number) {
    this.showEditAddressModal[addressId] = false;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../model/cart-item';
import { ProductService } from '../../services/product.service';
import { CartItemData } from '../../model/cart-item-data';
import { Address } from '../../model/address';
import { UserService } from '../../services/user.service';
import { AppService } from '../../services/app.service';
import { ProductVariant } from '../../model/product/product-variant';
import { ProductColor } from '../../model/product/product-color';
import { Order } from '../../model/order';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, forkJoin, of } from 'rxjs';
import { User } from '../../model/user/user';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  username: string = '';
  order: Order = {};
  user?: User;

  showAddAddressModal: boolean = false;
  showEditAddressModal: boolean = false;
  showPaymentModal: boolean = false;
  showAddressList: boolean = false;

  // address
  addressForm: FormGroup;
  newAddressForm: FormGroup;
  selectedAddress?: Address;
  deliveryAddress?: Address;
  addressList: Address[] = [];

  deliveryAddressId: number = 0;

  items: CartItemData[] = [];
  variants: ProductVariant[] = [];
  colors: ProductColor[] = [];

  speedDelivery: boolean = false;
  standardDeliveryCharge: number = 100;
  speedDeliveryCharge: number = 200;

  paymentCompleted: boolean = false;
  confirmOrder: boolean = false;

  // otp verification
  otpForm: FormGroup;
  showEmail: boolean = true;
  showSendOtpButton: boolean = true;
  showSpinner: boolean = false;
  showOTPInput: boolean = false;
  otpVerified: boolean = false;
  otpNotVerified: boolean = false;
  showExpired: boolean = false;
  timer: number = 120;
  intervalId: any;
  displayTime: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private userService: UserService,
    private appService: AppService
  ) {
    this.username = userService.getUsername();

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

    this.otpForm = this.fb.group({
      num1: [],
      num2: [],
      num3: [],
      num4: [],
      num5: [],
      num6: [],
    });
  }
  ngOnInit(): void {
    this.userService
      .getUser(this.username)
      .subscribe((data) => (this.user = data));

    this.userService
      .getAddresses(this.username)
      .pipe(
        switchMap((addresses) => {
          this.addressList = addresses;
          this.deliveryAddress = this.addressList.find((i) => i.isDefault);
          this.deliveryAddressId = this.deliveryAddress?.id ?? 0;

          // Fetch cart items and process them
          return forkJoin(
            this.cartService.getCart().map((cartItem) =>
              this.productService.getProduct(cartItem.item).pipe(
                switchMap((product) => {
                  const variantObservables = product.variants.map((variantId) =>
                    this.productService.getProductVariant(variantId)
                  );
                  const colorObservables = product.colors.map((colorId) =>
                    this.productService.getProductColor(colorId)
                  );

                  return forkJoin([
                    ...variantObservables,
                    ...colorObservables,
                  ]).pipe(
                    switchMap((results) => {
                      const variants = results.slice(
                        0,
                        product.variants.length
                      ) as ProductVariant[];
                      const colors = results.slice(
                        product.variants.length
                      ) as ProductColor[];

                      const cartItemData: CartItemData = {
                        ...cartItem,
                        product: product,
                      };

                      // Only push checked items
                      if (cartItem.checked) {
                        this.items.push(cartItemData);
                      }

                      // Push fetched variants and colors
                      this.variants.push(...variants);
                      this.colors.push(...colors);

                      return of(cartItemData);
                    })
                  );
                })
              )
            )
          );
        })
      )
      .subscribe({
        next: (cartItems) => {
          // Do something with cartItems if needed
          this.items = cartItems;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  getProductPrice(productId: number, productVariant: string) {
    return (
      this.variants
        .filter((variant) => variant.productId === productId)
        .find((variant) => variant.variant === productVariant)?.price ?? 0
    );
  }

  getProductVariant(variantId: number) {
    return this.productService.getProductVariant(variantId);
  }

  getProductColor(colorId: number) {
    return this.productService.getProductColor(colorId);
  }

  getProductImage(cartItemData: CartItemData) {
    const colorId = this.colors
      .filter((color) => color.productId === cartItemData.item)
      .find((color) => color.color === cartItemData.color)?.id;
    return this.productService.getProductImage(colorId as number);
  }

  placeOrder() {
    this.order = {
      paymentMode: 'Cash On Delivery',
      shippingAddress: this.deliveryAddressId,
      items: this.items.map(({ item, ...props }) => ({
        ...props,
        item: item,
      })),
      deliveryCharge: this.speedDelivery
        ? this.speedDeliveryCharge
        : this.standardDeliveryCharge,
      orderAmount: this.total(),
    };

    this.userService.placeOrder(this.username, this.order).subscribe((res) => {
      this.cartService.clearCart();
      // this.appService.saveUserDataInApp(this.username);
      // this.saveUserDataInApp(this.username);
      this.router.navigate(['profile/order', res]);
    });

    // location.reload();
  }

  populateAddressData() {
    const address = this.deliveryAddress as Address;
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
    this.openEditAddressModal();
  }

  addAddress() {
    const data = this.newAddressForm.value;
    const address: Address = {
      ...data,
    };

    this.userService.addAddress(this.username, address).subscribe((data) => {
      this.userService.getAddresses(this.username).subscribe((data) => {
        this.addressList = data;
        this.closeAddAddressModal();
      });
    });
  }

  updateAddress() {
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

      // this.setDefault(addressId);
      this.userService.updateAddress(this.username, this.selectedAddress);
      // this.clickCloseEditAddressButton(addressId);
      // this.closeEditAddressModal();
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
      this.addressList = this.addressList.filter((i) => i.id !== addressId);
      this.userService.deleteAddress(this.username, addressId);
    }
  }

  setDeliveryAddress(address: Address) {
    this.deliveryAddress = address;
    this.deliveryAddressId = address.id;
  }

  subtotal() {
    return this.items.reduce((acc, curr) => {
      return acc + (curr.itemValue ?? 0);
    }, 0);
  }
  shippingCharges() {
    return this.speedDelivery
      ? this.speedDeliveryCharge
      : this.standardDeliveryCharge;
  }
  total() {
    return (this.subtotal() ?? 0) + this.shippingCharges();
  }

  toggleCollapse() {
    this.showAddressList = this.showAddressList ? false : true;
    console.log('col', this.showAddressList);
  }

  openAddAddressModal() {
    this.showAddAddressModal = true;
  }
  closeAddAddressModal() {
    this.showAddAddressModal = false;
  }

  openEditAddressModal() {
    this.showEditAddressModal = true;
  }
  closeEditAddressModal() {
    this.showEditAddressModal = false;
  }

  openPaymentModal() {
    this.showPaymentModal = true;
  }
  closePaymentModal() {
    this.showPaymentModal = false;
  }

  hiddenEmail() {
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
  onOtpInput(
    event: any,
    nextInput?: HTMLInputElement,
    prevInput?: HTMLInputElement
  ) {
    const input = event.target;
    const keyCode = event.keyCode || event.which;

    // Check if backspace is pressed and the current input is empty
    if (keyCode === 8 && input.value.length === 0 && prevInput) {
      prevInput.focus();
      return;
    }

    // Check if entered value is a single digit and if there's a next input field
    if (input.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

  sendOtp() {
    this.timer = 120;
    this.showSendOtpButton = false;
    this.showSpinner = true;
    this.showExpired = false;
    this.appService.generateOtp(this.user?.email ?? '').subscribe((res) => {
      if (res) {
        this.showOTPInput = true;
        this.showSpinner = false;
        this.startTimer();
      }
    });
  }

  retry() {
    this.otpNotVerified = false;
    this.showOTPInput = false;
    this.showSendOtpButton = true;
    this.showEmail = true;
  }

  verifyOtp() {
    const otp = Object.keys(this.otpForm.controls)
      .map((control) => this.otpForm.controls[control].value)
      .join('');

    this.appService
      .verifyOtp(this.user?.email ?? '', otp)
      .subscribe((isValid) => {
        this.showEmail = false;
        this.showOTPInput = false;
        if (isValid) {
          this.otpVerified = true;
        } else {
          this.otpNotVerified = true;
          this.showExpired = false;
        }
      });
  }

  startTimer() {
    this.intervalId = setInterval(() => {
      if (this.timer > 0) {
        console.log(this.timer);
        this.timer -= 1;
        this.updateDisplayTime(this.timer);
      } else {
        this.showOTPInput = false;
        this.showExpired = true;
        clearInterval(this.intervalId);
      }
    }, 1000);
  }
  updateDisplayTime(seconds: number): void {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = seconds % 60;
    this.displayTime = `${this.padZero(minutes)}:${this.padZero(
      remainingSeconds
    )}`;
  }

  padZero(number: number): string {
    return number < 10 ? `0${number}` : number.toString();
  }
}

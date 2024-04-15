import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { CartService } from './cart.service';
import { CartItem } from '../model/cart-item';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../app.constants';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private apiBaseUrl = `${API_URL}:8080`;
  private components = new BehaviorSubject<string[]>([]);
  components$ = this.components.asObservable();

  username: string = this.userService.getUsername();
  constructor(
    private userService: UserService,
    private cartService: CartService,
    private http: HttpClient
  ) {}

  saveUserDataInApp(username: string) {
    this.userService.getUser(username).subscribe((user) => {
      console.log('user', user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem(
        'cart',
        JSON.stringify(this.constructCartItemData(user.cartItems))
      );

      localStorage.setItem('wishlist', JSON.stringify(user.wishlistItems));
      localStorage.setItem('browsedList', JSON.stringify(user.browsedItems));

      this.cartService.getCart().length;
      this.cartService.cartItemSubject.next(this.cartService.getCart().length);
      console.log('ls', localStorage.getItem('user'));
    });
  }
  constructCartItemData(data: string[]): CartItem[] {
    const cartItemArray: CartItem[] = [];
    data.forEach((i) => {
      const cartItem = i.split('-');
      const cartItemData: CartItem = {
        item: +cartItem[0],
        color: cartItem[1],
        variant: cartItem[2],
        quantity: +cartItem[3],
        itemValue: +cartItem[4],
        checked: cartItem[5] === 'true' ? true : false,
      };
      cartItemArray.push(cartItemData);
    });
    return cartItemArray;
  }

  notifyParent(component: string) {
    const current = this.components.getValue();
    current.push(component);
    this.components.next(current);
  }
  saveBrowsedList(items: string[]) {
    localStorage.setItem('browsedList', JSON.stringify(items));
  }
  getBrowsedList(): string[] {
    const browsedList = localStorage.getItem('browsedList');
    return browsedList ? JSON.parse(browsedList) : [];
  }

  addToBrowsedList(item: string) {
    const browsedList = this.getBrowsedList();
    const itemFound = browsedList.some((i) => i === item);
    if (!itemFound) {
      if (browsedList.length == 6) {
        browsedList.reverse().pop();
      }
      browsedList.push(item);
      this.userService.addItemDataToUser(this.username, 'browsedItem', item);
    }
    this.saveBrowsedList(browsedList);
  }

  saveWishlist(items: string[]) {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }
  getWishlist(): string[] {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  }

  addToWishlist(item: string) {
    const wishlist = this.getWishlist();
    const itemFound = wishlist.some((i) => i === item);
    if (!itemFound) {
      wishlist.push(item);
      console.log('item', item);
      console.log('uname', this.username);
      this.userService.addItemDataToUser(this.username, 'wishlistItem', item);
    }
    this.saveWishlist(wishlist);
  }

  removeFromWishlist(item: string) {
    const wishlist = this.getWishlist();
    const updatedWishlsit = wishlist.filter((i) => i !== item);
    this.userService.removeItemDataFromUser(
      this.username,
      'wishlistItem',
      item
    );
    this.saveWishlist(updatedWishlsit);
  }

  clearWishlist() {
    localStorage.removeItem('wishlist');
    this.userService.removeAllDataItemsFromUser(this.username, 'wishlistItem');
  }

  generateOtp(email: string) {
    return this.http.post<boolean>(`${this.apiBaseUrl}/send-otp`, email);
  }
  verifyOtp(email: string, otp: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiBaseUrl}/validate-otp`, {
      email: email,
      code: otp,
    });
  }

  sendRecoveryEmail(email: string) {
    return this.http.post<boolean>(
      `${this.apiBaseUrl}/send-verification-link`,
      email
    );
  }

  verifyLink(email: string, code: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiBaseUrl}/verify-link`, {
      email: email,
      code: code,
    });
  }
}

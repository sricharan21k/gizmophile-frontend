import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { UserService } from './user.service';
import { CartItem } from '../model/cart-item';
import { CartItemData } from '../model/cart-item-data';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItemSubject = new BehaviorSubject<number>(this.getCart().length);
  username: string = '';
  constructor(private userService: UserService) {
    this.username = userService.getUsername();
  }
  saveCart(cartItems: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }
  getUpdatedCart(): Observable<number> {
    return this.cartItemSubject.pipe(switchMap((data) => of(data)));
  }
  getCart(): CartItem[] {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }
  addItemToCart(cartItem: CartItem) {
    const cart = this.getCart();
    const existingCartItemIndex = cart.findIndex(
      (item) =>
        item.item === cartItem.item &&
        item.color === cartItem.color &&
        item.variant === cartItem.variant
    );
    const existingCartItem = cart[existingCartItemIndex];
    if (existingCartItem) {
      const updatedCartItem: CartItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity + cartItem.quantity,
        itemValue: existingCartItem.itemValue + cartItem.itemValue,
      };
      this.userService.updateItemDataOfUser(
        this.username,
        'cartItem',
        this.stringifyCartItem(existingCartItem),
        this.stringifyCartItem(updatedCartItem)
      );
      cart[existingCartItemIndex].quantity += cartItem.quantity;
      cart[existingCartItemIndex].itemValue += cartItem.itemValue;
    } else {
      cart.push(cartItem);
      const cartItemData = this.stringifyCartItem(cartItem);
      this.userService.addItemDataToUser(
        this.username,
        'cartItem',
        cartItemData
      );
    }
    this.saveCart(cart);
    this.cartItemSubject.next(cart.length);
  }
  private stringifyCartItem(cartItem: CartItem): string {
    return `${cartItem.item}-${cartItem.color}-${cartItem.variant}-${cartItem.quantity}-${cartItem.itemValue}-${cartItem.checked}`;
  }
  removeItemFromCart(cartItem: CartItemData) {
    const cart = this.getCart();
    const existingCartItem = cart.find(
      (i) =>
        i.item === cartItem.item &&
        i.color === cartItem.color &&
        i.variant === cartItem.variant
    );
    const updateCart = cart.filter(
      (i) =>
        !(
          i.item === cartItem.item &&
          i.color === cartItem.color &&
          i.variant === cartItem.variant
        )
    );
    this.saveCart(updateCart);
    this.cartItemSubject.next(updateCart.length);
    if (existingCartItem) {
      this.userService.removeItemDataFromUser(
        this.username,
        'cartItem',
        this.stringifyCartItem(cartItem)
      );
    }
  }
  updateCartItem(
    cartItem: CartItemData,
    itemQuantity: number,
    itemValue: number
  ) {
    console.log('cartitem', cartItem);
    const cart = this.getCart();
    const cartItemIndex = cart.findIndex(
      (i) =>
        i.item === cartItem.item &&
        i.color === cartItem.color &&
        i.variant === cartItem.variant
    );
    const existingCartItem = cart[cartItemIndex];
    const previousItem = { ...existingCartItem };

    if (cartItemIndex !== -1) {
      cart[cartItemIndex].quantity = itemQuantity;
      cart[cartItemIndex].itemValue = itemValue;
      cart[cartItemIndex].checked = cartItem.checked;
    }
    this.saveCart(cart);
    this.cartItemSubject.next(cart.length);
    if (existingCartItem) {
      const update = { ...existingCartItem };
      update.quantity = itemQuantity;
      update.itemValue = itemValue;
      update.checked = cartItem.checked;

      this.userService.updateItemDataOfUser(
        'shree',
        'cartItem',
        this.stringifyCartItem(previousItem),
        this.stringifyCartItem(update)
      );
    }
  }
  clearCart() {
    localStorage.removeItem('cart');
    this.userService.removeAllDataItemsFromUser(this.username, 'cartItem');
    this.cartItemSubject.next(0);
  }
}

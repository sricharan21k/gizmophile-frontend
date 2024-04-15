import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/user/user';
import { Observable } from 'rxjs';
import { Address } from '../model/address';
import { Order } from '../model/order';
import { NewUser } from '../model/user/new-user';
import { UserInfo } from '../model/user/user-info';
import { ReturnData } from '../model/return-item';
import { API_URL } from '../app.constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiBaseUrl = `${API_URL}:8080/users`;
  constructor(private http: HttpClient) {}

  getUsername(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).username : '';
  }

  getDefaultAddress(): number {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).defaultAddress : 1;
  }

  updatePassword(email: string, password: string) {
    return this.http.patch<User>(`${this.apiBaseUrl}/password`, {
      email: email,
      password: password,
    });
  }
  checkUserExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiBaseUrl}/check/${username}`);
  }
  addNewUser(user: NewUser): Observable<User> {
    return this.http.post<User>(`${this.apiBaseUrl}/register`, user);
  }
  getUser(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiBaseUrl}/${username}`);
  }
  updateUser(username: string, userData: UserInfo): Observable<User> {
    return this.http.put<User>(`${this.apiBaseUrl}/${username}`, userData);
  }
  uploadProfile(image: FormData, username: string) {
    return this.http.post<string>(
      `${this.apiBaseUrl}/${username}/profile-image`,
      image
    );
  }
  getProfileImage(username: string) {
    return `${this.apiBaseUrl}/${username}/profile-image`;
  }
  deleteImage(filename: String, username: string) {
    return this.http.delete<boolean>(
      `${this.apiBaseUrl}/${username}/profile-image/${filename}`
    );
  }
  getAddresses(username: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiBaseUrl}/${username}/addresses`);
  }
  getAddress(username: string, addressId: number): Observable<Address> {
    return this.http.get<Address>(
      `${this.apiBaseUrl}/${username}/address/${addressId}`
    );
  }
  addAddress(username: string, address: Address): Observable<Address> {
    return this.http.post<Address>(
      `${this.apiBaseUrl}/${username}/address`,
      address
    );
  }
  updateAddress(username: string, address: Address) {
    this.http
      .put<Address>(`${this.apiBaseUrl}/${username}/address`, address)
      .subscribe((res) => console.log(res));
  }
  setDefaultAddress(username: string, addressId: number): Observable<Address> {
    return this.http.patch<Address>(
      `${this.apiBaseUrl}/${username}/address/${addressId}`,
      {}
    );
    // .subscribe((res) => console.log(res));
  }
  deleteAddress(username: string, addressId: number) {
    return this.http.delete<boolean>(
      `${this.apiBaseUrl}/${username}/address/${addressId}`
    );
  }
  placeOrder(username: string, order: Order): Observable<number> {
    return this.http.post<number>(
      `${this.apiBaseUrl}/${username}/order`,
      order
    );
  }
  getOrders(username: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiBaseUrl}/${username}/orders`);
  }
  getOrder(username: string, orderId: number): Observable<Order> {
    return this.http.get<Order>(
      `${this.apiBaseUrl}/${username}/order/${orderId}`
    );
    // .subscribe((res) => console.log(res));
  }
  returnOrReplaceItems(
    username: string,
    orderId: number,
    type: string,
    data: ReturnData[]
  ) {
    return this.http.patch<boolean>(
      `${this.apiBaseUrl}/${username}/order/${orderId}/${type}`,
      data
    );
  }
  updateFeedback(username: string, orderId: number, feedbackData: any) {
    return this.http.patch<boolean>(
      `${this.apiBaseUrl}/${username}/order/feedback/${orderId}`,
      feedbackData
    );
  }
  cancelOrder(username: string, orderId: number) {
    this.http
      .patch(`${this.apiBaseUrl}/${username}/order/${orderId}/cancel`, {})
      .subscribe();
  }
  getItemDataFromUser(username: string, type: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiBaseUrl}/${username}/data/${type}`
    );
  }

  addItemDataToUser(username: string, type: string, item: string): void {
    console.log('item', item);
    this.http
      .post(`${this.apiBaseUrl}/${username}/data/${type}`, item)
      .subscribe();
  }
  updateItemDataOfUser(
    username: string,
    type: string,
    previousItem: string,
    currentItem: string
  ) {
    const updateItem = {
      previousValue: previousItem,
      currentValue: currentItem,
    };
    console.log('data', updateItem);
    this.http
      .put(`${this.apiBaseUrl}/${username}/data/${type}`, updateItem)
      .subscribe();
  }
  removeItemDataFromUser(username: string, type: string, item: string): void {
    this.http
      .delete(`${this.apiBaseUrl}/${username}/data/${type}/${item}`)
      .subscribe();
  }
  removeAllDataItemsFromUser(username: string, type: string) {
    this.http.delete(`${this.apiBaseUrl}/${username}/data/${type}`).subscribe();
  }
}

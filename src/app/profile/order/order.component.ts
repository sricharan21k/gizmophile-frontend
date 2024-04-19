import { Component } from '@angular/core';
import { Order } from '../../model/order';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Utils } from '../../common/utilities';
import { OrderItem } from '../../model/order-item';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  toPascalCase = Utils.toPascalCase;
  showSpinner: boolean = false;
  username: string = '';
  activeStep: number = 1;
  orderStatus: string = 'PLACED';
  orders: Order[] = [];
  showCancelModals: { [key: number]: boolean } = {};
  showTrackModals: { [key: number]: boolean } = {};

  constructor(
    private userService: UserService,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.showSpinner = true;
    this.username = this.getUsername();
    this.userService.getOrders(this.username).subscribe((data) => {
      this.showSpinner = false;
      this.orders = data;
      this.orders.forEach(
        (i) => (this.showCancelModals[i.id as number] = false)
      );
    });
  }

  // getProductImage(item: OrderItem) {
  //   const colorId = item.image;
  //   return this.productService.getProductImage(colorId as number);
  // }
  // getProductImageUrl(item: OrderItem) {
  //   const colorId = item.image;
  //   return this.productService.getProductImageUrl(colorId as number);
  // }

  getUsername(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).username : '';
  }
  cancelOrder(orderId: any) {
    this.userService.cancelOrder(this.username, orderId);
    this.closeCancelModal(orderId);
  }

  openCancelModal(orderId: any) {
    this.showCancelModals[orderId] = true;
  }

  closeCancelModal(orderId: any) {
    this.showCancelModals[orderId] = false;
  }

  openTrackModal(orderId: any) {
    this.showTrackModals[orderId] = true;
  }

  closeTrackModal(orderId: any) {
    this.showTrackModals[orderId] = false;
  }
}

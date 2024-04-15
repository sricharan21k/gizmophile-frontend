import { OrderItem } from './order-item';

export interface Order {
  id?: number;
  orderId?: string;
  orderDate?: Date;
  deliveryDate?: Date;
  orderAmount?: number;
  paymentMode?: string;
  status?: string;
  shippingAddress?: number;
  items?: OrderItem[];
  deliveryCharge?: number;
  feedbackType?: string;
  feedback?: string;
}

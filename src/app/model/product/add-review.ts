export interface AddReview {
  username: string;
  orderId: number;
  orderItemId: number;
  content: string;
  highlights?: string[];
  images?: string[];
}

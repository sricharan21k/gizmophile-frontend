export interface OrderItem {
  item: number;
  id?: number;
  itemName?: string;
  type?: string;
  color?: string;
  variant?: string;
  quantity: number;
  price?: number;
  itemValue?: number;
  image?: number;
  rating?: number;
  isReviewed?: boolean;
  reviewId?: number;
  returnedQuantity?: number;
  replacedQuantity?: number;
  returnReason?: string;
  replaceReason?: string;
}

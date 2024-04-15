import { Product } from './product/product';

export interface CartItemData {
  item: number;
  color: string;
  variant: string;
  quantity: number;
  itemValue: number;
  checked: boolean;
  product: Product;
}

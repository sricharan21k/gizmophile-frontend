import { Product } from './product/product';

export interface CartItem {
  item: number;
  color: string;
  variant: string;
  quantity: number;
  itemValue: number;
  checked: boolean;
}

import { Product } from './product/product';

export interface LikedItem {
  item: string;
  product: Product;
  color: number;
  variant: number;
}

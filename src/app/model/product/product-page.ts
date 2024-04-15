import { Product } from './product';

export interface ProductPage {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

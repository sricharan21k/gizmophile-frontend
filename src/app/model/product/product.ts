export interface Product {
  id: number;
  type: string;
  brand: string;
  model: string;
  description: string;
  baseVariant: number;
  stock: number;
  rating: number;
  specs: string[];
  variants: number[];
  colors: number[];
}

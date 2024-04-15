export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  dateOfBirth?: Date;
  email: string;
  phone?: string;
  profile?: string;
  defaultAddress?: number;
  orders?: number;
  reviews?: number;
  addresses?: number;
  cartItems: string[];
  wishlistItems: string[];
  browsedItems: string[];
}

import { ProductInfo } from './product/product-info';
import { UserProfile } from './user/user-profile';

export interface Review {
  id: number;
  rating: number;
  content: string;
  likes: number;
  replies: number;
  posted: Date;
  lastUpdated: Date;
  images: string[];
  highlights: string[];
  profile: UserProfile;
  product: ProductInfo;
}

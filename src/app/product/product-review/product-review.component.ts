import { Component, Input } from '@angular/core';
import { Review } from '../../model/review';
import { Reply } from '../../model/reply';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../model/product/product';
import { ReviewService } from '../../services/review.service';
import { CommonModule } from '@angular/common';
import { ProductReviewRepliesComponent } from '../product-review-replies/product-review-replies.component';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user/user';

@Component({
  selector: 'app-product-review',
  standalone: true,
  templateUrl: './product-review.component.html',
  styleUrl: './product-review.component.css',
  imports: [CommonModule, RouterModule, ProductReviewRepliesComponent],
})
export class ProductReviewComponent {
  reviews: Review[] = [];
  showReplies: boolean = false;

  replies: Reply[] = [];
  currentReview?: Review;

  showGalleryModals: { [key: number]: boolean } = {};

  currentImage: string = '';
  currentImageIndex: number = 0;
  firstImage: boolean = false;
  lastImage: boolean = false;

  imageGallery: string[] = [];

  @Input()
  product?: Product;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const productId = +(params.get('id') as string);
      if (productId) {
        this.reviewService
          .getProductReviews(productId)
          .subscribe((data) => (this.reviews = data));
      }
    });
  }
  getProfile(username: string) {
    return this.userService.getProfileImage(username);
  }

  getImage(filename: string, reviewId: number) {
    return this.reviewService.getImage(filename, reviewId ?? 0);
  }

  getReplies(review: Review) {
    this.showReplies = true;
    this.currentReview = review;

    this.reviewService.getReviewReplies(review.id).subscribe((data) => {
      this.replies = data;
      console.log('replies', this.replies);
    });
  }
  likeReview(reviewId: number) {}
  hideReplies(value: any) {
    this.showReplies = !value;
  }

  openGalleryModal(review: Review, index: number) {
    // if(index <= this.imageGallery.length-1 && index >= 0){
    this.imageGallery = review.images;

    this.currentImage = this.imageGallery[index];
    this.currentImageIndex = index;
    this.showGalleryModals[review.id] = true;
  }

  nextImage() {
    if (this.currentImageIndex + 1 < this.imageGallery.length) {
      this.currentImageIndex++;
      this.currentImage = this.imageGallery[this.currentImageIndex];
      this.firstImage = false;
      if (this.currentImageIndex === this.imageGallery.length - 1) {
        this.lastImage = true;
      } else {
        this.lastImage = false;
      }
      console.log('curr', this.currentImageIndex);
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.currentImage = this.imageGallery[this.currentImageIndex];
      this.lastImage = false;
      if (this.currentImageIndex === 0) {
        this.firstImage = true;
      } else {
        this.firstImage = false;
      }
      console.log('curr', this.currentImageIndex);
    }
  }

  closeGalleryModal(reviewId: number) {
    this.showGalleryModals[reviewId] = false;
    this.imageGallery = [];
  }
}

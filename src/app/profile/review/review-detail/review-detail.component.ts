import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap, forkJoin } from 'rxjs';
import { AudioHighlights } from '../../../common/highlights/audio-highlights';
import { LaptopHighlights } from '../../../common/highlights/laptop-highlights';
import { PhoneHighlights } from '../../../common/highlights/phone-highlights';
import { TabletHighlights } from '../../../common/highlights/tablet-highlights';
import { WatchHighlights } from '../../../common/highlights/watch-highlights';
import { Reply } from '../../../model/reply';
import { Review } from '../../../model/review';
import { UpdateReview } from '../../../model/update-review';
import { AppService } from '../../../services/app.service';
import { ReviewService } from '../../../services/review.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './review-detail.component.html',
  styleUrl: './review-detail.component.css',
})
export class ReviewDetailComponent {
  username: string = '';
  review?: Review;
  replies?: Reply[];

  rating: number = 0;
  content = '';

  highlights: string[] = [];
  images: string[] = [];
  defaultHighlights: string[] = [];
  otherHighlights: string[] = [];

  ratingChanged: boolean = false;

  currentImage: string = '';
  currentImageIndex: number = 0;
  firstImage: boolean = false;
  lastImage: boolean = false;

  imageGallery: string[] = [];

  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  dataLoaded: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private userService: UserService,
    private reviewService: ReviewService
  ) {}
  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = +(params.get('reviewId') as string);
          return forkJoin([
            this.reviewService.getReview(id),
            this.reviewService.getReviewReplies(id),
          ]);
        })
      )
      .subscribe(([review, replies]) => {
        this.review = review;
        this.rating = review.rating;
        this.replies = replies;
        this.imageGallery = review.images;
        this.currentImage = this.imageGallery[0] ? this.imageGallery[0] : '';
        this.dataLoaded = true;
      });
  }

  updateRating(rating: number) {
    this.reviewService
      .updateRating(rating, this.review?.id as number)
      .subscribe((res) => {
        if (res) {
          this.rating = rating;
          this.ratingChanged = true;
          this.dismissToast();
        }
      });
  }

  editReview() {
    switch (this.review?.product.productType) {
      case 'phone': {
        this.defaultHighlights = PhoneHighlights;
        break;
      }
      case 'tablet': {
        this.defaultHighlights = TabletHighlights;
        break;
      }
      case 'laptop': {
        this.defaultHighlights = LaptopHighlights;
        break;
      }
      case 'watch': {
        this.defaultHighlights = WatchHighlights;
        break;
      }
      case 'audio': {
        this.defaultHighlights = AudioHighlights;
        break;
      }
      default:
        this.defaultHighlights = [];
    }
    this.content = this.review?.content ?? '';
    const highlights = this.review?.highlights ?? [];
    this.otherHighlights = this.defaultHighlights.filter(
      (i) => !highlights.includes(i)
    );
    this.openEditModal();
  }

  updateReview() {
    this.review!.content = this.content;

    const review: UpdateReview = {
      content: this.content,
      highlights: [...(this.review?.highlights ?? [])],
      images: [...this.images],
    };

    this.reviewService
      .updateReview(review, this.review?.id as number)
      .subscribe((res) => {
        this.reviewService
          .getReview(this.review?.id as number)
          .subscribe((data) => {
            this.review = data;
            this.closeEditModal();
          });
      });
  }

  uploadImages(event: any) {
    const images: FileList = event.target.files;
    const imageData = new FormData();
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        imageData.append('imageFiles', images[i], images[i].name);
      }
    }

    this.reviewService
      .uploadImages(imageData, this.review?.id ?? 0)
      .subscribe((data) => {
        if (data) {
          this.imageGallery = data;
          this.currentImage = this.imageGallery[0];
        }
      });
  }
  getProductImage() {
    const colorId = this.review?.product.productImage;
    return `http://localhost:8080/products/product-image/${colorId}`;
  }

  getImage() {
    return this.reviewService.getImage(this.currentImage, this.review?.id ?? 0);
  }

  addHighlight(highlight: string) {
    const update = this.otherHighlights.filter((i) => i !== highlight);
    this.otherHighlights = update;
    if (!this.review?.highlights.includes(highlight)) {
      this.review?.highlights.push(highlight);
    }
  }

  removeHighlight(highlight: string) {
    const highlights = this.review?.highlights.filter((i) => i !== highlight);
    this.review!.highlights = [...(highlights as string[])];
    this.otherHighlights = [...this.otherHighlights, highlight];
  }

  openEditModal() {
    this.showEditModal = true;
  }
  closeEditModal() {
    this.showEditModal = false;
  }
  openDeleteModal() {
    this.showDeleteModal = true;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  dismissToast() {
    setTimeout(() => (this.ratingChanged = false), 1000);
  }

  deleteReview() {
    this.closeDeleteModal();
    this.reviewService
      .deleteReview(this.review?.id as number)
      .subscribe((res) => {
        this.appService.saveUserDataInApp(this.username);
        this.closeDeleteModal();
        this.router.navigate(['/profile/reviews']);
      });
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
}

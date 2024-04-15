import { Component } from '@angular/core';
import { Review } from '../../model/review';
import { Reply } from '../../model/reply';
import { AppService } from '../../services/app.service';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { UserService } from '../../services/user.service';
import { AudioHighlights } from '../../common/highlights/audio-highlights';
import { LaptopHighlights } from '../../common/highlights/laptop-highlights';
import { PhoneHighlights } from '../../common/highlights/phone-highlights';
import { TabletHighlights } from '../../common/highlights/tablet-highlights';
import { WatchHighlights } from '../../common/highlights/watch-highlights';
import { UpdateReview } from '../../model/update-review';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent {
  reviews: Review[] = [];
  replies: Reply[] = [];
  rating: number = 0;

  content = '';
  showSpinner: boolean = false;

  highlights: string[] = [];
  images: string[] = [];
  defaultHighlights: string[] = [];
  otherHighlights: string[] = [];

  ratingChanged: boolean = false;

  showModal: boolean = false;
  reviewId: number = 0;
  username: string = '';
  showModals: { [key: number]: boolean } = {};
  showGalleryModals: { [key: number]: boolean } = {};
  showDeleteModals: { [key: number]: boolean } = {};
  currentImage: string = '';
  currentImageIndex: number = 0;
  firstImage: boolean = false;
  lastImage: boolean = false;

  imageData: FormData;

  imageGallery: string[] = [];
  constructor(
    private appService: AppService,
    private userService: UserService,
    private reviewService: ReviewService
  ) {
    this.username = userService.getUsername();
    this.imageData = new FormData();
  }

  ngOnInit(): void {
    this.showSpinner = true;

    this.reviewService.getUserReviews(this.username).subscribe((data) => {
      this.showSpinner = false;
      this.reviews = data;
      this.reviews.forEach((i) => {
        this.showModals[i.id] = false;
        this.showGalleryModals[i.id] = false;
      });
    });
  }

  getReplies(reviewId: number) {
    this.reviewService
      .getReviewReplies(reviewId)
      .subscribe((data) => (this.replies = data));
  }

  updateRating(rating: number, reviewId: number) {
    const index = this.reviews.findIndex((i) => i.id === reviewId);
    this.reviews[index].rating = rating;

    this.reviewService.updateRating(rating, reviewId).subscribe();
    this.ratingChanged = true;
    this.dismissToast();
  }

  editReview(reviewId: number, type: any) {
    switch (type) {
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
    this.reviewId = reviewId;
    const index = this.reviews.findIndex((i) => i.id === reviewId);
    this.content = this.reviews[index].content;
    const highlights = this.reviews[index].highlights;

    this.otherHighlights = this.defaultHighlights.filter(
      (i) => !highlights.includes(i)
    );
    this.openModal(reviewId);
  }

  deleteReview(reviewId: number) {
    this.reviewService.deleteReview(reviewId).subscribe((res) => {
      if (res) {
        this.reviewService.getUserReviews(this.username).subscribe((data) => {
          this.reviews = data;
          this.appService.saveUserDataInApp(this.username);
          this.closeDeleteModal(reviewId);
        });
      }
    });
  }

  updateReview(reviewId: number) {
    const index = this.reviews.findIndex((i) => i.id === reviewId);

    const review: UpdateReview = {
      content: this.content,
      highlights: this.reviews[index].highlights,
    };

    this.reviewService.updateReview(review, reviewId).subscribe((res) => {
      if (res) {
        this.uploadImages(reviewId).subscribe((data) => {
          if (data) {
            this.reviewService
              .getUserReviews(this.username)
              .subscribe((data) => {
                if (data) {
                  this.reviews = data;
                  this.closeModal(reviewId);
                }
              });
          }
        });
      }
    });
  }

  selectImages(event: any, reviewId: number) {
    const images: FileList = event.target.files;
    const imageData = new FormData();
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        imageData.append('imageFiles', images[i], images[i].name);
      }
    }

    this.imageData = imageData;
  }

  uploadImages(reviewId: number) {
    return this.reviewService.uploadImages(this.imageData, reviewId);
  }

  getImage(filename: string, reviewId: number) {
    return this.reviewService.getImage(filename, reviewId ?? 0);
  }

  deleteImage(filename: string, reviewId: number) {
    this.reviewService.deleteImage(filename, reviewId).subscribe((res) => {
      if (res) {
        this.reviewService.getUserReviews(this.username).subscribe((data) => {
          if (data) {
            this.reviews = data;
          }
        });
      }
    });
  }

  addHighlight(highlight: string) {
    const update = this.otherHighlights.filter((i) => i !== highlight);
    this.otherHighlights = update;
    const index = this.reviews.findIndex((i) => i.id === this.reviewId);
    this.reviews[index].highlights.push(highlight);
  }

  removeHighlight(highlight: string) {
    const index = this.reviews.findIndex((i) => i.id === this.reviewId);
    const highlights = this.reviews[index].highlights.filter(
      (i) => i !== highlight
    );
    this.reviews[index].highlights = highlights;
    this.otherHighlights = [...this.otherHighlights, highlight];
  }

  dismissToast() {
    setTimeout(() => (this.ratingChanged = false), 1000);
  }

  openModal(reviewId: number) {
    this.showModals[reviewId] = true;
  }

  closeModal(reviewId: number) {
    this.showModals[reviewId] = false;
  }

  openDeleteModal(reviewId: number) {
    this.showDeleteModals[reviewId] = true;
  }

  closeDeleteModal(reviewId: number) {
    this.showDeleteModals[reviewId] = false;
  }

  openGalleryModal(review: Review, index: number) {
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

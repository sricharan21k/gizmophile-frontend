import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Reply } from '../../model/reply';
import { Review } from '../../model/review';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-review-replies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-review-replies.component.html',
  styleUrl: './product-review-replies.component.css',
})
export class ProductReviewRepliesComponent {
  @Input()
  review?: Review;
  @Input()
  replies: Reply[] = [];

  @Output()
  showReview = new EventEmitter<boolean>();
  constructor() {
    console.log('replies comp', this.replies);
  }

  hideReplies() {
    this.showReview.emit(true);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Reply } from '../../model/reply';
import { Review } from '../../model/review';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { User } from '../../model/user/user';
import { UserService } from '../../services/user.service';
import { AddReply } from '../../model/add-reply';

@Component({
  selector: 'app-product-review-replies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-review-replies.component.html',
  styleUrl: './product-review-replies.component.css',
})
export class ProductReviewRepliesComponent implements OnInit {
  @Input()
  review?: Review;
  @Input()
  replies: Reply[] = [];

  @Output()
  showReview = new EventEmitter<boolean>();

  user?: User;
  constructor(
    private userService: UserService,
    private reviewService: ReviewService
  ) {
    console.log('replies comp', this.replies);
  }
  ngOnInit(): void {
    this.userService
      .getUser(this.userService.getUsername())
      .subscribe((data) => (this.user = data));
  }

  hideReplies() {
    this.showReview.emit(true);
  }

  reply(reply: string) {
    const replyData: AddReply = {
      userId: this.user?.id as number,
      reviewId: this.review?.id as number,
      content: reply,
    };
    this.reviewService.addReply(replyData).subscribe((data) => {
      this.reviewService
        .getReviewReplies(this.review?.id as number)
        .subscribe((replies) => {
          this.replies = replies;
        });
    });
  }

  getImage(filename: string, reviewId: any) {
    return this.reviewService.getImage(filename, reviewId ?? 0);
  }

  getProfile(username: any) {
    return this.userService.getProfileImage(username);
  }
}

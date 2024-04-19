import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reply } from '../model/reply';
import { Review } from '../model/review';
import { AddRating } from '../model/add-rating';
import { AddReview } from '../model/product/add-review';
import { UpdateReview } from '../model/update-review';
import { API_URL } from '../app.constants';
import { AddReply } from '../model/add-reply';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiBaseUrl = `${API_URL}:8080/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiBaseUrl}/product/${productId}`);
  }

  getUserReviews(username: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiBaseUrl}/user/${username}`);
  }
  getReview(reviewId: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiBaseUrl}/review/${reviewId}`);
  }

  getReviewReplies(reviewId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(
      `${this.apiBaseUrl}/review/${reviewId}/replies`
    );
  }

  getImage(filename: string, reviewId: number) {
    return `${this.apiBaseUrl}/review/${reviewId}/image/${filename}`;
  }

  deleteImage(filename: String, reviewId: number) {
    return this.http.delete<boolean>(
      `${this.apiBaseUrl}/review/${reviewId}/image/${filename}`
    );
  }

  addRating(ratingData: AddRating) {
    return this.http.post(`${this.apiBaseUrl}/rating`, ratingData);
  }

  addReview(reviewData: AddReview) {
    return this.http.post<number>(`${this.apiBaseUrl}/review`, reviewData);
  }

  addReply(replyData: AddReply) {
    return this.http.post(`${this.apiBaseUrl}/reply`, replyData);
  }

  updateReview(request: UpdateReview, reviewId: number): Observable<Review> {
    return this.http.patch<Review>(
      `${this.apiBaseUrl}/review/${reviewId}`,
      request
    );
  }

  updateRating(rating: number, reviewId: number): Observable<number> {
    return this.http.patch<number>(
      `${this.apiBaseUrl}/rating/${reviewId}`,
      rating
    );
  }

  uploadImages(images: FormData, reviewId: number) {
    return this.http.put<string[]>(
      `${this.apiBaseUrl}/upload-images/${reviewId}`,
      images
    );
  }

  likeReview(reviewId: number): Observable<number> {
    return this.http.patch<number>(`${this.apiBaseUrl}/${reviewId}/like`, {});
  }

  deleteReview(reviewId: number) {
    console.log('delete', reviewId);
    return this.http.delete<boolean>(`${this.apiBaseUrl}/review/${reviewId}`);
  }
}

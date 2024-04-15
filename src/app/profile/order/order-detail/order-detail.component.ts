import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap, forkJoin, of } from 'rxjs';
import { AudioHighlights } from '../../../common/highlights/audio-highlights';
import { LaptopHighlights } from '../../../common/highlights/laptop-highlights';
import { PhoneHighlights } from '../../../common/highlights/phone-highlights';
import { TabletHighlights } from '../../../common/highlights/tablet-highlights';
import { WatchHighlights } from '../../../common/highlights/watch-highlights';
import { AddRating } from '../../../model/add-rating';
import { Address } from '../../../model/address';
import { Order } from '../../../model/order';
import { OrderItem } from '../../../model/order-item';
import { AddReview } from '../../../model/product/add-review';
import { AppService } from '../../../services/app.service';
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';
import { UserService } from '../../../services/user.service';
import { ReturnData } from '../../../model/return-item';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent {
  @ViewChild('reasonInput') reasonInput?: ElementRef;

  order?: Order;
  address?: Address;
  reviewId: number = 0;
  activeStep: number = 4;
  rating: number = 0;
  orderItems: OrderItem[] = [];
  itemId: number = 0;
  content = '';
  feedback: string = '';
  feedbackType: string = '';
  username: string = '';

  highlights: string[] = [];
  defaultHighlights: string[] = [];

  ratingChanged: boolean = false;
  showModal: boolean = false;
  showModals: { [key: number]: boolean } = {};
  showFeedbackModal: boolean = false;
  showReturnModal: boolean = false;
  showReplaceModal: boolean = false;
  returnItems: ReturnData[] = [];
  replaceItems: ReturnData[] = [];
  returnableItems: OrderItem[] = [];
  replacableItems: OrderItem[] = [];

  returnReason: { [key: number]: string } = {};
  replaceReason: { [key: number]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private productService: ProductService,
    private reviewService: ReviewService,
    private appService: AppService
  ) {}
  ngOnInit(): void {
    this.defaultHighlights = PhoneHighlights;
    this.username = this.userService.getUsername();
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const orderId = +(params.get('orderId') as string);
          return this.userService.getOrder(this.username, orderId).pipe(
            switchMap((order) => {
              const addressId = order.shippingAddress as number;
              return forkJoin([
                of(order),
                this.userService.getAddress(this.username, addressId),
              ]);
            })
          );
        })
      )
      .subscribe(([order, address]) => {
        this.order = order;
        this.address = address;
        this.feedback = order?.feedback ?? '';
        this.feedbackType = order?.feedbackType ?? '';

        this.order.items?.forEach((i) => {
          this.showModals[i.id as number] = false;
        });

        this.returnReason[0] = 'Item is not working';
        this.replaceReason[0] = 'Item is not working';
      });
  }

  getProductImage(item: OrderItem) {
    const colorId = item.image;
    return this.productService.getProductImage(colorId as number);
  }

  openModal(itemId: any, type: any) {
    this.highlights = [];
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

    this.showModals[itemId] = true;
  }
  closeModal(itemId: any) {
    this.showModals[itemId] = false;
  }

  rateOrderItem(rating: number, item: any) {
    const itemIndex = (this.order?.items ?? []).findIndex((i) => i.id === item);

    if (this.order && this.order.items && this.order.items[itemIndex]) {
      this.order.items[itemIndex].rating = rating;
    } else {
      // Handle the case where the structure isn't what you expect.
      console.error(
        'Cannot set rating: Order, items, or specific item does not exist.'
      );
    }
    const addRating: AddRating = {
      orderId: this.order?.id as number,
      orderItemId: item,
      rating: rating,
      username: this.username,
    };
    this.reviewService.addRating(addRating).subscribe();
    this.ratingChanged = true;
    this.dismissToast();
  }

  postReview(itemId: any) {
    const review: AddReview = {
      username: this.username,
      orderId: this.order?.id as number,
      orderItemId: itemId,
      content: this.content,
      highlights: [...this.highlights],
    };
    console.log(review);

    this.reviewService.addReview(review).subscribe((res) => {
      if (res) {
        this.userService
          .getOrder(this.username, this.order?.id as number)
          .subscribe((data) => {
            this.order = data;
            this.appService.saveUserDataInApp(this.username);
            this.closeModal(itemId);
          });
      }
    });
  }

  viewReview(itemId: any) {
    this.userService
      .getOrder(this.username, this.order?.id as number)
      .subscribe((data) => {
        const item = data.items?.find((i) => i.id === itemId);
        this.router.navigate(['profile/review', item?.reviewId]);
      });
  }

  setFeedbackType(type: string) {
    this.feedbackType = type;
    console.log('fb', type);
    this.showFeedbackModal = true;
  }

  updateFeedback() {
    const feedbackData = {
      feedback: this.feedback,
      feedbackType: this.feedbackType,
    };
    this.userService
      .updateFeedback(this.username, this.order?.id as number, feedbackData)
      .subscribe((res) => {
        if (res) {
          this.userService
            .getOrder(this.username, this.order?.id as number)
            .subscribe((data) => {
              this.order = data;
              this.closeFeedbackModal();
            });
        }
      });
  }

  addReturnItem(itemId: any, quantity: number, reason: string) {
    if (this.returnItems.map((i) => i.itemId).includes(itemId)) {
      this.returnItems = this.returnItems.filter((i) => i.itemId !== itemId);
    } else {
      const item: ReturnData = {
        itemId: itemId,
        quantity: quantity,
        reason: reason,
      };
      this.returnItems.push(item);
    }
  }
  addReplaceItem(itemId: any, quantity: number, reason: string) {
    const item: ReturnData = {
      itemId: itemId,
      quantity: quantity,
      reason: reason,
    };
    this.replaceItems.push(item);
  }

  updateReturnItems() {
    this.userService
      .returnOrReplaceItems(
        this.username,
        this.order?.id as number,
        'return',
        this.returnItems
      )
      .subscribe((res) => {
        if (res) {
          this.userService
            .getOrder(this.username, this.order?.id as number)
            .subscribe((data) => {
              this.order = data;
              this.closeReturnModal();
            });
        }
      });
  }
  updateReplaceItems() {
    this.userService
      .returnOrReplaceItems(
        this.username,
        this.order?.id as number,
        'replace',
        this.replaceItems
      )
      .subscribe((res) => {
        if (res) {
          this.userService
            .getOrder(this.username, this.order?.id as number)
            .subscribe((data) => {
              this.order = data;
              this.closeReplaceModal();
            });
        }
      });
  }

  subtotal() {
    return this.order?.items?.reduce((acc, curr) => {
      return acc + (curr.itemValue ?? 0);
    }, 0);
  }

  total() {
    return this.subtotal() ?? 0 + (this.order?.deliveryCharge ?? 0);
  }

  addHighlight(highlight: string) {
    const update = this.defaultHighlights.filter((i) => i !== highlight);
    this.defaultHighlights = update;

    this.highlights = [...this.highlights, highlight];
  }

  removeHighlight(highlight: string) {
    const update = this.highlights.filter((i) => i !== highlight);
    this.highlights = update;

    this.defaultHighlights = [...this.defaultHighlights, highlight];
  }

  dismissToast() {
    setTimeout(() => (this.ratingChanged = false), 1000);
  }
  cancelFeedbackChange() {
    console.log('fb2', this.feedbackType);
    this.feedbackType =
      this.feedbackType === 'positive' ? 'negative' : 'positive';
    console.log('fb3', this.feedbackType);
    this.closeFeedbackModal();
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
  }
  openReturnModal() {
    this.showReturnModal = true;
    console.log(this.order?.items);

    this.returnableItems =
      this.order?.items?.filter(
        (i) =>
          i.quantity > (i?.returnedQuantity ?? 0) + (i?.replacedQuantity ?? 0)
      ) ?? [];
  }
  closeReturnModal() {
    this.showReturnModal = false;
  }

  onReturnReasonInput(itemId: number, event: any) {
    this.returnReason[itemId] = event.target.value;
  }

  openReplaceModal() {
    this.showReplaceModal = true;
    this.replacableItems =
      this.order?.items?.filter(
        (i) =>
          (i.quantity ?? 0) >
          (i.returnedQuantity ?? 0) + (i.replacedQuantity ?? 0)
      ) ?? [];
  }
  closeReplaceModal() {
    this.showReplaceModal = false;
  }

  onReplaceReasonInput(itemId: number, event: any) {
    this.replaceReason[itemId] = event.target.value;
  }
}

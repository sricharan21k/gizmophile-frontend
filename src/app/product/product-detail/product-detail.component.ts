import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../model/product/product';
import { ProductVariant } from '../../model/product/product-variant';
import { ProductColor } from '../../model/product/product-color';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, of, switchMap, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { routeAnimationSlideUp } from '../../animations/route-animation';
import { CartItem } from '../../model/cart-item';
import { CartService } from '../../services/cart.service';
import { ProductReviewComponent } from '../product-review/product-review.component';
import { AppService } from '../../services/app.service';
import { Utils } from '../../common/utilities';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  animations: [routeAnimationSlideUp],
  imports: [CommonModule, ProductReviewComponent],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @HostBinding('@routeAnimationTrigger') routeAnimation = true;

  findCssColorName = Utils.findCSSColorName;
  product?: Product;
  variants: ProductVariant[] = [];
  colors: ProductColor[] = [];
  selectedColor?: number;
  selectedVariant?: number;
  wishlist: string[] = [];

  quantity: number = 1;

  private destroy$ = new Subject<void>();
  showSuccessToast: boolean = false;
  showFailureToast: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.wishlist = this.appService.getWishlist();
    console.log('wl', this.wishlist);
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap.pipe(takeUntil(this.destroy$)),
    ])
      .pipe(
        switchMap(([params, queryParams]) => {
          const productId = +(params.get('id') as string);
          this.appService.addToBrowsedList(productId + '');
          this.selectedVariant = +(queryParams.get('variant') as string);
          this.selectedColor = +(queryParams.get('color') as string);

          return this.productService.getProduct(productId).pipe(
            switchMap((product) => {
              this.product = product;
              this.product.variants.forEach((variantId) => {
                this.productService
                  .getProductVariant(variantId)
                  .subscribe((variant) => {
                    this.variants?.push(variant);
                  });
              });
              this.product.colors.forEach((colorId) => {
                this.productService
                  .getProductColor(colorId)
                  .subscribe((color) => {
                    this.colors?.push(color);
                  });
              });
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToCart() {
    const newCartItem: CartItem = {
      item: this.product?.id ?? 0,
      color: this.colors.find((color) => color.id === this.selectedColor)
        ?.color as string,
      variant: this.variants.find(
        (variant) => variant.id === this.selectedVariant
      )?.variant as string,
      quantity: this.quantity,
      itemValue:
        this.quantity *
        (this.variants.find((variant) => variant.id === this.selectedVariant)
          ?.price as number),
      checked: true,
    };
    this.cartService.addItemToCart(newCartItem);
    this.router.navigate(['/cart']);
  }

  getVariants() {
    return this.variants?.map((variant) => variant.variant);
  }

  getColors() {
    return this.colors?.map((color) => color.color);
  }

  getVariant() {
    return this.variants?.find((variant) => variant.id === this.selectedVariant)
      ?.variant;
  }

  getPrice() {
    return this.variants?.find((variant) => variant.id === this.selectedVariant)
      ?.price;
  }

  getColor() {
    return this.colors?.find((color) => color.id === this.selectedColor)?.color;
  }
  getColorName(color: string) {
    return color.split(' ').length > 2
      ? color.split(' ').slice(0, 2).join(' ')
      : color;
  }

  getImage() {
    return this.productService.getProductImage(this.selectedColor as number);
  }

  getProductImageUrl() {
    return this.colors.find((color) => color.id === this.selectedColor)?.image;
  }

  selectVariant(selectedVariant: string) {
    this.selectedVariant = this.variants.find(
      (variant) => variant.variant === selectedVariant
    )?.id;
  }

  selectColor(selectedColor: string) {
    this.selectedColor = this.colors.find(
      (color) => color.color === selectedColor
    )?.id;
  }

  isCurrentVariant(selectedVariant: string) {
    const variant = this.variants.find(
      (variant) => variant.variant === selectedVariant
    )?.id;

    return this.selectedVariant === variant;
  }

  isCurrentColor(selectedColor: string) {
    const color = this.colors.find(
      (color) => color.color === selectedColor
    )?.id;

    return this.selectedColor === color;
  }

  toggleWishlistItem() {
    const itemFound = this.wishlist.includes(this.getItem());
    if (!itemFound) {
      this.addToWishlist();
    } else {
      this.removeFromWishlist();
    }
  }

  addToWishlist() {
    this.wishlist = [...this.wishlist, this.getItem()];
    this.appService.addToWishlist(this.getItem());
    this.showSuccessToast = true;
    this.dismissSuccessToast();
  }

  removeFromWishlist() {
    const update = this.wishlist.filter((i) => i !== this.getItem());
    this.wishlist = update;
    this.appService.removeFromWishlist(this.getItem());
    this.showFailureToast = true;
    this.dismissFailureToast();
  }
  checkLikedItem() {
    return this.wishlist.includes(this.getItem());
  }

  getItem() {
    return `${this.product?.id}-${this.selectedColor}-${this.selectedVariant}`;
  }

  dismissSuccessToast() {
    setTimeout(() => (this.showSuccessToast = false), 1000);
  }
  dismissFailureToast() {
    setTimeout(() => (this.showFailureToast = false), 1000);
  }
}

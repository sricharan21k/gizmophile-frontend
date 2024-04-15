import { Component } from '@angular/core';
import { CartItemData } from '../../model/cart-item-data';
import { LikedItem } from '../../model/liked-item';
import { Product } from '../../model/product/product';
import { AppService } from '../../services/app.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { CartItem } from '../../model/cart-item';
import { ProductVariant } from '../../model/product/product-variant';
import { ProductColor } from '../../model/product/product-color';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { switchMap, forkJoin, catchError, of, map } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  wishlist: LikedItem[] = [];
  variants: ProductVariant[] = [];
  colors: ProductColor[] = [];
  showModal: boolean = false;
  showAddedToCartToast: boolean = false;

  dataLoaded: boolean = false;
  constructor(
    private appService: AppService,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const wishlist = this.appService.getWishlist();
    if (wishlist.length) {
      wishlist.forEach((item) => {
        const itemData = item.split('-').map(Number);
        this.productService
          .getProduct(itemData[0])
          .pipe(
            switchMap((product: Product) => {
              const variantObservables = product.variants.map((variantId) =>
                this.productService
                  .getProductVariant(variantId)
                  .pipe(
                    catchError((error) =>
                      of(`Error fetching variant: ${error}`)
                    )
                  )
              );
              const colorObservables = product.colors.map((colorId) =>
                this.productService
                  .getProductColor(colorId)
                  .pipe(
                    catchError((error) => of(`Error fetching color: ${error}`))
                  )
              );

              return forkJoin([
                ...variantObservables,
                ...colorObservables,
              ]).pipe(
                map((results) => {
                  const variants = results.slice(
                    0,
                    product.variants.length
                  ) as ProductVariant[];
                  const colors = results.slice(
                    product.variants.length
                  ) as ProductColor[];
                  return { product, variants, colors };
                })
              );
            })
          )
          .subscribe(({ product, variants, colors }) => {
            this.variants.push(...variants);
            this.colors.push(...colors);

            const likedItem: LikedItem = {
              item: item,
              product: product,
              color: itemData[1],
              variant: itemData[2],
            };
            this.wishlist.push(likedItem);
            this.dataLoaded = true;
          });
      });
    }
  }

  removeFromWishlist(item: string) {
    this.appService.removeFromWishlist(item);
    const update = this.wishlist.filter((i) => i.item !== item);
    this.wishlist = update;
  }
  clearWishlist() {
    this.wishlist = [];
    this.appService.clearWishlist();
    this.closeModal();
  }

  getProductColor(colorId: number) {
    return this.colors.find((color) => color.id === colorId)?.color;
  }

  getProductVariant(variantId: number) {
    return this.variants.find((variant) => variant.id === variantId)?.variant;
  }

  getProductImage(likedItem: LikedItem) {
    const colorId = this.colors.find(
      (color) => color.id === likedItem.color
    )?.id;
    return this.productService.getProductImage(colorId as number);
  }

  addToCart(likedItem: LikedItem) {
    this.showAddedToCartToast = true;
    const newCartItem: CartItem = {
      item: likedItem.product.id,
      color: this.getProductColor(likedItem.color) as string,
      variant: this.getProductVariant(likedItem.variant) as string,
      quantity: 1,
      itemValue: this.variants.find(
        (variant) => variant.id === likedItem.variant
      )?.price as number,
      checked: true,
    };
    this.cartService.addItemToCart(newCartItem);
    this.dismissAddedToCartToast();
  }

  openModal() {
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }

  dismissAddedToCartToast() {
    setTimeout(() => (this.showAddedToCartToast = false), 1000);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { CartItemData } from '../../model/cart-item-data';
import { ProductVariant } from '../../model/product/product-variant';
import { ProductColor } from '../../model/product/product-color';
import { switchMap, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './cart-items.component.html',
  styleUrl: './cart-items.component.css',
})
export class CartItemsComponent implements OnInit {
  cartItems: CartItemData[] = [];
  variants: ProductVariant[] = [];
  colors: ProductColor[] = [];

  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // this.cartService.getCart().forEach((item) => {
    //   this.productService.getProduct(item.item).subscribe((product) => {
    //     console.log('product', product);
    //     product.variants.forEach((variantId) =>
    //       this.productService
    //         .getProductVariant(variantId)
    //         .subscribe((variant) => this.variants.push(variant))
    //     );

    //     product.colors.forEach((colorId) =>
    //       this.productService
    //         .getProductColor(colorId)
    //         .subscribe((color) => this.colors.push(color))
    //     );
    //     const cartItem: CartItemData = {
    //       ...item,
    //       product: product,
    //     };
    //     this.cartItems.push(cartItem);
    //   });
    // });
    const cartItems = this.cartService.getCart();
    cartItems.forEach((item) => {
      this.productService
        .getProduct(item.item)
        .pipe(
          switchMap((product) => {
            // Handling asynchronous calls for variants and colors in parallel
            const variantObservables = product.variants.map((variantId) =>
              this.productService.getProductVariant(variantId)
            );
            const colorObservables = product.colors.map((colorId) =>
              this.productService.getProductColor(colorId)
            );

            // forkJoin waits for all observables to complete and then emits the results as an array
            return forkJoin([...variantObservables, ...colorObservables]).pipe(
              switchMap((results) => {
                const variants = results.slice(
                  0,
                  product.variants.length
                ) as ProductVariant[];
                const colors = results.slice(
                  product.variants.length
                ) as ProductColor[];

                // Updating variants and colors with the fetched data
                this.variants.push(...variants);
                this.colors.push(...colors);

                // Creating a new cart item object with the additional product info
                const cartItem: CartItemData = {
                  ...item,
                  product: product,
                };
                return of(cartItem); // Wrapping the cartItem in an observable
              })
            );
          })
        )
        .subscribe({
          next: (cartItem) => {
            this.cartItems.push(cartItem);
          },
          error: (err) => console.error(err),
          // No need for a complete handler in this context
        });
    });
  }

  getVariantId(cartItem: CartItemData) {
    return this.variants
      .filter((variant) => variant.productId === cartItem.item)
      .find((variant) => variant.variant === cartItem.variant)?.id;
  }

  getColorId(cartItem: CartItemData) {
    return this.colors
      .filter((color) => color.productId === cartItem.item)
      .find((color) => color.color === cartItem.color)?.id;
  }

  getProductVariant(variantId: number) {
    return this.productService.getProductVariant(variantId);
  }

  getProductColor(colorId: number) {
    return this.productService.getProductColor(colorId);
  }

  getProductImage(cartItemData: CartItemData) {
    const colorId = this.colors
      .filter((color) => color.productId === cartItemData.item)
      .find((color) => color.color === cartItemData.color)?.id;
    return this.productService.getProductImage(colorId as number);
  }

  getPrice(productId: number, productVariant: string) {
    return (
      this.variants
        .filter((variant) => variant.productId === productId)
        .find((variant) => variant.variant === productVariant)?.price ?? 0
    );
  }

  toggleSelectAll() {
    if (this.areAllSelected()) {
      this.cartItems.forEach((i) => (i.checked = false));
    } else {
      this.cartItems.forEach((i) => (i.checked = true));
    }
  }
  areAllSelected() {
    return this.cartItems.every((i) => i.checked);
  }

  incrementQuantity(cartItem: CartItemData) {
    const itemIndex = this.cartItems.findIndex(
      (i) =>
        i.item === cartItem.item &&
        i.color === cartItem.color &&
        i.variant === cartItem.variant
    );
    const existingCartItem = this.cartItems[itemIndex];
    const variantValue = this.getPrice(cartItem.item, cartItem.variant);

    if (itemIndex != -1) {
      this.cartItems[itemIndex].quantity += 1;
      this.cartItems[itemIndex].itemValue += variantValue;
    }
    this.cartService.updateCartItem(
      existingCartItem,
      this.cartItems[itemIndex].quantity,
      this.cartItems[itemIndex].itemValue
    );
  }

  decrementQuantity(cartItem: CartItemData) {
    const itemIndex = this.cartItems.findIndex(
      (i) =>
        i.item === cartItem.item &&
        i.color === cartItem.color &&
        i.variant === cartItem.variant
    );
    const existingCartItem = this.cartItems[itemIndex];

    const variantValue = this.getPrice(cartItem.item, cartItem.variant);

    if (itemIndex != -1) {
      this.cartItems[itemIndex].quantity -= 1;
      this.cartItems[itemIndex].itemValue -= variantValue;
    }
    this.cartService.updateCartItem(
      existingCartItem,
      this.cartItems[itemIndex].quantity,
      this.cartItems[itemIndex].itemValue
    );
  }

  removeItemFromCart(cartItem: CartItemData) {
    this.cartItems = this.cartItems.filter(
      (i) =>
        !(
          i.item === cartItem.item &&
          i.color === cartItem.color &&
          i.variant === cartItem.variant
        )
    );

    this.cartService.removeItemFromCart(cartItem);
  }

  toggleCheckout(cartItem: CartItemData) {
    if (cartItem.checked) {
      console.log('checked', cartItem.checked);
      cartItem.checked = false;
      console.log('ver', cartItem.checked);
    } else {
      cartItem.checked = true;
    }
    this.cartService.updateCartItem(
      cartItem,
      cartItem.quantity,
      cartItem.itemValue
    );
  }

  clearCart() {
    this.cartItems = [];

    this.cartService.clearCart();
  }

  cartValue(): number {
    return this.cartItems
      .filter((i) => i.checked)
      .reduce((acc, curr) => {
        return acc + curr.itemValue;
      }, 0);
  }

  checkout() {
    return this.cartItems.filter((i) => i.checked).length;
  }
}

import { Component, HostBinding, OnInit } from '@angular/core';
import { routeAnimationSlideUp } from '../animations/route-animation';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Utils } from '../common/utilities';
import { Product } from '../model/product/product';
import { ProductService } from '../services/product.service';
import { ProductVariant } from '../model/product/product-variant';
import { ProductColor } from '../model/product/product-color';
import { ProductPage } from '../model/product/product-page';
import { ObservableInput, forkJoin, map, switchMap } from 'rxjs';
import { cardAnimationFadeIn } from '../animations/card-animations';
import { CartItem } from '../model/cart-item';
import { CartService } from '../services/cart.service';
import { AppService } from '../services/app.service';
import { dropdownAnimationFade } from '../animations/dropdown-animation';
// import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  animations: [
    routeAnimationSlideUp,
    cardAnimationFadeIn,
    dropdownAnimationFade,
  ],
})
export class ProductComponent implements OnInit {
  @HostBinding('@routeAnimationTrigger') routeAnimation = true;

  // toPascalCase = Utils.toPascalCase;

  showBrandDropdown: boolean = false;
  productType: string = '';

  sortBy: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  selectedBrands: string[] = [];
  wishlist: string[] = [];

  page?: ProductPage;
  currentPage: number = 0;
  pageSize: number = 10;
  previousPage: number = 0;
  nextPage: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;

  products: Product[] = [];
  brands: string[] = [];
  productVariants: ProductVariant[] = [];
  productColors: ProductColor[] = [];

  inStock: boolean = false;
  searchKeyword: string = '';

  variantAndColor: { [key: number]: [number, number] } = {};

  dataLoaded: boolean = false;

  showSuccessToast: boolean = false;
  showFailureToast: boolean = false;
  showAddedToCartToast: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const productType = params.get('type') as string;
          this.productType = productType;
          this.wishlist = this.appService.getWishlist();
          this.getBrands(productType);
          return this.route.queryParamMap;
        }),
        switchMap((params) => {
          const keyword = params.get('keyword') as string;
          this.searchKeyword = keyword;
          if (this.productType === 'search' && keyword) {
            return this.productService.getProductsByType(
              this.productType,
              0,
              this.pageSize,
              false,
              undefined,
              'asc',
              undefined,
              keyword
            );
          } else {
            console.log('type', this.productType);
            return this.productService.getProductsByType(
              this.productType,
              0,
              this.pageSize,
              false
            );
          }
        }),
        map((productPage) => {
          this.page = productPage;
          this.products = productPage.products;

          const colorIds = new Set();
          const variantIds = new Set();

          this.products.forEach((product) => {
            this.variantAndColor[product.id] = [
              product.variants[0],
              product.colors[0],
            ];

            product.colors.forEach((id) => colorIds.add(id));
            product.variants.forEach((id) => variantIds.add(id));
          });

          return {
            colorIds: Array.from(colorIds),
            variantIds: Array.from(variantIds),
          };
        }),
        switchMap(({ colorIds, variantIds }) =>
          forkJoin({
            colors: forkJoin(
              colorIds.map((id) => this.getProductColor(id as number))
            ),
            variants: forkJoin(
              variantIds.map((id) => this.getProductVariant(id as number))
            ),
          })
        )
      )
      .subscribe(({ colors, variants }) => {
        this.productColors = colors;
        this.productVariants = variants;
        this.dataLoaded = true;
      });
  }

  getPage(
    pageNumber: number,
    pageSize: number,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    this.dataLoaded = false; // Reset data loading state
    this.currentPage = pageNumber;

    // Chain of observables to first fetch the products by type, and then fetch their variants and colors
    this.productService
      .getProductsByType(
        this.productType,
        pageNumber,
        pageSize,
        this.inStock,
        sortBy,
        sortOrder,
        this.selectedBrands,
        this.searchKeyword
      )
      .pipe(
        map((productPage) => {
          this.page = productPage;
          this.products = productPage.products;

          // Collect all variant and color IDs
          const colorIds = new Set();
          const variantIds = new Set();

          this.products.forEach((product) => {
            this.variantAndColor[product.id] = [
              product.variants[0],
              product.colors[0],
            ];
            product.variants.forEach((variant) => variantIds.add(variant));
            product.colors.forEach((color) => colorIds.add(color));
          });

          return {
            colorIds: Array.from(colorIds),
            variantIds: Array.from(variantIds),
          };
        }),
        switchMap(({ colorIds, variantIds }) =>
          forkJoin({
            colors: forkJoin(
              colorIds.map((id) =>
                this.productService.getProductColor(id as number)
              )
            ),
            variants: forkJoin(
              variantIds.map((id) =>
                this.productService.getProductVariant(id as number)
              )
            ),
          })
        )
      )
      .subscribe(({ colors, variants }) => {
        // Process and assign fetched colors and variants to their respective products here
        this.productColors = colors;
        this.productVariants = variants;

        this.dataLoaded = true; // Indicate that data has finished loading
      });
  }

  hideBrandDropdown() {
    setTimeout(() => {
      this.showBrandDropdown = false;
    }, 200);
  }

  getVariants(productId: number) {
    return this.productVariants
      .filter((variant) => variant.productId === productId)
      .map((variant) => variant.variant);
  }

  getColors(productId: number) {
    return this.productColors
      .filter((color) => color.productId === productId)
      .map((color) => color.color.split(' ')[1]);
  }

  getProductPrice(productId: number) {
    const variantId = this.variantAndColor[productId][0];
    return this.productVariants.find((variant) => variant.id === variantId)
      ?.price;
  }

  getProductVariant(variantId: number) {
    return this.productService.getProductVariant(variantId);
  }

  getProductColor(colorId: number) {
    return this.productService.getProductColor(colorId);
  }

  getProductImage(productId: number) {
    const colorId = this.variantAndColor[productId][1];
    return this.productService.getProductImage(colorId);
  }

  selectProductVariant(productId: number, selectedVariant: string) {
    const variantId =
      this.productVariants
        .filter((variant) => variant.productId === productId)
        .find((variant) => variant.variant === selectedVariant)?.id ?? 0;
    this.variantAndColor[productId][0] = variantId;
  }

  selectProductColor(productId: number, selectedColor: string) {
    const variantId =
      this.productColors
        .filter((color) => color.productId === productId)
        .find((color) => color.color.includes(selectedColor))?.id ?? 0;
    this.variantAndColor[productId][1] = variantId;
  }

  isCurrentVariant(productId: number, variant: string) {
    const variantId = this.variantAndColor[productId][0];
    return (
      this.productVariants
        .filter((variant) => variant.productId === productId)
        .find((variant) => variant.id === variantId)?.variant === variant
    );
  }

  isCurrentColor(productId: number, color: string) {
    const colorId = this.variantAndColor[productId][1];
    return this.productColors
      .filter((color) => color.productId === productId)
      .find((color) => color.id === colorId)
      ?.color.includes(color);
  }

  addToCart(productId: number) {
    this.showAddedToCartToast = true;
    const newCartItem: CartItem = {
      item: productId,
      variant: this.productVariants.find(
        (variant) => variant.id === this.variantAndColor[productId][0]
      )?.variant as string,
      color: this.productColors.find(
        (color) => color.id === this.variantAndColor[productId][1]
      )?.color as string,
      quantity: 1,
      itemValue: this.getProductPrice(productId) ?? 0,
      checked: true,
    };
    this.cartService.addItemToCart(newCartItem);
    this.dismissAddedToCartToast();
  }

  buyNow(productId: number) {
    this.addToCart(productId);
    this.router.navigate(['/cart']);
  }

  getTotalPages() {
    return this.page?.totalPages ?? 0;
  }
  getPageNumbers() {
    return this.page
      ? Array.from({ length: this.page?.totalPages }, (_, i) => i)
      : [];
  }

  next() {
    if (this.currentPage + 1 <= this.getTotalPages()) {
      this.currentPage += 1;
      this.getPage(
        this.currentPage,
        this.pageSize,
        this.sortBy,
        this.sortOrder
      );
    }
    if (this.currentPage === this.endIndex) {
      this.endIndex = this.currentPage;
      this.startIndex;
    }
  }

  previous() {
    if (this.currentPage - 1 > this.getTotalPages()) {
      this.currentPage -= 1;
      this.startIndex -= 1;
      this.getPage(
        this.currentPage,
        this.pageSize,
        this.sortBy,
        this.sortOrder
      );
    }
  }

  jumpToPage(event: any) {
    const pageNumber = event.target.value;
    if (pageNumber) {
      this.getPage(pageNumber - 1, this.pageSize);
    }
  }

  getPageOfSize(event: any) {
    const size = event.target.dataset.value;
    if (size) {
      this.pageSize = size;
      this.getPage(0, size);
    }
  }

  sort(sortBy: string, sortOrder: 'asc' | 'desc') {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.getPage(this.currentPage, this.pageSize, sortBy, sortOrder);
  }

  filterByAvailability() {
    this.inStock = this.inStock ? false : true;
    console.log('filter by stock', this.inStock);
    this.getPage(this.currentPage, this.pageSize);
  }

  SelectAllBrands() {
    if (this.allBrandsSelected()) {
      this.selectedBrands = [];
    } else {
      this.selectedBrands = this.brands;
      this.getPage(this.currentPage, this.pageSize);
    }
  }
  allBrandsSelected(): boolean {
    return this.selectedBrands.length === this.brands.length;
  }

  brandSelected(brand: string): boolean {
    return this.selectedBrands.some((b) => b === brand);
  }

  selectBrand(brand: string) {
    const updateBrands = this.selectedBrands.includes(brand)
      ? this.selectedBrands.filter((b) => b !== brand)
      : [...this.selectedBrands, brand];
    this.selectedBrands = updateBrands;
    this.getPage(0, this.pageSize);
  }

  toggleBrandDropdown() {
    if (this.showBrandDropdown) {
      this.showBrandDropdown = false;
    } else {
      this.showBrandDropdown = true;
    }
  }

  toggleWishlistItem(productId: number) {
    const itemFound = this.wishlist.includes(this.getItem(productId));
    if (!itemFound) {
      this.addToWishlist(productId);
    } else {
      this.removeFromWishlist(productId);
    }
  }

  addToWishlist(productId: number) {
    this.wishlist = [...this.wishlist, this.getItem(productId)];
    this.appService.addToWishlist(this.getItem(productId));
    this.showSuccessToast = true;
    this.dismissSuccessToast();
  }

  removeFromWishlist(productId: number) {
    const update = this.wishlist.filter((i) => i !== this.getItem(productId));
    this.wishlist = update;
    this.appService.removeFromWishlist(this.getItem(productId));
    this.showFailureToast = true;
    this.dismissFailureToast();
  }

  checkLikedItem(productId: number) {
    return this.wishlist.includes(this.getItem(productId));
  }

  getItem(productId: number): string {
    return `${productId}-${this.variantAndColor[productId][1]}-${this.variantAndColor[productId][0]}`;
  }

  private getBrands(type: string) {
    if (type === 'all' || type === 'search') {
      this.productService.getAllBrands().subscribe((data) => {
        this.brands = data ?? [];
        this.selectedBrands = this.brands;
      });
    } else {
      this.productService.getBrands().subscribe((data) => {
        this.brands = data.get(type) ?? [];
        this.selectedBrands = this.brands;
      });
    }
  }
  dismissSuccessToast() {
    setTimeout(() => (this.showSuccessToast = false), 1000);
  }
  dismissFailureToast() {
    setTimeout(() => (this.showFailureToast = false), 1000);
  }

  dismissAddedToCartToast() {
    setTimeout(() => (this.showAddedToCartToast = false), 1000);
  }

  toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }
}

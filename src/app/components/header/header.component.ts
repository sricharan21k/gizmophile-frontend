import { CommonModule, Location } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { dropdownAnimationFade } from '../../animations/dropdown-animation';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Product } from '../../model/product/product';
import { ProductService } from '../../services/product.service';
import { SearchProduct } from '../../model/product/search-product';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [dropdownAnimationFade],
})
export class HeaderComponent {
  cartSize?: Observable<number>;

  searchString = '';
  products: Product[] = [];
  items: Product[] = [];
  newLaunches: SearchProduct[] = [];
  hideTopics: boolean = false;
  searchControl = new FormControl('');
  searchResults: SearchProduct[] = [];

  showSidebar: boolean = false;
  showSearchOverlay: boolean = false;
  showProfileDropdown: boolean = false;

  searchForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private router: Router,
    private location: Location,
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.cartSize = cartService.getUpdatedCart();
    this.searchForm = fb.group({
      searchControl: this.searchControl,
    });
  }

  // userAuthenticated: boolean = false;

  search() {
    console.log('search', this.searchForm.get('searchControl')?.value);
    this.router.navigate(['product-list', 'search'], {
      queryParams: { keyword: this.searchControl.value },
    });
    this.toggleSearchOverlay();
  }

  getData() {
    this.toggleSearchOverlay();
    // this.productService.getAllProducts().subscribe((data) => {
    //   console.log('data', data);
    //   // this.products = data;
    //   this.items = data;
    // });

    this.productService
      .getNewLaunches()
      .subscribe((data) => (this.newLaunches = data));
  }

  filter(event: any) {
    const value = event.target.value.toLowerCase();

    this.hideTopics = value ? true : false;

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.productService.searchProducts(query ?? ''))
      )
      .subscribe((results) => (this.searchResults = results));
  }

  getProductImage(colorId: number) {
    return this.productService.getProductImage(colorId);
  }

  hideDropdownOnLeave() {
    setTimeout(() => {
      this.showProfileDropdown = false;
    }, 200);
  }
  hideDropdown() {
    setTimeout(() => {
      this.showProfileDropdown = false;
    }, 300);
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar) {
      this.renderer.addClass(document.body, 'overflow-hidden');
    } else {
      this.renderer.removeClass(document.body, 'overflow-hidden');
    }
  }

  toggleSearchOverlay() {
    this.showSearchOverlay = !this.showSearchOverlay;
    if (this.showSearchOverlay) {
      this.renderer.addClass(document.body, 'overflow-hidden');
    } else {
      this.renderer.removeClass(document.body, 'overflow-hidden');
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
  }
}

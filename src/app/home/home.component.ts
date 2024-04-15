import { CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { routeAnimationSlideUp } from '../animations/route-animation';
import { RouterModule } from '@angular/router';
import { Product } from '../model/product/product';
import { AppService } from '../services/app.service';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [routeAnimationSlideUp],
})
export class HomeComponent {
  @HostBinding('@routeAnimationTrigger') routeAnimation = true;
  username: string = '';
  showDropdown: boolean = false;
  browsedItems: Product[] = [];

  slides: any[] = [
    'redmi_13_pro_plus_black.webp',
    'redmi_13_pro_plus_purple.webp',
    'redmi_13_pro_plus_white.webp',
  ]; // Your slide data goes here
  currentIndex: number = 0;
  interval: any;
  jumperButtonVisible: boolean = false;
  constructor(
    private appService: AppService,
    private userService: UserService,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.startSlideShow();
    this.username = this.userService.getUsername();
    const browsedList = this.appService.getBrowsedList();
    if (browsedList.length) {
      browsedList.forEach((i) => {
        this.productService.getProduct(+i).subscribe((p) => {
          this.browsedItems.push(p);
        });
      });
    }
    window.addEventListener('scroll', this.toggleJumperButtonVisibility);
  }
  startSlideShow() {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  getProductImage(product: Product) {
    const colorId = product.colors[0];
    return this.productService.getProductImage(colorId);
  }

  toggleJumperButtonVisibility = () => {
    const jumperButton = document.getElementById('jumperButton');
    if (window.scrollY > 100) {
      // Adjust the value as per your requirement
      this.jumperButtonVisible = true;
      jumperButton?.classList.remove('hidden');
    } else {
      this.jumperButtonVisible = false;
      jumperButton?.classList.add('hidden');
    }
  };

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

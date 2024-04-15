import { Component } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { AppService } from '../services/app.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  activeStep: number = 0;
  constructor(private appService: AppService, private router: Router) {
    this.subscribeToRouterEvents();
  }

  private subscribeToRouterEvents() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (url.includes('/cart/review')) {
          this.activeStep = 3;
        } else if (url.includes('/cart/checkout')) {
          this.activeStep = 2;
        } else if (url.includes('/cart')) {
          this.activeStep = 1;
        } else {
          // Default to the first step if the URL doesn't match any known step
          this.activeStep = 0;
        }
      }
    });
  }
}

import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [NgIf, RouterOutlet, HeaderComponent, FooterComponent],
  animations: [],
})
export class AppComponent {
  showHeaderAndFooter: boolean = true;
  constructor(router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showHeaderAndFooter = ![
          '/',
          '/login',
          '/register',
          '/recover',
        ].includes(event.url);
      }
    });
  }
}

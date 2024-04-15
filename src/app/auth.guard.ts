import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authenticated = inject(AuthService).isAuthenticated();
  console.log('isauth', true);
  const router = inject(Router);
  if (!authenticated) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

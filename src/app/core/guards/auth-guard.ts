import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state-service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);
  if (authStateService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

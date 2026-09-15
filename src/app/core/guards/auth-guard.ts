import { CanActivateFn } from '@angular/router';
import { AuthStateService } from '../auth/auth-state-service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authStateService: AuthStateService = inject(AuthStateService);
  const tokenFromLocalStorage = localStorage.getItem('token');

  if (tokenFromLocalStorage === null && !authStateService.isAuthenticated())
    return false;

  return true;
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SignalRService } from '../hub/signalR-service';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../auth/auth-state-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStateService = inject(AuthStateService);
  const signalRService = inject(SignalRService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const isAuthRequest =
    req.url.includes('/login') || req.url.includes('/register');

  const clonedRequest = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest) {
        handleLogout(authStateService, signalRService, router);
      }
      return throwError(() => error);
    }),
  );
};

const handleLogout = async (authStateService: AuthStateService, signalRService: SignalRService, router: Router) => {
  authStateService.resetAuthState();
  signalRService.startConnection();
  router.navigate(['/login']);
}

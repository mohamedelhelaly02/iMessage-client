import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ILoginData } from '../../models/login-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblemDetails } from '../../../../core/helpers/apiProblemDetails';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  serverError = signal<string>('');
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  loginForm = this.fb.group({
    email: [''],
    password: [''],
  });

  onSubmit(): void {
    const loginData = this.loginForm.getRawValue() as ILoginData;
    this.authService.login(loginData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (e: HttpErrorResponse) => {
          const problem = e.error as ApiProblemDetails;
          if (problem.status === 401 && problem.code === 'User.InvalidCredentials') {
            this.serverError.set(problem.detail ?? '');
          }

          setTimeout(() => {
            this.serverError.set('');
          }, 3000);

        }
      });
  }



}

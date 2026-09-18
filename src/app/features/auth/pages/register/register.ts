import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth/auth-service';
import { IRegisterData } from '../../models/register-data';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblemDetails } from '../../../../core/helpers/apiProblemDetails';
import { finalize } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {

  passwordMatchValidator() {
    return () => {
      const password = this.registerForm.get('password')?.value;
      const confirmPassword = this.registerForm.get('confirmPassword')?.value;

      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string> = signal('');

  private readonly authService = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyedRef = inject(DestroyRef);


  registerForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$')
    ]],
    confirmPassword: ['', [Validators.required]],
  }, {
    validators: [this.passwordMatchValidator]
  });

  onSubmit(): void {

    if (this.registerForm.invalid) {
      console.log("form invalid")
      console.log(this.registerForm.controls);
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const registerData = this.registerForm.getRawValue() as IRegisterData;

    this.authService.register(registerData)
      .pipe(
        takeUntilDestroyed(this.destroyedRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({

        next: response => {
          console.log('Registration successful:', response);
        },

        error: (httpError: HttpErrorResponse) => {
          console.error('Registration failed:', httpError);

          const problem = httpError.error as ApiProblemDetails;

          console.log(problem)


          if (problem?.code === 'User.RegisterationValidation') {
            for (const [fieldName, messages] of Object.entries(problem.errors ?? {})) {

              console.log('field:', fieldName);
              console.log('messages:', messages);

              if (fieldName.startsWith('password')) {

                const passwordControl =
                  this.registerForm.controls.password;

                passwordControl.setErrors({
                  ...passwordControl.errors,
                  server: messages
                });

                passwordControl.markAsTouched();

                continue;
              }

              if (fieldName === 'confirmPassword') {

                const confirmPasswordControl =
                  this.registerForm.controls.confirmPassword;

                confirmPasswordControl.setErrors({
                  ...confirmPasswordControl.errors,
                  server: messages
                });

                confirmPasswordControl.markAsTouched();
              }
            }
          }
          else if (problem.code === 'Validation.Failed') {

          }


        }

      });


  }

}

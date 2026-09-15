import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth/auth-service';
import { IRegisterData } from '../../models/register-data';
import { SignalRService } from '../../../../core/hub/signalR-service';

@Component({
  imports: [ReactiveFormsModule],
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
  private readonly signalRService = inject(SignalRService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyedRef = inject(DestroyRef);


  registerForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, {
    validators: [this.passwordMatchValidator]
  });

  onSubmit(): void {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const registerData = this.registerForm.getRawValue() as IRegisterData;

    this.authService.register(registerData)
      .pipe(tap(() => takeUntilDestroyed(this.destroyedRef)))
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.isLoading.set(false);

          this.signalRService.notifyCallerOnline();

        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.isLoading.set(false);
        },
      });


  }

}

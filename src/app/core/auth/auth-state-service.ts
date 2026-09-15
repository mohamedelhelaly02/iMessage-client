import { computed, Service, signal } from '@angular/core';

@Service()
export class AuthStateService {
    private readonly tokenSignal = signal<string | null>(localStorage.getItem('token'));

    readonly token = this.tokenSignal.asReadonly();

    readonly isAuthenticated = computed(() => !!this.tokenSignal());


    setToken(token: string | null): void {
        localStorage.setItem('token', token || '');
        this.tokenSignal.set(token);
    }

    clearToken(): void {
        localStorage.removeItem('token');
        this.tokenSignal.set(null);
    }

}

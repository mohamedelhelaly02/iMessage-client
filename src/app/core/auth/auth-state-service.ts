import { computed, Service, signal } from '@angular/core';
import { IUser } from '../../features/auth/models/user';

@Service()
export class AuthStateService {

    private readonly tokenSignal = signal<string | null>(localStorage.getItem('token'));
    private readonly userSignal = signal<IUser | null>(null);

    readonly token = this.tokenSignal.asReadonly();
    readonly currentUser = this.userSignal.asReadonly();

    readonly isAuthenticated = computed(() => !!this.tokenSignal());


    setToken(token: string | null): void {
        localStorage.setItem('token', token || '');
        this.tokenSignal.set(token);
    }

    setUser(user: IUser) {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSignal.set(user);
    }

    resetAuthState(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.tokenSignal.set(null);
        this.userSignal.set(null);
    }

}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ILoginData } from '../../features/auth/models/login-data';
import { IRegisterData } from '../../features/auth/models/register-data';
import { AuthResponse } from '../../features/auth/models/auth-response';
import { AuthStateService } from './auth-state-service';

@Service()
export class AuthService {
    private readonly BASE_URL: string = 'https://localhost:7116/api/auth';
    private readonly httpClient = inject(HttpClient);
    private readonly headers = new HttpHeaders()
        .set('Content-Type', 'application/json');

    private readonly router = inject(Router);

    private readonly authStateService = inject(AuthStateService);

    register(registerData: IRegisterData): Observable<AuthResponse> {
        return this.httpClient.post<AuthResponse>(`${this.BASE_URL}/register`, registerData, {
            headers: this.headers
        }).pipe(
            tap((response) => this.handleSuccessAuth(response))
        );
    }

    login(loginData: ILoginData): Observable<AuthResponse> {
        return this.httpClient.post<AuthResponse>(`${this.BASE_URL}/login`, loginData, {
            headers: this.headers
        }).pipe(
            tap((response) => this.handleSuccessAuth(response))
        );
    }

    private handleSuccessAuth(response: AuthResponse) {

        this.authStateService.setToken(response.token);

        this.authStateService.setUser(response.user);


        this.router.navigate(['/chat']);
    }
}


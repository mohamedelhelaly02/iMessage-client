import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '', loadComponent: () => import('./layouts/blank/blank').then(x => x.Blank),
        children: [
            { path: '', redirectTo: 'chat', pathMatch: 'full' },
            { path: 'chat', canActivate: [authGuard], loadComponent: () => import('./features/conversation/pages/chat/chat').then(x => x.Chat), title: 'Chat' },
        ]
    },
    {
        path: '', loadComponent: () => import('./layouts/auth/auth').then(a => a.Auth),
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'register', loadComponent: () => import('./features/auth/pages/register/register').then(a => a.Register), title: 'Register' },
            { path: 'login', loadComponent: () => import('./features/auth/pages/login/login').then(a => a.Login), title: 'Login' },
        ]
    },
    { path: '**', loadComponent: () => import('./shared/components/not-found/not-found').then(x => x.NotFound), title: '404 - Not Found' }
];

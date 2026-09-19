import { Component } from '@angular/core';
import { AuthNavbar } from './components/auth-navbar/auth-navbar';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';

@Component({
  imports: [AuthNavbar, RouterOutlet, LanguageSwitcher],
  selector: 'app-auth',
  styleUrl: './auth.css',
  templateUrl: './auth.html',
})
export class Auth {}

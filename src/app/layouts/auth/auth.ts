import { Component } from '@angular/core';
import { AuthNavbar } from './components/auth-navbar/auth-navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [AuthNavbar, RouterOutlet],
  selector: 'app-auth',
  styleUrl: './auth.css',
  templateUrl: './auth.html',
})
export class Auth {}

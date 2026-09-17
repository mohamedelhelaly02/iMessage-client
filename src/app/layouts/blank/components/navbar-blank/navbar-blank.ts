import { Component, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-navbar-blank',
  styleUrl: './navbar-blank.css',
  templateUrl: './navbar-blank.html',
})
export class NavbarBlank {
  logoutEvent = output<void>();

  logout() {
    this.logoutEvent.emit();
  }
}

import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-sidebar-header',
  styleUrl: './sidebar-header.css',
  templateUrl: './sidebar-header.html',
})
export class SidebarHeader { }

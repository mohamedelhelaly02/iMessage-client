import { Component } from '@angular/core';
import { SidebarHeader } from './sidebar-header/sidebar-header';
import { SearchBar } from './search-bar/search-bar';
import { ChatList } from './chat-list/chat-list';

@Component({
  imports: [SidebarHeader, SearchBar, ChatList],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar { }

import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-messages',
  styleUrl: './messages.css',
  templateUrl: './messages.html',
})
export class Messages {
  isOtherUserTyping = input.required<boolean>();
}

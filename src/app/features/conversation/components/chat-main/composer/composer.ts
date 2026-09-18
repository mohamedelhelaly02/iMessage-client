import { Component, output, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-composer',
  styleUrl: './composer.css',
  templateUrl: './composer.html',
})
export class Composer {
  message = signal<string>('');
  onTyping = output<void>();
  onMessageSend = output<string>();


  onMessageInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    this.message.set(input.value);

    this.onTyping.emit();

  }
  sendMessage() {
    const message = this.message().trim();
    if (!message)
      return;

    this.onMessageSend.emit(message);

  }

}

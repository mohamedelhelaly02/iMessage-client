import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-no-selected-chat',
  styleUrl: './no-selected-chat.css',
  templateUrl: './no-selected-chat.html',
})
export class NoSelectedChat { }

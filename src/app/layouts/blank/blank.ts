import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from '../../shared/components/toast/toast';
@Component({
  imports: [RouterOutlet, Toast],
  selector: 'app-blank',
  styleUrl: './blank.css',
  templateUrl: './blank.html',
})
export class Blank {

}
import { Component } from '@angular/core';
import { IOption } from 'src/app/models/option';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  enterpriseData: IOption[] = [];
  
  onValueSelected(option: IOption): void {
    console.log(option.value);
  }
}

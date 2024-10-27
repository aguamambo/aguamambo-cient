import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {
  @Input() label: string = '';
  @Input() value: number | string = 0;
  @Input() subtext: string = '';
  @Input() icon: string = '';
}

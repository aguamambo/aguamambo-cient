import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css'
})
export class SkeletonComponent {
  @Input() lines = 1;
  @Input() lineHeight = '1rem';
  @Input() lineWidth = '100%';
  @Input() circle = false;
  @Input() circleSize = '2rem';
}

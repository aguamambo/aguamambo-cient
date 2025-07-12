import { Component } from '@angular/core';

@Component({
  selector: 'app-alert-description',
  templateUrl: './alert-description.component.html',
  styleUrl: './alert-description.component.css'
})
export class AlertDescriptionComponent {
  getAlertDescriptionClasses(): string {
    return 'text-sm [&_p]:leading-relaxed';
  }
}
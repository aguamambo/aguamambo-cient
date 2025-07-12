import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @Input() disabled: boolean = false;
  @Output() clickEvent = new EventEmitter<Event>();

  getButtonClasses(): string {
    let classes = 'w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    switch (this.variant) {
      case 'default':
        classes += ' bg-blue-800 text-primary-foreground hover:bg-primary';
        break;
      case 'destructive':
        classes += ' bg-destructive text-destructive-foreground hover:bg-destructive/90';
        break;
      case 'outline':
        classes += ' border border-input bg-background hover:bg-accent hover:text-accent-foreground';
        break;
      case 'secondary':
        classes += ' bg-secondary text-secondary-foreground hover:bg-secondary/80';
        break;
      case 'ghost':
        classes += ' hover:bg-accent hover:text-accent-foreground';
        break;
      case 'link':
        classes += ' text-primary underline-offset-4 hover:underline';
        break;
    }

    // Apply size specific classes
    switch (this.size) {
      case 'default':
        classes += ' h-10 px-4 py-2';
        break;
      case 'sm':
        classes += ' h-9 rounded-md px-3';
        break;
      case 'lg':
        classes += ' h-11 rounded-md px-8';
        break;
      case 'icon':
        classes += ' h-10 w-10';
        break;
    }

    return classes;
  }

  onClick(event: Event): void {
    this.clickEvent.emit(event);
  }
}

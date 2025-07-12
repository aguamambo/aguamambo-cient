import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-ui',
  templateUrl: './card-ui.component.html',
  styleUrl: './card-ui.component.css'
})
export class CardUiComponent {
@Input() title: string | null = null;
  @Input() description: string | null = null;
  @Input() footer: string | null = null;
 @Input() className: string = '';  
  /**
   * Returns the Tailwind CSS classes for the main card container.
   * Uses colors defined in tailwind.config.js for background, text, border, and shadow.
   */
 getCardClasses(): string {
    // Added 'max-w-md w-full' to the card itself for consistent sizing
   return `rounded-lg border bg-card text-card-foreground shadow-2xl  ${this.className}`;
  }

  /**
   * Returns the Tailwind CSS classes for the card header.
   * Applies padding and font styling.
   */
  getCardHeaderClasses(): string {
    return 'flex flex-col space-y-1.5 p-6';
  }

  /**
   * Returns the Tailwind CSS classes for the card title.
   * Applies font weight and size.
   */
  getCardTitleClasses(): string {
    return 'text-2xl font-semibold leading-none tracking-tight text-gray-700 text-center'; // Added text-center
  }

  /**
   * Returns the Tailwind CSS classes for the card description.
   * Applies text size and muted foreground color.
   */
  getCardDescriptionClasses(): string {
    return 'text-sm text-muted-foreground text-center'; // Added text-center
  }

  /**
   * Returns the Tailwind CSS classes for the card content area.
   * Applies padding.
   */
  getCardContentClasses(): string {
    return 'p-6 pt-0';
  }

  /**
   * Returns the Tailwind CSS classes for the card footer.
   * Applies padding and flex properties.
   */
  getCardFooterClasses(): string {
    return 'flex items-center p-6 pt-0';
  }
}
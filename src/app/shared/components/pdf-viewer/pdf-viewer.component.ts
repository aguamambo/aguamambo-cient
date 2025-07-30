import { Component, Input, EventEmitter, Output } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent {
  @Input() isOpen = false;
  @Input() pdfUrl: SafeResourceUrl | null = null
  @Input() dialogMessage: string = 'Carregando PDF...';
  @Input() title: string = 'Docuemnto';

  @Output() closed = new EventEmitter<void>();

  closeDialog() {
    this.closed.emit();
  }

}
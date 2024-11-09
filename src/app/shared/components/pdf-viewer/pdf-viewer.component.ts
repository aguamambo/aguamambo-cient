// pdf-viewer.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core'; 
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  @Input() readingId: string = '';  
  pdfUrl: string | null = null;  

  constructor(private pdfService: PdfService) {}

  ngOnInit(): void {
    if (this.readingId) {
      this.loadPdf();
    }
  }

  loadPdf(): void { 
    this.pdfService.getPdfFile(`/invoice/waterBill/${this.readingId}`).subscribe({
      next: (pdfBlob) => {
        this.pdfUrl = URL.createObjectURL(pdfBlob);  
      },
      error: (err) => {
        console.error('Erro ao carregar PDF:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl); 
    }
  }
}
import { Component } from '@angular/core';
import { UploadFileService } from 'src/app/services/upload-file.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.css'
})
export class UploadFileComponent {
  selectedFile: File | null = null;
  isDragging = false;
  uploadProgress = 0;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onUpload(): void {
    if (this.selectedFile) {
      // Simulação de upload (substitua com sua lógica de upload)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        this.uploadProgress = progress;
        if (progress >= 100) {
          clearInterval(interval);
          console.log('Upload concluído!');
          this.uploadProgress = 0;
        }
      }, 500);
      console.log('Enviando arquivo:', this.selectedFile);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }
}
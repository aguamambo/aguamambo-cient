import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { IAppState, uploadFile } from 'src/app/store';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.css'
})
export class UploadFileComponent {
  selectedFile: File | null = null;
  isDragging = false;
  uploadProgress = 0; 
 
constructor(private _store: Store<IAppState>) {
  
}
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file; 
  }
}

onUpload(): void {
  if (this.selectedFile) {
    this._store.dispatch(uploadFile({ file: this.selectedFile }));
    this.simulateProgress();
  }
}

private simulateProgress(): void {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    this.uploadProgress = progress;
    if (progress >= 100) {
      clearInterval(interval); 
      this.uploadProgress = 0;
    }
  }, 500);

  
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
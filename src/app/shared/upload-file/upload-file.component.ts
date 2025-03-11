import { Component, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DialogService } from 'src/app/services/dialog.service';
import { FileHandlerService } from 'src/app/services/file-handler.service';
import { IAppState, uploadFile } from 'src/app/store';
import { selectUploadedReadingFile } from 'src/app/store/selectors/reading.selectors';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.css'
})
export class UploadFileComponent {
  selectedFile: File | null = null;
  isDragging = false;
  uploadProgress = 0; 

  @Input() selectedMonth!: string;
  @Input() selectedYear!: string;
 
constructor(private _store: Store<IAppState>,private _dialogService: DialogService) {
  
}
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file; 
  }
}

onUpload(): void {
  if (this.selectedFile) {
    this._dialogService.open({
      title: 'Processando',
      message: 'Aguarde um instante enquanto carrega o ficheiro da leituras.',
      type: 'loading',
      isProcessing: true,
    });

    const payload = {
      readingMonth: +this.selectedMonth,
      readingYear: +this.selectedYear,
      file: this.selectedFile
    } 
    
    this._store.dispatch(uploadFile({ payload: payload }));
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

  this._store.pipe(select(selectUploadedReadingFile)).subscribe((uploaded) => {
    if (uploaded) {
      this._dialogService.open({
        title: 'Sucesso',
        message: 'Ficheiro de Leituras submetido com sucesso!',
        type: 'success'
      });
      this.selectedFile = null
    } else {
      this._dialogService.open({
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao submeter o ficheiro de leituras. Por favor contacte a equipa tecnica para o suporte.',
        type: 'error',
        showConfirmButton: false, 
        cancelText: 'Cancelar',
      });
    }
  })
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
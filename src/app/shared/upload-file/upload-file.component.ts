import { Component, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription, take } from 'rxjs';
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
  private uploadSubscription: Subscription | null = null;  

  @Input() selectedMonth!: string;
  @Input() selectedYear!: string;

  constructor(private _store: Store<IAppState>, private _dialogService: DialogService) { }

  /**
   * Handles file selection from the input element.
   * @param event The Event object from the file input.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  /**
   * Handles the drag over event, preventing default behavior to allow dropping.
   * @param event The DragEvent object.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  /**
   * Handles the drag leave event, resetting the dragging state.
   * @param event The DragEvent object.
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault(); // Prevent default to avoid issues with drop
    this.isDragging = false;
  }

  /**
   * Handles the drop event, processing the dropped file.
   * @param event The DragEvent object.
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  /**
   * Processes the selected file, updating the component state.
   * @param file The selected File object.
   */
  handleFile(file: File): void {
    this.selectedFile = file;
    this.uploadProgress = 0; // Reset progress on new file selection
    // Ensure the file input is cleared if a new file is dragged/selected
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Removes the currently selected file and resets the UI.
   */
  removeFile(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the file input element value
    }
    this.uploadProgress = 0; // Reset progress
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe(); // Unsubscribe if an upload was in progress
      this.uploadSubscription = null;
    }
    this._dialogService.open({
      title: 'Removido',
      message: 'Ficheiro removido.',
      type: 'success',
      showConfirmButton: true, // Typically, success messages have a confirm button
      confirmText: 'Ok'
    });
  }

  /**
   * Initiates the file upload process.
   */
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
      };

      this._store.dispatch(uploadFile({ payload: payload }));
      this.simulateProgress();

      // Subscribe to the selector to handle upload success/error messages
      // Use take(1) to automatically unsubscribe after the first emission
      if (this.uploadSubscription) {
        this.uploadSubscription.unsubscribe(); // Ensure previous subscription is cleared
      }
      this.uploadSubscription = this._store.pipe(select(selectUploadedReadingFile), take(1)).subscribe((uploaded) => {
        if (uploaded) {
          this._dialogService.open({
            title: 'Sucesso',
            message: 'Ficheiro de Leituras submetido com sucesso!',
            type: 'success',
            showConfirmButton: true, // Show confirm button for success
            confirmText: 'Ok'
          });
          this.selectedFile = null; // Clear selected file after successful upload
          this.uploadProgress = 0; // Reset progress
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = ''; // Clear the file input element value
          }
        } else {
          this._dialogService.open({
            title: 'Erro',
            message: 'Ocorreu um erro inesperado ao submeter o ficheiro de leituras. Por favor contacte a equipa tecnica para o suporte.',
            type: 'error',
            showConfirmButton: false, // Error messages might not need a confirm button
            cancelText: 'Fechar', // Changed cancelText to Fechar for error
          });
        }
      });
    } else {
      this._dialogService.open({
        title: 'Aviso',
        message: 'Nenhum ficheiro selecionado para submeter.',
        type: 'error', // Using error type for warning as per previous pattern
        showConfirmButton: true,
        confirmText: 'Ok'
      });
    }
  }

  /**
   * Simulates the progress bar filling up.
   */
  private simulateProgress(): void {
    this.uploadProgress = 0; // Ensure it starts from 0
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploadProgress = 100; // Cap at 100%
        // The actual clearing of selectedFile and resetting progress
        // will happen in the subscription callback for selectUploadedReadingFile
        // to ensure it only happens after the backend response.
      }
    }, 500);
  }
}
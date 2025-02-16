import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  isDialogVisible = false;
  isLoading = false;
  isDetailsVisible = false; 
  exceptionMessage = "";
  
  config: {
    type?: 'loading' | 'success' | 'error' | 'info';
    message?: string;
    showConfirmButton?: boolean;
    confirmText?: string;
    cancelText?: string;
    errorDetails?: string | Record<string, string>;
  } = {};

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.dialogService.isDialogVisible().subscribe((visible) => {
      if (visible) {
        this.showDialogWithDelay();
      } else {
        this.isDialogVisible = false;
      }
    });

    this.dialogService.getDialogConfig().subscribe((config) => {
      if (config) {
        this.config = config;
        if (config.errorDetails) {
          this.setErrorMessage(config.errorDetails);
        }
      }
    });
  }
  
  setErrorMessage(error: string | Record<string, string>): void {
    if (typeof error === 'string') {
      this.exceptionMessage = error;
    } else if (typeof error === 'object' && error !== null) {
      this.exceptionMessage = Object.values(error).join(', ');
    } else {
      this.exceptionMessage = 'Ocorreu um erro inesperado.';
    }
  }

  showDialogWithDelay(): void {
    this.isLoading = true;
    this.isDialogVisible = true;

    setTimeout(() => {
      this.isLoading = false;
    }, 5000); 
  }

  toggleErrorDetails(): void {
    this.isDetailsVisible = !this.isDetailsVisible;
  }

  onClose(): void {
    this.resetDialog();
    this.dialogService.close(true);
  }
  
  onCancel(): void {
    this.resetDialog();
    this.dialogService.close(false);
  }
  
  private resetDialog(): void {
    this.isDialogVisible = false;
    this.isLoading = false;
    this.isDetailsVisible = false;
    this.exceptionMessage = '';
    this.config = {
      type: undefined,
      message: '',
      showConfirmButton: false,
      confirmText: '',
      cancelText: '',
      errorDetails: ''
    };
  }
}

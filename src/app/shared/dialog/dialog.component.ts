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
  config: {
    type?: 'loading' | 'success' | 'error' | 'info';
    message?: string;
    showConfirmButton?: boolean;
    confirmText?: string;
    cancelText?: string;
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
      }
    });
  }

  showDialogWithDelay(): void {
    this.isLoading = true; // Show loading spinner
    this.isDialogVisible = true;

    setTimeout(() => {
      this.isLoading = false; // Hide loading spinner
    }, 5000); // Delay for 5 seconds
  }

  onClose(): void {
    this.dialogService.close(true);
  }

  onCancel(): void {
    this.dialogService.close(false);
  }
}

import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  isDialogVisible = false;
  config: {
    type?: 'loading' | 'success' | 'error';
    message?: string;
    showConfirmButton?: boolean;
    confirmText?: string;
    cancelText?: string;
  } = {};

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    // Subscribe to the visibility and config observables
    this.dialogService.isDialogVisible().subscribe((visible) => {
      this.isDialogVisible = visible;
    });

    this.dialogService.getDialogConfig().subscribe((config) => {
      if (config) {
        this.config = config;
      }
    });
  }

  onConfirm(): void {
    this.dialogService.close(true); // Close the dialog with a positive result
  }

  onCancel(): void {
    this.dialogService.close(false); // Close the dialog with a negative result
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean; 
  showConfirmButton?: boolean;
  type?: 'loading' | 'success' | 'error' | 'info';  
  icon?: string;
  errorDetails?:  string | Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogVisibility$ = new BehaviorSubject<boolean>(false);
  private dialogConfig$ = new BehaviorSubject<DialogConfig | null>(null);
  private dialogResult$ = new Subject<boolean>();

  toggleDialog(): void {
    const currentState = this.dialogVisibility$.getValue();
    this.dialogVisibility$.next(!currentState);
  }

  isDialogVisible(): Observable<boolean> {
    return this.dialogVisibility$.asObservable();
  }

  open(config: DialogConfig): Observable<boolean> {
    this.dialogVisibility$.next(true);
    this.dialogConfig$.next(config);
    return this.dialogResult$.asObservable();
  }

  close(result: boolean = false): void {
    this.dialogVisibility$.next(false);
    this.dialogConfig$.next(null);
    this.dialogResult$.next(result);
  }

  getDialogConfig(): Observable<DialogConfig | null> {
    return this.dialogConfig$.asObservable();
  }
}

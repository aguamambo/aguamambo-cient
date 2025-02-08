import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  error?: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  icon: string
}


@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  
  errorIcon = 'm396-355.39 84-84 84 84 42.15-42.15-84-84 84-84L564-607.69l-84 84-84-84-42.15 42.15 84 84-84 84L396-355.39Zm84 254.62q-129.77-35.39-214.88-152.77Q180-370.92 180-516v-230.15l300-112.31 300 112.31V-516q0 145.08-85.12 262.46Q609.77-136.16 480-100.77Zm0-63.23q104-33 172-132t68-220v-189l-240-89.62L240-705v189q0 121 68 220t172 132Zm0-315.62Z'
  successIcon = 'm423.23-309.85 268.92-268.92L650-620.92 423.23-394.15l-114-114L267.08-466l156.15 156.15ZM480.07-100q-78.84 0-148.21-29.92t-120.68-81.21q-51.31-51.29-81.25-120.63Q100-401.1 100-479.93q0-78.84 29.92-148.21t81.21-120.68q51.29-51.31 120.63-81.25Q401.1-860 479.93-860q78.84 0 148.21 29.92t120.68 81.21q51.31 51.29 81.25 120.63Q860-558.9 860-480.07q0 78.84-29.92 148.21t-81.21 120.68q-51.29 51.31-120.63 81.25Q558.9-100 480.07-100Zm-.07-60q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z'
  infoIcon = 'M480-122.31q-24.08 0-42.58-12.69-18.5-12.7-25.88-33.31H400q-24.54 0-42.27-17.73Q340-203.77 340-228.31v-131.23q-60.54-36.69-95.27-98.38Q210-519.62 210-590q0-112.92 78.54-191.46T480-860q112.92 0 191.46 78.54T750-590q0 71.61-34.73 132.69T620-359.54v131.23q0 24.54-17.73 42.27-17.73 17.73-42.27 17.73h-11.54q-7.38 20.61-25.88 33.31-18.5 12.69-42.58 12.69Zm-80-106h160v-37.54H400v37.54Zm0-72.92h160V-340H400v38.77ZM392-400h64.15v-116.46l-85.69-85.69L404-635.69l76 76 76-76 33.54 33.54-85.69 85.69V-400H568q54-26 88-76.5T690-590q0-88-61-149t-149-61q-88 0-149 61t-61 149q0 63 34 113.5t88 76.5Zm88-159.69Zm0-40.31Z'
  warningIcon = 'M74.62-140 480-840l405.38 700H74.62ZM178-200h604L480-720 178-200Zm302-47.69q13.73 0 23.02-9.29t9.29-23.02q0-13.73-9.29-23.02T480-312.31q-13.73 0-23.02 9.29T447.69-280q0 13.73 9.29 23.02t23.02 9.29Zm-30-104.62h60v-200h-60v200ZM480-460Z'
  
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null)

  showError(message: string, error?: string) {
    this.showToast({ message, error, type: 'error', icon: this.errorIcon });
  }

  showSuccess(message: string, error?: string ) {
    this.showToast({ message, error, type: 'success', icon: this.successIcon });
  }

  showInfo(message: string, error?: string) {
    this.showToast({ message, error, type: 'info', icon: this.infoIcon });
  }

  showWarning(message: string, error?: string) {
    this.showToast({ message, error, type: 'warning', icon: this.warningIcon });
  }

  private showToast(toastMessage: ToastMessage) {
    this.toastSubject.next(toastMessage);
    setTimeout(() => this.toastSubject.next(null), 5000);
  }

  getToastMessage() {
    return this.toastSubject.asObservable();
  }
}

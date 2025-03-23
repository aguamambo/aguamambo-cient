import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor() {}

  base64ToBlob(base64: string, fileType: string): Blob {
    const byteCharacters = atob(base64); 
    const byteNumbers = new Array(byteCharacters.length);
  
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
  
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: fileType });
  }
  
 
}

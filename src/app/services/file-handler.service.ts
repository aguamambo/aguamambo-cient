import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {
  private apiUrl = 'YOUR_API_ENDPOINT';

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  exportFile(fileType: 'pdf' | 'excel', fileName: string): void {
    this.http.get(`${this.apiUrl}/export/${fileType}`, { responseType: 'blob' }).subscribe(blob => {
      const fileExtension = fileType === 'pdf' ? 'pdf' : 'xlsx';
      saveAs(blob, `${fileName}.${fileExtension}`);
    });
  }

  downloadFile(fileId: string, fileType: 'pdf' | 'excel'): void {
    this.http.get(`${this.apiUrl}/download/${fileId}`, { responseType: 'blob' }).subscribe(blob => {
      const fileExtension = fileType === 'pdf' ? 'pdf' : 'xlsx';
      saveAs(blob, `downloaded-file.${fileExtension}`);
    });
  }
}

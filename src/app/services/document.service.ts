// src/app/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environment/environment';
import { 
  Document, 
  UploadResponse, 
  DocumentListResponse, 
  UpdateDocumentRequest, 
  UpdateDocumentResponse 
} from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = `${environment.apiUrl}/api/v2/UploadFile`;

  constructor(private http: HttpClient) {}

  // Upload file
  uploadFile(file: File): Observable<UploadResponse> {
    console.log('🔄 Uploading file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(this.baseUrl, formData, {
      headers: this.getAuthHeaders(false) // Không set Content-Type cho FormData
    }).pipe(
      tap(response => {
        console.log('✅ File uploaded successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error uploading file:', error);
        return throwError(() => error);
      })
    );
  }

  // Lấy danh sách tất cả file
  getAllDocuments(): Observable<DocumentListResponse> {
    console.log('🔄 Fetching all documents...');
    
    return this.http.get<DocumentListResponse>(this.baseUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('✅ Documents loaded:', response);
      }),
      catchError(error => {
        console.error('❌ Error loading documents:', error);
        return throwError(() => error);
      })
    );
  }

  // Lấy file theo ID
  getDocumentById(id: number): Observable<UpdateDocumentResponse> {
    console.log('🔄 Fetching document by ID:', id);
    
    return this.http.get<UpdateDocumentResponse>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('✅ Document loaded by ID:', response);
      }),
      catchError(error => {
        console.error('❌ Error loading document by ID:', error);
        return throwError(() => error);
      })
    );
  }

  // Cập nhật file (rename)
  updateDocument(id: number, request: UpdateDocumentRequest): Observable<UpdateDocumentResponse> {
    console.log('🔄 Updating document:', id, request);
    
    return this.http.put<UpdateDocumentResponse>(`${this.baseUrl}/${id}`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('✅ Document updated successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error updating document:', error);
        return throwError(() => error);
      })
    );
  }

  // Xóa file
  deleteDocument(id: number): Observable<any> {
    console.log('🔄 Deleting document:', id);
    
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('✅ Document deleted successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error deleting document:', error);
        return throwError(() => error);
      })
    );
  }

  // Helper method để tạo auth headers
  private getAuthHeaders(includeContentType: boolean = true): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    const headers: { [header: string]: string } = {
      'Authorization': `Bearer ${token}`
    };
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Helper method để lấy file extension và type
  getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'PDF Document';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'xls':
      case 'xlsx': return 'Excel Spreadsheet';
      case 'ppt':
      case 'pptx': return 'PowerPoint Presentation';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Image';
      case 'txt': return 'Text File';
      case 'zip':
      case 'rar': return 'Archive';
      default: return 'Unknown';
    }
  }

  // Helper method để format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper method để mở file trong tab mới
  openFileInNewTab(viewUrl: string): void {
    window.open(viewUrl, '_blank');
  }

  // Helper method để download file
  downloadFile(viewUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = viewUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
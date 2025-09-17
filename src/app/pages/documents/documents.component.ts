// src/app/pages/documents/documents.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { DocumentService } from '../../services/document.service';
import { Document, UpdateDocumentRequest } from '../../models/document.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    NzModalModule,
    NzTableModule,
    NzInputModule,
    NzSpinModule,
    NzEmptyModule,
    NzTagModule,
    NzPopconfirmModule,
    NzFormModule,
    NzCardModule
  ],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  documents: Document[] = [];
  loading = false;
  uploading = false;
  searchText = '';
  filteredDocuments: Document[] = [];
  
  // Modal properties
  isEditModalVisible = false;
  editingDocument: Document | null = null;
  editForm!: FormGroup;

  constructor(
    private documentService: DocumentService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder
  ) {
    this.initEditForm();
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  initEditForm(): void {
    this.editForm = this.fb.group({
      fileName: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  loadDocuments(): void {
    this.loading = true;
    console.log('🔄 Loading documents...');

    this.documentService.getAllDocuments().subscribe({
      next: (response) => {
        if (response.success) {
          this.documents = response.data.map(doc => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
            fileType: this.documentService.getFileType(doc.fileName)
          }));
          this.filteredDocuments = [...this.documents];
          console.log('✅ Documents loaded:', this.documents);
        } else {
          this.message.error(response.message || 'Không thể tải danh sách tài liệu');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading documents:', error);
        this.message.error('Không thể tải danh sách tài liệu');
        this.loading = false;
      }
    });
  }

  // Custom upload function
  customUploadRequest = (item: any): any => {
    const file = item.file as File;
    console.log('🔄 Starting upload for file:', file.name);

    this.uploading = true;
    
    this.documentService.uploadFile(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.message.success(`Tải lên "${file.name}" thành công!`);
          item.onSuccess(response, item.file);
          // Reload documents list
          this.loadDocuments();
        } else {
          this.message.error(response.message || 'Tải lên thất bại');
          item.onError(response.message, item.file);
        }
        this.uploading = false;
      },
      error: (error) => {
        console.error('❌ Upload error:', error);
        this.message.error('Tải lên thất bại');
        item.onError(error, item.file);
        this.uploading = false;
      }
    });
  };

  // Handle upload change
  handleUploadChange(info: NzUploadChangeParam): void {
    const fileList = [...info.fileList];
    console.log('📁 Upload change:', info.type, fileList);
  }

  // Search functionality
  onSearch(): void {
    if (!this.searchText.trim()) {
      this.filteredDocuments = [...this.documents];
    } else {
      this.filteredDocuments = this.documents.filter(doc =>
        doc.fileName.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  // View file
  viewDocument(document: Document): void {
    console.log('👁️ Opening document:', document.fileName);
    this.documentService.openFileInNewTab(document.viewUrl);
  }

  // Download file
  downloadDocument(document: Document): void {
    console.log('⬇️ Downloading document:', document.fileName);
    this.documentService.downloadFile(document.viewUrl, document.fileName);
    this.message.success(`Đang tải xuống "${document.fileName}"`);
  }

  // Edit document name
  editDocument(document: Document): void {
    this.editingDocument = document;
    this.editForm.patchValue({
      fileName: document.fileName
    });
    this.isEditModalVisible = true;
  }

  // Save edited document
  saveEdit(): void {
    if (this.editForm.valid && this.editingDocument) {
      const request: UpdateDocumentRequest = {
        fileName: this.editForm.value.fileName.trim()
      };

      console.log('💾 Saving document edit:', request);

      this.documentService.updateDocument(this.editingDocument.fileId, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.message.success('Cập nhật tên file thành công!');
            this.isEditModalVisible = false;
            this.editingDocument = null;
            this.loadDocuments(); // Reload list
          } else {
            this.message.error(response.message || 'Cập nhật thất bại');
          }
        },
        error: (error) => {
          console.error('❌ Error updating document:', error);
          this.message.error('Cập nhật thất bại');
        }
      });
    }
  }

  // Cancel edit
  cancelEdit(): void {
    this.isEditModalVisible = false;
    this.editingDocument = null;
    this.editForm.reset();
  }

  // Delete document
  deleteDocument(document: Document): void {
    console.log('🗑️ Deleting document:', document.fileName);

    this.documentService.deleteDocument(document.fileId).subscribe({
      next: (response) => {
        this.message.success(`Đã xóa "${document.fileName}" thành công!`);
        this.loadDocuments(); // Reload list
      },
      error: (error) => {
        console.error('❌ Error deleting document:', error);
        this.message.error('Xóa file thất bại');
      }
    });
  }

  // Get file icon based on type
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'file-pdf';
      case 'doc':
      case 'docx': return 'file-word';
      case 'xls':
      case 'xlsx': return 'file-excel';
      case 'ppt':
      case 'pptx': return 'file-ppt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'file-image';
      case 'txt': return 'file-text';
      case 'zip':
      case 'rar': return 'file-zip';
      default: return 'file';
    }
  }

  // Get file type color
  getFileTypeColor(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'red';
      case 'doc':
      case 'docx': return 'blue';
      case 'xls':
      case 'xlsx': return 'green';
      case 'ppt':
      case 'pptx': return 'orange';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'purple';
      case 'txt': return 'default';
      case 'zip':
      case 'rar': return 'gold';
      default: return 'default';
    }
  }

  // Format date
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('vi-VN');
  }
}
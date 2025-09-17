// src/app/models/document.model.ts
export interface Document {
  fileId: number;
  fileName: string;
  filePath: string;
  viewUrl: string;
  uploadedAt: string | Date;
  uploadedBy: number;
  fileSize?: number;
  fileType?: string;
}

export interface UploadResponse {
  success: boolean;
  data: Document;
  message: string;
  error: string | null;
}

export interface DocumentListResponse {
  success: boolean;
  data: Document[];
  message: string;
  error: string | null;
}

export interface UpdateDocumentRequest {
  fileName: string;
}

export interface UpdateDocumentResponse {
  success: boolean;
  data: Document;
  message: string;
  error: string | null;
}
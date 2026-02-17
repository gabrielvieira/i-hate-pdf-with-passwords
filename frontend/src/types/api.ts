export type PDFStatus = 'pending' | 'cracked' | 'failed';

export interface UploadResponse {
  filename: string;
  status: PDFStatus;
}

export interface StatusResponse {
  status: PDFStatus;
}

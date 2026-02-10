import type { UploadResponse, StatusResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/pdf';

export class APIError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new APIError(error.error || 'Upload failed', response.status);
  }

  return response.json();
};

export const getStatus = async (filename: string): Promise<StatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/status/${filename}`);

  if (!response.ok) {
    throw new APIError('Failed to get status', response.status);
  }

  return response.json();
};

export const downloadPDF = async (filename: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/results/${filename}`);

  if (!response.ok) {
    throw new APIError('Failed to download PDF', response.status);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

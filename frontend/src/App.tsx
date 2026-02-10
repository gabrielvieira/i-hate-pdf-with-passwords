import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { StatusCard } from './components/StatusCard';
import { DownloadButton } from './components/DownloadButton';
import { uploadPDF } from './services/api';
import type { PDFStatus } from './types/api';

type AppState =
  | { stage: 'upload' }
  | { stage: 'processing'; filename: string; status: PDFStatus }
  | { stage: 'complete'; filename: string };

function App() {
  const [state, setState] = useState<AppState>({ stage: 'upload' });
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadPDF(file);
      setState({
        stage: 'processing',
        filename: response.filename,
        status: response.status,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusUpdate = (status: PDFStatus) => {
    if (state.stage === 'processing') {
      if (status === 'cracked') {
        setState({
          stage: 'complete',
          filename: state.filename,
        });
      } else {
        setState({
          ...state,
          status,
        });
      }
    }
  };

  const handleReset = () => {
    setState({ stage: 'upload' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PDF Password Cracker
          </h1>
          <p className="text-gray-600">
            Remove passwords from your PDF files securely
          </p>
        </div>

        {state.stage === 'upload' && (
          <FileUpload onUpload={handleUpload} isUploading={isUploading} />
        )}

        {state.stage === 'processing' && (
          <div className="space-y-6">
            <StatusCard
              filename={state.filename}
              status={state.status}
              onStatusUpdate={handleStatusUpdate}
            />
            {state.status === 'failed' && (
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Try another file
                </button>
              </div>
            )}
          </div>
        )}

        {state.stage === 'complete' && (
          <div className="space-y-6">
            <StatusCard
              filename={state.filename}
              status="cracked"
              onStatusUpdate={handleStatusUpdate}
            />
            <DownloadButton filename={state.filename} onReset={handleReset} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

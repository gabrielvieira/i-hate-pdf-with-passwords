import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { downloadPDF } from '../services/api';

interface DownloadButtonProps {
  filename: string;
  onReset: () => void;
}

export function DownloadButton({ filename, onReset }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      await downloadPDF(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="lg"
          className="gap-2"
        >
          <Download className="w-5 h-5" />
          {isDownloading ? 'Downloading...' : 'Download Unlocked PDF'}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
        >
          Upload Another
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

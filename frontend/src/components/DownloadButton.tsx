import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, RotateCcw, AlertTriangle } from 'lucide-react';
import { downloadPDF } from '../services/api';

interface DownloadButtonProps {
  filename: string;
  onReset: () => void;
}

export function DownloadButton({ filename, onReset }: DownloadButtonProps) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      await downloadPDF(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('download.failed'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Primary action row */}
      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="btn-red"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '13px 20px',
            fontSize: '14px',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}
          aria-label={isDownloading ? t('download.downloading') : t('download.downloadButton')}
        >
          {isDownloading ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'spin-slow 1s linear infinite' }}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <Download size={16} aria-hidden="true" />
          )}
          {isDownloading ? t('download.downloading') : t('download.downloadButton')}
        </button>

        {/* Secondary — upload another */}
        <button
          onClick={onReset}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            padding: '13px 18px',
            fontSize: '13px',
            fontFamily: 'monospace',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
          aria-label={t('download.uploadAnother')}
        >
          <RotateCcw size={13} aria-hidden="true" />
          {t('download.uploadAnother')}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 45, 85, 0.07)',
            border: '1px solid rgba(255, 45, 85, 0.22)',
            width: '100%',
          }}
        >
          <AlertTriangle
            size={14}
            color="var(--color-red)"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: 'var(--color-red)',
            }}
          >
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

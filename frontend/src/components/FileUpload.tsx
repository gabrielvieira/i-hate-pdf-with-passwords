import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, FileWarning } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') return t('upload.onlyPdf');
    if (file.size > 10 * 1024 * 1024) return t('upload.tooLarge');
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      try {
        await onUpload(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('upload.failed'));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onUpload, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="panel upload-panel-padding">
      {/* Hidden file input */}
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        accept=".pdf,application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        disabled={isUploading}
        aria-label="Upload PDF file"
      />

      {/* Drop zone */}
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`drop-zone drop-zone-label${isDragging ? ' dragging' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.55 : 1,
          pointerEvents: isUploading ? 'none' : 'auto',
          userSelect: 'none',
          gap: '22px',
          transition: 'opacity 0.2s ease',
        }}
        aria-disabled={isUploading}
      >
        {/* Lock icon container */}
        <div
          className="drop-zone-icon"
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(255, 45, 85, 0.08)',
            border: '1px solid rgba(255, 45, 85, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease',
            ...(isDragging
              ? {
                  boxShadow: '0 0 32px rgba(255, 45, 85, 0.4)',
                  borderColor: 'rgba(255, 45, 85, 0.7)',
                  background: 'rgba(255, 45, 85, 0.12)',
                }
              : {}),
          }}
        >
          {isUploading ? (
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-red)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'spin-slow 1s linear infinite' }}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <Lock size={34} color="var(--color-red)" aria-hidden="true" />
          )}
        </div>

        {/* Copy */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: '0 0 6px 0',
              letterSpacing: '0.01em',
            }}
          >
            {isUploading
              ? t('upload.uploading')
              : isDragging
                ? t('upload.dropIt')
                : t('upload.dropHere')}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-muted)',
              margin: '0 0 20px 0',
              fontFamily: 'monospace',
            }}
          >
            {t('upload.orBrowse')}
          </p>

          {!isUploading && (
            <span
              className="btn-red"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '9px 24px',
                fontSize: '13px',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              {t('upload.selectFile')}
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: '11px',
            color: 'var(--color-muted)',
            fontFamily: 'monospace',
            margin: 0,
            opacity: 0.5,
          }}
        >
          {t('upload.hint')}
        </p>
      </label>

      {/* Validation / upload error */}
      {error && (
        <div
          role="alert"
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(255, 45, 85, 0.07)',
            border: '1px solid rgba(255, 45, 85, 0.22)',
          }}
        >
          <FileWarning
            size={15}
            color="var(--color-red)"
            style={{ flexShrink: 0, marginTop: '1px' }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
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

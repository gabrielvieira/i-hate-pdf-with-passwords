import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUpload } from './components/FileUpload';
import { StatusCard } from './components/StatusCard';
import { DownloadButton } from './components/DownloadButton';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ContactButton } from './components/ContactModal';
import { ManifestoButton } from './components/ManifestoModal';
import { HowItWorksButton } from './components/HowItWorksModal';
import { Github } from 'lucide-react';
import { uploadPDF } from './services/api';
import type { PDFStatus } from './types/api';

type AppState =
  | { stage: 'upload' }
  | { stage: 'processing'; filename: string; status: PDFStatus }
  | { stage: 'complete'; filename: string };

function App() {
  const { t } = useTranslation();
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
        setState({ stage: 'complete', filename: state.filename });
      } else {
        setState({ ...state, status });
      }
    }
  };

  const handleReset = () => setState({ stage: 'upload' });

  return (
    <>
      {/* Animated mesh / grid background */}
      <div className="bg-mesh" aria-hidden="true" />

      <LanguageSwitcher />

      {/* Fixed bottom bar: Contact + Manifesto */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '8px',
        }}
      >
        <ContactButton />
        <ManifestoButton />
        <HowItWorksButton />
        <a
          href="https://github.com/gabrielvieira/i-hate-pdf-with-passwords"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 14px',
            fontSize: '12px',
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
            textDecoration: 'none',
          }}
        >
          <Github size={14} aria-hidden="true" />
          github
        </a>
      </div>

      <div
        style={{ position: 'relative', zIndex: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <header className="text-center animate-fade-up" style={{ marginBottom: '48px' }}>
          {/* Status indicator badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--color-red)',
                boxShadow: '0 0 8px var(--color-red)',
              }}
              className="animate-pulse-glow"
              aria-hidden="true"
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                letterSpacing: '0.16em',
                color: 'var(--color-red)',
                textTransform: 'uppercase',
              }}
            >
              {t('statusBadge')}
            </span>
          </div>

          <h1
            className="animate-flicker"
            style={{
              fontFamily: 'monospace',
              fontSize: 'clamp(1.75rem, 5vw, 2.6rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            {t('title')}{' '}
            <span style={{ color: 'var(--color-red)' }}>{t('titleAccent')}</span>
          </h1>

          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: 'var(--color-muted)',
              margin: 0,
              letterSpacing: '0.08em',
            }}
          >
          </p>
        </header>

        {/* ── Main content ────────────────────────────────────── */}
        <main style={{ width: '100%', maxWidth: '520px' }}>
          {state.stage === 'upload' && (
            <div className="animate-fade-up">
              <FileUpload onUpload={handleUpload} isUploading={isUploading} />
            </div>
          )}

          {state.stage === 'processing' && (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StatusCard
                filename={state.filename}
                status={state.status}
                onStatusUpdate={handleStatusUpdate}
              />
              {state.status === 'failed' && (
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleReset}
                    className="btn-ghost"
                    style={{ padding: '8px 24px', fontSize: '13px', fontFamily: 'monospace' }}
                  >
                    {t('tryAnother')}
                  </button>
                </div>
              )}
            </div>
          )}

          {state.stage === 'complete' && (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StatusCard
                filename={state.filename}
                status="cracked"
                onStatusUpdate={handleStatusUpdate}
              />
              <DownloadButton filename={state.filename} onReset={handleReset} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;

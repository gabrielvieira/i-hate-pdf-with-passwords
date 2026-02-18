import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ScrollText, X } from 'lucide-react';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ManifestoModalProps {
  onClose: () => void;
}

function ManifestoModal({ onClose }: ManifestoModalProps) {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleKeyDown]);

  const paragraphs = t('manifesto.paragraphs', { returnObjects: true }) as string[];

  return createPortal(
    <div
      onClick={onClose}
      aria-hidden="false"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'backdrop-fade-in 0.2s ease both',
      }}
    >
      <div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manifesto-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '32px',
          position: 'relative',
          animation: 'modal-scale-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label={t('manifesto.close')}
          className="btn-ghost"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px', paddingRight: '32px' }}>
          <h2
            id="manifesto-modal-title"
            style={{
              fontFamily: 'monospace',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.01em',
            }}
          >
            {t('manifesto.title')}
          </h2>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--color-red)',
              margin: 0,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {t('manifesto.subtitle')}
          </p>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: 'var(--color-muted)',
                margin: 0,
                lineHeight: 1.75,
                letterSpacing: '0.02em',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Signature */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--color-red)',
            margin: '28px 0 0 0',
            letterSpacing: '0.04em',
          }}
        >
          {t('manifesto.signature')}
        </p>
      </div>
    </div>,
    document.body,
  );
}

// ─── Public export: self-contained trigger + modal ────────────────────────────

export function ManifestoButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label={t('manifesto.openLabel')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="btn-ghost"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 14px',
          fontSize: '12px',
          fontFamily: 'monospace',
          letterSpacing: '0.06em',
        }}
      >
        <ScrollText size={14} aria-hidden="true" />
        {t('manifesto.buttonLabel')}
      </button>

      {isOpen && <ManifestoModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

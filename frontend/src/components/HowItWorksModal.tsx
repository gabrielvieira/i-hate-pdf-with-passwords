import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Cpu, X } from 'lucide-react';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface HowItWorksModalProps {
  onClose: () => void;
}

function HowItWorksModal({ onClose }: HowItWorksModalProps) {
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

  const steps = t('howItWorks.process.steps', { returnObjects: true }) as string[];
  const limits = t('howItWorks.limitations.items', { returnObjects: true }) as string[];

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
        aria-labelledby="how-it-works-modal-title"
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
          aria-label={t('howItWorks.close')}
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
        <div style={{ marginBottom: '28px', paddingRight: '32px' }}>
          <h2
            id="how-it-works-modal-title"
            style={{
              fontFamily: 'monospace',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.01em',
            }}
          >
            {t('howItWorks.title')}
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
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Process section */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 12px 0',
          }}
        >
          {t('howItWorks.process.heading')}
        </p>
        <ol style={{ margin: '0 0 28px 0', padding: '0 0 0 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {steps.map((step, i) => (
            <li
              key={i}
              style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-red)',
                  background: 'rgba(255, 45, 85, 0.1)',
                  border: '1px solid rgba(255, 45, 85, 0.2)',
                  borderRadius: '4px',
                  padding: '1px 7px',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: 'var(--color-muted)',
                  lineHeight: 1.7,
                }}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>

        {/* Limitations section */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 12px 0',
          }}
        >
          {t('howItWorks.limitations.heading')}
        </p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {limits.map((item, i) => (
            <li
              key={i}
              style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
            >
              <span
                style={{
                  color: 'var(--color-red)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
                aria-hidden="true"
              >
                —
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: 'var(--color-muted)',
                  lineHeight: 1.7,
                }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

// ─── Public export: self-contained trigger + modal ────────────────────────────

export function HowItWorksButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label={t('howItWorks.openLabel')}
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
        <Cpu size={14} aria-hidden="true" />
        {t('howItWorks.buttonLabel')}
      </button>

      {isOpen && <HowItWorksModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

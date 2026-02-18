import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import type { PDFStatus } from '../types/api';

interface StatusCardProps {
  filename: string;
  status: PDFStatus;
  onStatusUpdate: (status: PDFStatus) => void;
}

/** Animated dots that cycle 1→2→3 in JS so the base word can be translated */
function CrackingText() {
  const { t } = useTranslation();
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d >= 3 ? 1 : d + 1)), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {t('status.cracking')}
      {'.'.repeat(dots)}
    </>
  );
}

export function StatusCard({ filename, status, onStatusUpdate }: StatusCardProps) {
  const { t } = useTranslation();

  // Poll API for status changes
  useEffect(() => {
    if (status === 'pending') {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/pdf/status/${filename}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status !== status) {
              onStatusUpdate(data.status);
            }
          }
        } catch (error) {
          console.error('Failed to fetch status:', error);
        }
      }, 2000);
      return () => clearInterval(pollInterval);
    }
  }, [filename, status, onStatusUpdate]);

  if (status === 'pending') {
    return (
      <div className="panel" style={{ padding: '32px' }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          {/* Animated radar-style icon */}
          <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid var(--color-red)',
                opacity: 0.3,
                animation: 'pulse-glow 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                borderRadius: '50%',
                background: 'rgba(255, 45, 85, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-red)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'spin-slow 1.2s linear infinite' }}
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          </div>

          <div>
            <h2
              style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 3px 0',
                letterSpacing: '0.02em',
              }}
            >
              <CrackingText />
            </h2>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--color-muted)',
                margin: 0,
              }}
            >
            </p>
          </div>
        </div>

        {/* Filename */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--color-border)',
            marginBottom: '16px',
          }}
        >
          <FileText size={14} color="var(--color-muted)" aria-hidden="true" />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: 'var(--color-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {filename}
          </span>
        </div>

        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'var(--color-muted)',
            margin: 0,
            opacity: 0.55,
          }}
        >
          {t('status.complexityHint')}
        </p>
      </div>
    );
  }

  if (status === 'cracked') {
    return (
      <div
        className="panel animate-pulse-green-glow"
        style={{
          padding: '32px',
          borderColor: 'rgba(0, 230, 118, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '20px',
          }}
        >
          <div className="animate-success-pop">
            <CheckCircle2
              size={40}
              color="var(--color-green)"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--color-green)',
                margin: '0 0 4px 0',
                letterSpacing: '0.02em',
              }}
            >
              {t('status.crackedTitle')}
            </h2>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--color-muted)',
                margin: 0,
              }}
            >
              {t('status.crackedDescription')}
            </p>
          </div>
        </div>

        {/* Filename */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={13} color="var(--color-muted)" aria-hidden="true" />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: 'var(--color-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {filename}
          </span>
        </div>
      </div>
    );
  }

  // status === 'failed'
  return (
    <div
      className="panel animate-pulse-glow"
      style={{
        padding: '32px',
        borderColor: 'rgba(255, 45, 85, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <XCircle
          size={36}
          color="var(--color-red)"
          strokeWidth={1.75}
          style={{ flexShrink: 0, marginTop: '2px' }}
          aria-hidden="true"
        />
        <div>
          <h2
            style={{
              fontFamily: 'monospace',
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--color-red)',
              margin: '0 0 6px 0',
              letterSpacing: '0.02em',
            }}
          >
            {t('status.failedTitle')}
          </h2>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: 'var(--color-muted)',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {t('status.failedDescription')}
            <br />
            {t('status.failedHint')}
          </p>
        </div>
      </div>

      {/* Filename */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(255, 45, 85, 0.04)',
          border: '1px solid rgba(255, 45, 85, 0.15)',
        }}
      >
        <FileText size={13} color="var(--color-muted)" aria-hidden="true" />
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--color-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {filename}
        </span>
      </div>
    </div>
  );
}

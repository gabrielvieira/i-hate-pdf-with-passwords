import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Mail, X, CheckCircle2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormFields {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validate(fields: FormFields, t: (key: string) => string): FormErrors {
  const errors: FormErrors = {};
  if (!fields.name.trim()) errors.name = t('contact.errors.nameRequired');
  if (!fields.email.trim()) {
    errors.email = t('contact.errors.emailRequired');
  } else if (!validateEmail(fields.email)) {
    errors.email = t('contact.errors.emailInvalid');
  }
  if (!fields.message.trim()) errors.message = t('contact.errors.messageRequired');
  return errors;
}

// ─── Input component ──────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: error ? 'var(--color-red)' : 'var(--color-muted)',
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span
          role="alert"
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: 'var(--color-red)',
            letterSpacing: '0.04em',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

// Shared input style object — reused for both <input> and <textarea>
const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  fontFamily: 'monospace',
  fontSize: '13px',
  padding: '10px 14px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s ease',
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'var(--color-red)',
};

// ─── Modal inner content ──────────────────────────────────────────────────────

interface ModalContentProps {
  onClose: () => void;
}

function ModalContent({ onClose }: ModalContentProps) {
  const { t } = useTranslation();
  const [fields, setFields] = useState<FormFields>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Focus the first field when the modal opens
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field as soon as the user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(fields, t);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setFields({ name: '', email: '', message: '' });
    setErrors({});
    setSubmitted(false);
    firstFieldRef.current?.focus();
  };

  return (
    /* Modal panel */
    <div
      className="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      style={{
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        position: 'relative',
        animation: 'modal-scale-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}
      onClick={e => e.stopPropagation()} // prevent backdrop click from closing via bubbling
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label={t('contact.close')}
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
          id="contact-modal-title"
          style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
          }}
        >
          {t('contact.title')}
        </h2>
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--color-muted)',
            margin: 0,
            letterSpacing: '0.04em',
          }}
        >
          {t('contact.subtitle')}
        </p>
      </div>

      {/* Success state */}
      {submitted ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '24px 0',
            textAlign: 'center',
          }}
        >
          <CheckCircle2
            size={52}
            color="var(--color-green)"
            strokeWidth={1.5}
            className="animate-success-pop"
            aria-hidden="true"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              {t('contact.success.title')}
            </p>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--color-muted)',
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              {t('contact.success.description')}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="btn-ghost"
            style={{
              marginTop: '8px',
              padding: '8px 20px',
              fontSize: '12px',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
            }}
          >
            {t('contact.success.sendAnother')}
          </button>
        </div>
      ) : (
        /* Contact form */
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Field id="contact-name" label={t('contact.fields.name')} error={errors.name}>
            <input
              ref={firstFieldRef}
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={fields.name}
              onChange={handleChange}
              placeholder={t('contact.placeholders.name')}
              style={errors.name ? inputErrorStyle : inputStyle}
              onFocus={e => {
                e.currentTarget.style.borderColor = errors.name ? 'var(--color-red)' : 'var(--color-red)';
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-red-glow)`;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.name ? 'var(--color-red)' : 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Field>

          <Field id="contact-email" label={t('contact.fields.email')} error={errors.email}>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              placeholder={t('contact.placeholders.email')}
              style={errors.email ? inputErrorStyle : inputStyle}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-red)';
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-red-glow)`;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.email ? 'var(--color-red)' : 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Field>

          <Field id="contact-message" label={t('contact.fields.message')} error={errors.message}>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              value={fields.message}
              onChange={handleChange}
              placeholder={t('contact.placeholders.message')}
              style={{
                ...(errors.message ? inputErrorStyle : inputStyle),
                resize: 'vertical',
                minHeight: '100px',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-red)';
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-red-glow)`;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.message ? 'var(--color-red)' : 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Field>

          <button
            type="submit"
            className="btn-red"
            style={{
              padding: '11px 20px',
              fontSize: '13px',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              marginTop: '4px',
            }}
          >
            {t('contact.submit')}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Modal portal with backdrop ───────────────────────────────────────────────

interface ContactModalProps {
  onClose: () => void;
}

function ContactModal({ onClose }: ContactModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleKeyDown]);

  return createPortal(
    /* Backdrop — clicking it closes the modal */
    <div
      className="contact-backdrop"
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
      <ModalContent onClose={onClose} />
    </div>,
    document.body,
  );
}

// ─── Public export: self-contained trigger + modal ────────────────────────────

export function ContactButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      {/* Fixed trigger button — bottom-center */}
      <button
        onClick={open}
        aria-label={t('contact.openLabel')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="btn-ghost"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 14px',
          fontSize: '12px',
          fontFamily: 'monospace',
          letterSpacing: '0.06em',
        }}
      >
        <Mail size={14} aria-hidden="true" />
        {t('contact.buttonLabel')}
      </button>

      {/* Modal — only mounted when open */}
      {isOpen && <ContactModal onClose={close} />}
    </>
  );
}

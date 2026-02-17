import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt-BR', label: 'PT' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        display: 'flex',
        gap: '6px',
        zIndex: 10,
      }}
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={i18n.language === code ? 'btn-red' : 'btn-ghost'}
          style={{
            padding: '5px 12px',
            fontSize: '11px',
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
          aria-current={i18n.language === code ? true : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

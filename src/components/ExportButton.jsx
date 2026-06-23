import { useState } from 'react';

export default function ExportButton({ onClick, label = 'Exportar Excel' }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className={`btn-export ${loading ? 'loading' : ''}`} onClick={handle} disabled={loading}>
      {loading ? (
        <span className="import-spinner" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )}
      {loading ? 'Generando...' : label}
    </button>
  );
}

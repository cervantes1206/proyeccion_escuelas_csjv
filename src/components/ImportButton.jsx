import { useRef, useState } from 'react';
import { parseExcelFile, validateExcelStructure } from '../utils/importExcel';

export default function ImportButton({ onImport }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateExcelStructure(file);
    if (validationError) {
      setStatus('error');
      setMessage(validationError);
      return;
    }

    setStatus('loading');
    setMessage('Leyendo archivo...');

    try {
      const sedes = await parseExcelFile(file);
      const totalStudents = sedes.reduce((sum, sede) =>
        sum + sede.schools.reduce((s2, school) =>
          s2 + school.grades.reduce((s3, g) =>
            s3 + g.groups.reduce((s4, gr) => s4 + gr.students, 0), 0), 0), 0);

      onImport(sedes);
      setStatus('success');
      setMessage(`${sedes.length} sedes · ${totalStudents.toLocaleString()} estudiantes importados`);
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }

    // Reset input so the same file can be re-imported
    e.target.value = '';
  }

  return (
    <div className="import-wrap">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
        style={{ display: 'none' }}
        id="excel-import-input"
      />
      <button
        className={`btn-import ${status === 'loading' ? 'loading' : ''}`}
        onClick={() => inputRef.current?.click()}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <span className="import-spinner" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        )}
        Importar Excel
      </button>

      {status === 'success' && (
        <span className="import-msg success">✓ {message}</span>
      )}
      {status === 'error' && (
        <span className="import-msg error">✕ {message}</span>
      )}
    </div>
  );
}

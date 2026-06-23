import { useState, useMemo } from 'react';
import { createDefaultSede, MAX_GROUP_SIZE } from './data/initialData';
import { SEDES_2026 } from './data/sedes2026';
import { projectSede, grandTotal } from './utils/projection';
import SedePanel from './components/SedePanel';
import SedeReport from './components/SedeReport';
import GeneralReport from './components/GeneralReport';
import SchoolReport from './components/SchoolReport';
import ImportButton from './components/ImportButton';
import './styles/app.css';

const CURRENT_YEAR = new Date().getFullYear();
const PROJECTED_YEAR = CURRENT_YEAR + 1;

export default function App() {
  const [sedes, setSedes] = useState(SEDES_2026);
  const [newK4BySede, setNewK4BySede] = useState({});
  const [activeTab, setActiveTab] = useState('entrada');
  const [activeSedeIdx, setActiveSedeIdx] = useState(0);
  const [reportSedeIdx, setReportSedeIdx] = useState(0);

  const projectedSedes = useMemo(
    () => sedes.map((sede) => projectSede(sede, newK4BySede[sede.id] || 0)),
    [sedes, newK4BySede]
  );

  function setNewK4ForSede(sedeId, value) {
    setNewK4BySede((prev) => ({ ...prev, [sedeId]: Number(value) || 0 }));
  }

  function addSede() {
    const newSede = createDefaultSede('Sede ' + (sedes.length + 1));
    setSedes([...sedes, newSede]);
    setActiveSedeIdx(sedes.length);
  }

  function removeSede(idx) {
    if (sedes.length <= 1) return;
    const next = sedes.filter((_, i) => i !== idx);
    setSedes(next);
    setActiveSedeIdx(Math.min(activeSedeIdx, next.length - 1));
  }

  function updateSede(idx, updated) {
    setSedes(sedes.map((s, i) => (i === idx ? updated : s)));
  }

  const totalCurrentStudents = grandTotal(sedes);
  const totalProjectedStudents = grandTotal(projectedSedes);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Proyeccion Escolar CSJV</h1>
            <span className="header-years">{CURRENT_YEAR} → {PROJECTED_YEAR}</span>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="stat-label">Matricula {CURRENT_YEAR}</span>
              <span className="stat-value">{totalCurrentStudents}</span>
            </div>
            <div className="header-stat accent">
              <span className="stat-label">Proyeccion {PROJECTED_YEAR}</span>
              <span className="stat-value">{totalProjectedStudents}</span>
            </div>
            <div className="header-stat">
              <span className="stat-label">Sedes</span>
              <span className="stat-value">{sedes.length}</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        {[
          { id: 'entrada', label: 'Ingreso de Datos' },
          { id: 'reporte-sede', label: 'Informe por Sede' },
          { id: 'reporte-escuela', label: 'Informe por Escuela' },
          { id: 'reporte-general', label: 'Informe General' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={'nav-btn' + (activeTab === tab.id ? ' active' : '')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'entrada' && (
          <div className="entrada-section">
            <div className="entrada-controls">
              <ImportButton onImport={(newSedes) => { setSedes(newSedes); setActiveSedeIdx(0); }} />
              <button className="btn-add-sede" onClick={addSede}>+ Agregar Sede</button>
            </div>

            <div className="sedes-tabs">
              {sedes.map((sede, idx) => (
                <div key={sede.id} className={'sede-tab-wrap' + (activeSedeIdx === idx ? ' active' : '')}>
                  <button className="sede-tab-btn" onClick={() => setActiveSedeIdx(idx)}>
                    {sede.name}
                  </button>
                  {sedes.length > 1 && (
                    <button className="sede-remove-btn" onClick={() => removeSede(idx)}>x</button>
                  )}
                </div>
              ))}
            </div>

            {sedes[activeSedeIdx] && (
              <>
                <div className="k4-control">
                  <label htmlFor="k4-input">
                    Nuevos estudiantes K4 para {PROJECTED_YEAR} — {sedes[activeSedeIdx].name}
                    <span className="k4-hint">Max. {MAX_GROUP_SIZE} por grupo</span>
                  </label>
                  <input
                    id="k4-input"
                    type="number"
                    min="0"
                    value={newK4BySede[sedes[activeSedeIdx].id] || 0}
                    onChange={(e) => setNewK4ForSede(sedes[activeSedeIdx].id, e.target.value)}
                    className="k4-input"
                  />
                </div>
                <SedePanel
                  sede={sedes[activeSedeIdx]}
                  onChange={(updated) => updateSede(activeSedeIdx, updated)}
                  readOnly={false}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'reporte-sede' && (
          <div className="report-section">
            <div className="report-sede-selector">
              <label>Seleccionar sede:</label>
              <div className="sedes-tabs">
                {sedes.map((sede, idx) => (
                  <button
                    key={sede.id}
                    className={'sede-tab-btn' + (reportSedeIdx === idx ? ' active' : '')}
                    onClick={() => setReportSedeIdx(idx)}
                  >
                    {sede.name}
                  </button>
                ))}
              </div>
            </div>
            {sedes[reportSedeIdx] && projectedSedes[reportSedeIdx] && (
              <>
                <div className="k4-control k4-control-report">
                  <label htmlFor={`k4-report-${reportSedeIdx}`}>
                    Nuevos K4 en {PROJECTED_YEAR} — {sedes[reportSedeIdx].name}
                    <span className="k4-hint">Max. {MAX_GROUP_SIZE} por grupo</span>
                  </label>
                  <input
                    id={`k4-report-${reportSedeIdx}`}
                    type="number"
                    min="0"
                    value={newK4BySede[sedes[reportSedeIdx].id] || 0}
                    onChange={(e) => setNewK4ForSede(sedes[reportSedeIdx].id, e.target.value)}
                    className="k4-input"
                  />
                </div>
                <div className="report-two-col">
                  <div className="report-col">
                    <h3 className="col-title">Matricula Actual ({CURRENT_YEAR})</h3>
                    <SedePanel sede={sedes[reportSedeIdx]} onChange={() => {}} readOnly={true} />
                  </div>
                  <div className="report-col">
                    <h3 className="col-title">Proyeccion ({PROJECTED_YEAR})</h3>
                    <SedePanel sede={projectedSedes[reportSedeIdx]} onChange={() => {}} readOnly={true} />
                  </div>
                </div>
                <SedeReport
                  currentSede={sedes[reportSedeIdx]}
                  projectedSede={projectedSedes[reportSedeIdx]}
                  currentYear={CURRENT_YEAR}
                  projectedYear={PROJECTED_YEAR}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'reporte-escuela' && (
          <SchoolReport
            currentSedes={sedes}
            projectedSedes={projectedSedes}
            currentYear={CURRENT_YEAR}
            projectedYear={PROJECTED_YEAR}
          />
        )}

        {activeTab === 'reporte-general' && (
          <GeneralReport
            currentSedes={sedes}
            projectedSedes={projectedSedes}
            currentYear={CURRENT_YEAR}
            projectedYear={PROJECTED_YEAR}
          />
        )}
      </main>
    </div>
  );
}

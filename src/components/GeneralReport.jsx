import { aggregateBySchool, grandTotal } from '../utils/projection';
import { GRADES_BY_SCHOOL, GRADE_LABELS } from '../data/initialData';
import { exportGeneralReport } from '../utils/exportExcel';
import ExportButton from './ExportButton';

const SCHOOL_COLORS = {
  Preschool: '#7c3aed',
  Elementary: '#2563eb',
  Middle: '#059669',
  'Upper Middle': '#d97706',
  High: '#dc2626',
};

export default function GeneralReport({ currentSedes, projectedSedes, currentYear, projectedYear }) {
  const current = aggregateBySchool(currentSedes);
  const projected = aggregateBySchool(projectedSedes);
  const currentGrand = grandTotal(currentSedes);
  const projectedGrand = grandTotal(projectedSedes);
  const diff = projectedGrand - currentGrand;

  return (
    <div className="general-report">
      <div className="report-header">
        <div className="report-header-row">
          <div>
            <h2>Informe General Consolidado</h2>
            <p className="report-subtitle">Comparativo {currentYear} &rarr; {projectedYear}</p>
          </div>
          <ExportButton
            label="Exportar Excel"
            onClick={() => exportGeneralReport(currentSedes, projectedSedes, currentYear, projectedYear)}
          />
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="card-label">Total {currentYear}</span>
          <span className="card-value">{currentGrand}</span>
        </div>
        <div className="summary-card accent">
          <span className="card-label">Total {projectedYear}</span>
          <span className="card-value">{projectedGrand}</span>
        </div>
        <div className={`summary-card ${diff >= 0 ? 'positive' : 'negative'}`}>
          <span className="card-label">Variación</span>
          <span className="card-value">{diff >= 0 ? '+' : ''}{diff}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Sedes</span>
          <span className="card-value">{currentSedes.length}</span>
        </div>
      </div>

      {Object.entries(GRADES_BY_SCHOOL).map(([schoolType, grades]) => {
        const color = SCHOOL_COLORS[schoolType];
        const curTotal = current[schoolType]?._total || 0;
        const projTotal = projected[schoolType]?._total || 0;
        const schoolDiff = projTotal - curTotal;

        return (
          <div key={schoolType} className="report-school-section">
            <div className="report-school-header" style={{ borderLeftColor: color }}>
              <span className="report-school-name" style={{ color }}>{schoolType}</span>
              <span className="report-school-totals">
                {curTotal} → <strong>{projTotal}</strong>
                <span className={schoolDiff >= 0 ? 'diff-pos' : 'diff-neg'}>
                  {schoolDiff >= 0 ? ' +' : ' '}{schoolDiff}
                </span>
              </span>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Grado</th>
                  <th>{currentYear} - Estudiantes</th>
                  <th>{currentYear} - Grupos</th>
                  <th>{projectedYear} - Estudiantes</th>
                  <th>{projectedYear} - Grupos</th>
                  <th>Variación</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => {
                  const cur = current[schoolType]?.[grade] || { total: 0, groups: 0 };
                  const proj = projected[schoolType]?.[grade] || { total: 0, groups: 0 };
                  const d = proj.total - cur.total;
                  return (
                    <tr key={grade}>
                      <td className="grade-label">{GRADE_LABELS[grade]}</td>
                      <td>{cur.total}</td>
                      <td>{cur.groups}</td>
                      <td><strong>{proj.total}</strong></td>
                      <td>{proj.groups}</td>
                      <td className={d >= 0 ? 'diff-pos' : 'diff-neg'}>{d >= 0 ? '+' : ''}{d}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{curTotal}</strong></td>
                  <td><strong>{current[schoolType] ? Object.values(current[schoolType]).filter(v => v?.groups).reduce((s, v) => s + v.groups, 0) : 0}</strong></td>
                  <td><strong>{projTotal}</strong></td>
                  <td><strong>{projected[schoolType] ? Object.values(projected[schoolType]).filter(v => v?.groups).reduce((s, v) => s + v.groups, 0) : 0}</strong></td>
                  <td className={schoolDiff >= 0 ? 'diff-pos' : 'diff-neg'}><strong>{schoolDiff >= 0 ? '+' : ''}{schoolDiff}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}

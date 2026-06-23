import { sedeStats, gradeTotal } from '../utils/projection';
import { GRADES_BY_SCHOOL, GRADE_LABELS } from '../data/initialData';

const SCHOOL_COLORS = {
  Preschool: '#7c3aed',
  Elementary: '#2563eb',
  Middle: '#059669',
  'Upper Middle': '#d97706',
  High: '#dc2626',
};

export default function SedeReport({ currentSede, projectedSede, currentYear, projectedYear }) {
  const current = sedeStats(currentSede);
  const projected = sedeStats(projectedSede);

  const curGrand = Object.values(current).reduce((s, school) => s + (school._total || 0), 0);
  const projGrand = Object.values(projected).reduce((s, school) => s + (school._total || 0), 0);
  const diff = projGrand - curGrand;

  return (
    <div className="sede-report">
      <div className="report-header">
        <h3>Informe por Sede: <span className="sede-highlight">{currentSede.name}</span></h3>
        <p className="report-subtitle">Comparativo {currentYear} → {projectedYear}</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="card-label">Total {currentYear}</span>
          <span className="card-value">{curGrand}</span>
        </div>
        <div className="summary-card accent">
          <span className="card-label">Total {projectedYear}</span>
          <span className="card-value">{projGrand}</span>
        </div>
        <div className={`summary-card ${diff >= 0 ? 'positive' : 'negative'}`}>
          <span className="card-label">Variación</span>
          <span className="card-value">{diff >= 0 ? '+' : ''}{diff}</span>
        </div>
      </div>

      {Object.entries(GRADES_BY_SCHOOL).map(([schoolType, grades]) => {
        const color = SCHOOL_COLORS[schoolType];
        const curSchool = current[schoolType] || {};
        const projSchool = projected[schoolType] || {};
        const curTotal = curSchool._total || 0;
        const projTotal = projSchool._total || 0;
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
                  <th>{currentYear}</th>
                  <th>Grupos</th>
                  <th>{projectedYear}</th>
                  <th>Grupos</th>
                  <th>Δ</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => {
                  const cur = curSchool[grade] || { total: 0, groups: 0 };
                  const proj = projSchool[grade] || { total: 0, groups: 0 };
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
                  <td colSpan={2}><strong>{curTotal}</strong></td>
                  <td colSpan={2}><strong>{projTotal}</strong></td>
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

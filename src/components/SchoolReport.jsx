import { lazy, Suspense } from 'react';
import { aggregateBySchool, genderBySchool } from '../utils/projection';
import { GRADES_BY_SCHOOL, GRADE_LABELS } from '../data/initialData';
import { exportSchoolReport } from '../utils/exportExcel';
import ExportButton from './ExportButton';

const ChartsSchool = lazy(() => import('./ChartsSchool'));

const SCHOOL_TYPES = ['Preschool', 'Elementary', 'Middle', 'Upper Middle', 'High'];

const SCHOOL_COLORS = {
  Preschool: '#7c3aed',
  Elementary: '#2563eb',
  Middle: '#059669',
  'Upper Middle': '#d97706',
  High: '#dc2626',
};

export default function SchoolReport({ currentSedes, projectedSedes, currentYear, projectedYear }) {
  const current = aggregateBySchool(currentSedes);
  const projected = aggregateBySchool(projectedSedes);
  const gender = genderBySchool(currentSedes);
  const hasGender = Object.values(gender).some(s => (s._girls + s._boys) > 0);

  return (
    <div className="general-report">
      {SCHOOL_TYPES.map((schoolType) => {
        const color = SCHOOL_COLORS[schoolType];
        const grades = GRADES_BY_SCHOOL[schoolType];
        const curSchool = current[schoolType] || {};
        const projSchool = projected[schoolType] || {};
        const curTotal = curSchool._total || 0;
        const projTotal = projSchool._total || 0;
        const diff = projTotal - curTotal;
        const curGroups = Object.values(curSchool).filter(v => v?.groups).reduce((s, v) => s + v.groups, 0);
        const projGroups = Object.values(projSchool).filter(v => v?.groups).reduce((s, v) => s + v.groups, 0);
        const schoolGender = gender[schoolType] || {};
        const totalGirls = schoolGender._girls || 0;
        const totalBoys = schoolGender._boys || 0;

        return (
          <div key={schoolType} className="school-report-block">
            <div className="school-report-header" style={{ borderLeftColor: color, borderLeftWidth: 5, borderLeftStyle: 'solid', padding: '1rem 1.25rem', background: 'white', borderRadius: 10, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color }}>{schoolType}</span>
                <div className="summary-cards" style={{ margin: 0, gap: '0.5rem' }}>
                  <div className="summary-card" style={{ padding: '0.4rem 0.75rem' }}>
                    <span className="card-label">{currentYear}</span>
                    <span className="card-value" style={{ fontSize: '1.1rem' }}>{curTotal}</span>
                  </div>
                  <div className="summary-card accent" style={{ padding: '0.4rem 0.75rem' }}>
                    <span className="card-label">{projectedYear}</span>
                    <span className="card-value" style={{ fontSize: '1.1rem' }}>{projTotal}</span>
                  </div>
                  <div className={`summary-card ${diff >= 0 ? 'positive' : 'negative'}`} style={{ padding: '0.4rem 0.75rem' }}>
                    <span className="card-label">Variación</span>
                    <span className="card-value" style={{ fontSize: '1.1rem' }}>{diff >= 0 ? '+' : ''}{diff}</span>
                  </div>
                </div>
              </div>
              <ExportButton
                label="Exportar"
                onClick={() => exportSchoolReport(currentSedes, projectedSedes, schoolType, currentYear, projectedYear)}
              />
            </div>

            <Suspense fallback={<div className="charts-loading">Cargando gráficas…</div>}>
              <ChartsSchool
                schoolType={schoolType}
                color={color}
                currentSedes={currentSedes}
                projectedSedes={projectedSedes}
                currentYear={currentYear}
                projectedYear={projectedYear}
              />
            </Suspense>

            {hasGender && (
              <table className="report-table" style={{ marginBottom: '0.5rem' }}>
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th style={{ color: '#db2777' }}>Niñas</th>
                    <th style={{ color: '#2563eb' }}>Niños</th>
                    <th>Total</th>
                    <th>% Niñas</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => {
                    const g = schoolGender[grade] || { girls: 0, boys: 0 };
                    const tot = g.girls + g.boys;
                    return (
                      <tr key={grade}>
                        <td className="grade-label">{GRADE_LABELS[grade]}</td>
                        <td style={{ color: '#db2777', fontWeight: 600 }}>{g.girls}</td>
                        <td style={{ color: '#2563eb', fontWeight: 600 }}>{g.boys}</td>
                        <td>{tot}</td>
                        <td>{tot > 0 ? ((g.girls / tot) * 100).toFixed(1) + '%' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Total</strong></td>
                    <td style={{ color: '#db2777' }}><strong>{totalGirls}</strong></td>
                    <td style={{ color: '#2563eb' }}><strong>{totalBoys}</strong></td>
                    <td><strong>{totalGirls + totalBoys}</strong></td>
                    <td><strong>{totalGirls + totalBoys > 0 ? ((totalGirls / (totalGirls + totalBoys)) * 100).toFixed(1) + '%' : '—'}</strong></td>
                  </tr>
                </tfoot>
              </table>
            )}

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
                  <td><strong>{curTotal}</strong></td>
                  <td><strong>{curGroups}</strong></td>
                  <td><strong>{projTotal}</strong></td>
                  <td><strong>{projGroups}</strong></td>
                  <td className={diff >= 0 ? 'diff-pos' : 'diff-neg'}><strong>{diff >= 0 ? '+' : ''}{diff}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}

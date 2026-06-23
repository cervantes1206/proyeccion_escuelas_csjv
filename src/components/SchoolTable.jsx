import GradeRow from './GradeRow';
import { gradeTotal } from '../utils/projection';
import { TRANSITION_GRADES, GRADUATING_GRADE } from '../data/initialData';

const SCHOOL_COLORS = {
  Preschool: '#7c3aed',
  Elementary: '#2563eb',
  Middle: '#059669',
  'Upper Middle': '#d97706',
  High: '#dc2626',
};

export default function SchoolTable({ school, onChange, readOnly }) {
  const color = SCHOOL_COLORS[school.type] || '#374151';
  const schoolTotal = school.grades.reduce((s, g) => s + gradeTotal(g), 0);

  function handleGradeChange(gradeIdx, updated) {
    const newGrades = school.grades.map((g, i) => (i === gradeIdx ? updated : g));
    onChange({ ...school, grades: newGrades });
  }

  return (
    <div className="school-table-wrap" style={{ '--school-color': color }}>
      <div className="school-header" style={{ background: color }}>
        <span className="school-name">{school.type}</span>
        <span className="school-total">{schoolTotal} estudiantes</span>
      </div>
      <table className="school-table">
        <thead>
          <tr>
            <th>Grado</th>
            <th>Grupos</th>
            <th>Total</th>
            <th>N° Grupos</th>
          </tr>
        </thead>
        <tbody>
          {school.grades.map((gradeEntry, idx) => (
            <tr key={gradeEntry.grade} className={
              TRANSITION_GRADES.includes(gradeEntry.grade) ? 'transition-grade' :
              gradeEntry.grade === GRADUATING_GRADE ? 'graduating-grade' : ''
            }>
              {readOnly ? (
                <>
                  <td className="grade-label">{gradeEntry.grade === '1' ? '1°' : gradeEntry.grade.includes('K') ? gradeEntry.grade : gradeEntry.grade + '°'}</td>
                  <td className="groups-cell">
                    <div className="groups-wrapper">
                      {gradeEntry.groups.map((g, gi) => (
                        <div key={g.id} className="group-input-wrap">
                          <span className="group-tag">G{gi + 1}</span>
                          <span className="group-value">{g.students}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="total-cell">{gradeTotal(gradeEntry)}</td>
                  <td className="groups-count-cell">{gradeEntry.groups.length} {gradeEntry.groups.length === 1 ? 'grupo' : 'grupos'}</td>
                </>
              ) : (
                <GradeRow
                  gradeEntry={gradeEntry}
                  onChange={(updated) => handleGradeChange(idx, updated)}
                  readOnly={readOnly}
                />
              )}
              {TRANSITION_GRADES.includes(gradeEntry.grade) && (
                <td className="transition-badge-cell" rowSpan={1}>
                  <span className="transition-badge">→ cambia escuela</span>
                </td>
              )}
              {gradeEntry.grade === GRADUATING_GRADE && (
                <td className="transition-badge-cell">
                  <span className="graduating-badge">✓ Egresa</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="school-footer">
            <td colSpan={2}><strong>Total {school.type}</strong></td>
            <td><strong>{schoolTotal}</strong></td>
            <td>{school.grades.reduce((s, g) => s + g.groups.length, 0)} grupos</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

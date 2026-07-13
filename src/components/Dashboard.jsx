import { useState, useRef } from 'react';
import { parseStudentFile } from '../utils/parseStudentFile';

const SCHOOL_COLORS = {
  Preschool: '#7c3aed',
  Elementary: '#2563eb',
  Middle: '#059669',
  'Upper Middle': '#d97706',
  High: '#dc2626',
};

function GenderBar({ girls, total }) {
  const boys = total - girls;
  const pct = total > 0 ? Math.round((girls / total) * 100) : 0;
  return (
    <div className="db-gender-bar-wrap">
      <div className="db-gender-bar">
        <div className="db-bar-girls" style={{ width: pct + '%' }} />
        <div className="db-bar-boys" style={{ width: (100 - pct) + '%' }} />
      </div>
      <span className="db-gender-labels">
        <span className="db-girls">{girls}♀</span>
        <span className="db-boys">{boys}♂</span>
      </span>
    </div>
  );
}

function GroupRow({ group }) {
  return (
    <tr className="db-group-row">
      <td className="db-indent-4">Grupo {group.name}</td>
      <td className="db-count">{group.total}</td>
      <td><GenderBar girls={group.girls} total={group.total} /></td>
    </tr>
  );
}

function GradeRows({ grade, open, onToggle }) {
  const total = grade.groups.reduce((s, g) => s + g.total, 0);
  const girls = grade.groups.reduce((s, g) => s + g.girls, 0);
  return (
    <>
      <tr className="db-grade-row" onClick={onToggle}>
        <td className="db-indent-3">
          <span className="db-toggle">{open ? '▾' : '▸'}</span>
          {grade.grade.includes('K') ? grade.grade : grade.grade + '°'}
        </td>
        <td className="db-count">{total}</td>
        <td><GenderBar girls={girls} total={total} /></td>
      </tr>
      {open && grade.groups.map((g) => (
        <GroupRow key={g.name} group={g} />
      ))}
    </>
  );
}

function SchoolRows({ school, openGrades, onGradeToggle }) {
  const total = school.grades.reduce((s, g) => s + g.groups.reduce((s2, gr) => s2 + gr.total, 0), 0);
  const girls = school.grades.reduce((s, g) => s + g.groups.reduce((s2, gr) => s2 + gr.girls, 0), 0);
  const color = SCHOOL_COLORS[school.name] || '#374151';
  return (
    <>
      <tr className="db-school-row" style={{ '--sc': color }}>
        <td className="db-indent-2" style={{ color }}>
          <span className="db-school-dot" style={{ background: color }} />
          {school.name}
        </td>
        <td className="db-count" style={{ color }}>{total}</td>
        <td><GenderBar girls={girls} total={total} /></td>
      </tr>
      {school.grades.map((grade) => {
        const key = school.name + '|' + grade.grade;
        return (
          <GradeRows
            key={grade.grade}
            grade={grade}
            open={openGrades.has(key)}
            onToggle={() => onGradeToggle(key)}
          />
        );
      })}
    </>
  );
}

function SedeSection({ sede, openSchools, openGrades, onSchoolToggle, onGradeToggle }) {
  const total = sede.schools.reduce((s, sc) =>
    s + sc.grades.reduce((s2, g) => s2 + g.groups.reduce((s3, gr) => s3 + gr.total, 0), 0), 0);
  const girls = sede.schools.reduce((s, sc) =>
    s + sc.grades.reduce((s2, g) => s2 + g.groups.reduce((s3, gr) => s3 + gr.girls, 0), 0), 0);

  return (
    <div className="db-sede-block">
      <table className="db-table">
        <thead>
          <tr className="db-sede-header">
            <th className="db-sede-name">{sede.name}</th>
            <th className="db-count-head">{total} estudiantes</th>
            <th className="db-gender-head">
              <GenderBar girls={girls} total={total} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sede.schools.map((school) => {
            const key = sede.name + '|' + school.name;
            const isOpen = openSchools.has(key);
            return (
              <>
                <tr
                  key={school.name}
                  className={'db-school-toggle' + (isOpen ? ' open' : '')}
                  onClick={() => onSchoolToggle(key)}
                >
                  <td colSpan={3} className="db-indent-1">
                    <span className="db-toggle">{isOpen ? '▾' : '▸'}</span>
                    <span className="db-school-label" style={{ color: SCHOOL_COLORS[school.name] }}>
                      {school.name}
                    </span>
                    <span className="db-school-summary">
                      {school.grades.reduce((s, g) => s + g.groups.reduce((s2, gr) => s2 + gr.total, 0), 0)} est.
                      &nbsp;·&nbsp;
                      {school.grades.length} grados
                    </span>
                  </td>
                </tr>
                {isOpen && (
                  <SchoolRows
                    school={school}
                    openGrades={openGrades}
                    onGradeToggle={onGradeToggle}
                  />
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [openSchools, setOpenSchools] = useState(new Set());
  const [openGrades, setOpenGrades] = useState(new Set());
  const fileRef = useRef();

  function toggleSchool(key) {
    setOpenSchools((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleGrade(key) {
    setOpenGrades((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function expandAll() {
    if (!data) return;
    const schools = new Set();
    const grades = new Set();
    data.forEach((sede) => {
      sede.schools.forEach((school) => {
        schools.add(sede.name + '|' + school.name);
        school.grades.forEach((grade) => {
          grades.add(school.name + '|' + grade.grade);
        });
      });
    });
    setOpenSchools(schools);
    setOpenGrades(grades);
  }

  function collapseAll() {
    setOpenSchools(new Set());
    setOpenGrades(new Set());
  }

  async function handleFile(file) {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    setOpenSchools(new Set());
    setOpenGrades(new Set());
    try {
      const result = await parseStudentFile(file);
      setData(result);
      setFileName(file.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const totalStudents = data
    ? data.reduce((s, sede) =>
        s + sede.schools.reduce((s2, sc) =>
          s2 + sc.grades.reduce((s3, g) =>
            s3 + g.groups.reduce((s4, gr) => s4 + gr.total, 0), 0), 0), 0)
    : 0;

  return (
    <div className="dashboard">
      <div
        className={'db-upload-zone' + (loading ? ' loading' : '')}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {loading ? (
          <span className="db-upload-text">Procesando archivo...</span>
        ) : fileName ? (
          <span className="db-upload-text">
            <strong>{fileName}</strong> — {totalStudents} estudiantes cargados
            <span className="db-upload-hint">Haz clic para cargar otro archivo</span>
          </span>
        ) : (
          <span className="db-upload-text">
            📂 Arrastra o haz clic para cargar archivo
            <span className="db-upload-hint">.csv · .xlsx · .xls</span>
          </span>
        )}
      </div>

      {error && <div className="db-error">{error}</div>}

      {data && (
        <>
          <div className="db-controls">
            <button className="db-btn" onClick={expandAll}>Expandir todo</button>
            <button className="db-btn" onClick={collapseAll}>Colapsar todo</button>
          </div>
          <div className="db-sedes">
            {data.map((sede) => (
              <SedeSection
                key={sede.name}
                sede={sede}
                openSchools={openSchools}
                openGrades={openGrades}
                onSchoolToggle={toggleSchool}
                onGradeToggle={toggleGrade}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

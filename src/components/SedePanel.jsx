import { useState } from 'react';
import SchoolTable from './SchoolTable';
import { grandTotal, sedeStats } from '../utils/projection';
import { GRADES_BY_SCHOOL } from '../data/initialData';

export default function SedePanel({ sede, onChange, readOnly }) {
  const [activeSchool, setActiveSchool] = useState(sede.schools[0]?.type || null);

  function handleSchoolChange(schoolIdx, updated) {
    const newSchools = sede.schools.map((s, i) => (i === schoolIdx ? updated : s));
    onChange({ ...sede, schools: newSchools });
  }

  const totalStudents = sede.schools.reduce((sum, school) =>
    sum + school.grades.reduce((s2, g) => s2 + g.groups.reduce((s3, gr) => s3 + (Number(gr.students) || 0), 0), 0), 0
  );

  return (
    <div className="sede-panel">
      <div className="sede-header">
        <div className="sede-title-row">
          {readOnly ? (
            <h3 className="sede-name">{sede.name}</h3>
          ) : (
            <input
              className="sede-name-input"
              value={sede.name}
              onChange={(e) => onChange({ ...sede, name: e.target.value })}
              placeholder="Nombre de la sede"
            />
          )}
          <span className="sede-total-badge">{totalStudents} estudiantes</span>
        </div>
      </div>

      <div className="school-tabs">
        {sede.schools.map((school) => (
          <button
            key={school.type}
            className={`school-tab ${activeSchool === school.type ? 'active' : ''}`}
            onClick={() => setActiveSchool(school.type)}
          >
            {school.type}
            <span className="tab-count">
              {school.grades.reduce((s, g) => s + g.groups.reduce((s2, gr) => s2 + (Number(gr.students) || 0), 0), 0)}
            </span>
          </button>
        ))}
      </div>

      <div className="school-content">
        {sede.schools.map((school, idx) =>
          school.type === activeSchool ? (
            <SchoolTable
              key={school.id}
              school={school}
              onChange={(updated) => handleSchoolChange(idx, updated)}
              readOnly={readOnly}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

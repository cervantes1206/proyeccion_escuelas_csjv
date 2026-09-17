import { useMemo, useState } from 'react';
import { GRADES_BY_SCHOOL, SCHOOL_COLORS } from '../data/initialData';
import { aggregateBySchool } from '../utils/projection';
import { calculateSchoolTeacherPlan } from '../utils/teachers';

const SCHOOL_TYPES = Object.keys(GRADES_BY_SCHOOL);

export default function TeacherPlanner({
  currentSedes,
  projectedSedes,
  currentYear,
  projectedYear,
  subjectsBySchool,
  onChangeSubjects,
  teacherMaxHours,
  onChangeMaxHours,
}) {
  const [activeSchool, setActiveSchool] = useState(SCHOOL_TYPES[0]);
  const [yearMode, setYearMode] = useState('projected');

  const sedesForMode = yearMode === 'projected' ? projectedSedes : currentSedes;
  const aggregated = useMemo(() => aggregateBySchool(sedesForMode), [sedesForMode]);

  const totalGroups = useMemo(() => {
    const bySchool = aggregated[activeSchool] || {};
    return Object.entries(bySchool)
      .filter(([grade]) => grade !== '_total')
      .reduce((sum, [, v]) => sum + (v.groups || 0), 0);
  }, [aggregated, activeSchool]);

  const subjects = useMemo(() => subjectsBySchool[activeSchool] || [], [subjectsBySchool, activeSchool]);
  const maxHours = useMemo(
    () => teacherMaxHours[activeSchool] || { homeroom: 19.5, area: 24 },
    [teacherMaxHours, activeSchool]
  );

  const plan = useMemo(
    () => calculateSchoolTeacherPlan(activeSchool, totalGroups, subjects, maxHours),
    [activeSchool, totalGroups, subjects, maxHours]
  );

  function updateSubject(idx, patch) {
    const next = subjects.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChangeSubjects(activeSchool, next);
  }

  function addSubject() {
    onChangeSubjects(activeSchool, [
      ...subjects,
      { id: crypto.randomUUID(), name: '', hoursPerWeek: 1, teacherType: 'area' },
    ]);
  }

  function removeSubject(idx) {
    onChangeSubjects(activeSchool, subjects.filter((_, i) => i !== idx));
  }

  return (
    <div className="teacher-planner">
      <div className="report-header">
        <div className="report-header-row">
          <div>
            <h2>Plan de Maestros por Horas</h2>
            <p className="report-subtitle">
              Maestros necesarios por área = horas semanales del área × grupos de la escuela ÷ horas máximas semanales del maestro que la cubre (redondeado hacia arriba). El tope de horas depende de si el área la dicta un director de grupo (HRT) o un maestro de área.
            </p>
          </div>
          <div className="year-toggle">
            <button
              className={'year-toggle-btn' + (yearMode === 'current' ? ' active' : '')}
              onClick={() => setYearMode('current')}
            >
              {currentYear}
            </button>
            <button
              className={'year-toggle-btn' + (yearMode === 'projected' ? ' active' : '')}
              onClick={() => setYearMode('projected')}
            >
              {projectedYear} (proyectado)
            </button>
          </div>
        </div>
      </div>

      <div className="school-tabs teacher-school-tabs">
        {SCHOOL_TYPES.map((st) => (
          <button
            key={st}
            className={'school-tab' + (activeSchool === st ? ' active' : '')}
            style={{ '--school-color': SCHOOL_COLORS[st] }}
            onClick={() => setActiveSchool(st)}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="entrada-controls teacher-config-row">
        <div className="k4-control">
          <label htmlFor="max-homeroom-hours">
            Horas máx. semanales — director de grupo (HRT)
            <span className="k4-hint">Grupos proyectados en {activeSchool}: {totalGroups}</span>
          </label>
          <input
            id="max-homeroom-hours"
            type="number"
            min="1"
            step="0.5"
            className="k4-input"
            value={maxHours.homeroom ?? ''}
            onChange={(e) => onChangeMaxHours(activeSchool, { ...maxHours, homeroom: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="k4-control">
          <label htmlFor="max-area-hours">
            Horas máx. semanales — maestro de área
            <span className="k4-hint">&nbsp;</span>
          </label>
          <input
            id="max-area-hours"
            type="number"
            min="1"
            step="0.5"
            className="k4-input"
            value={maxHours.area ?? ''}
            onChange={(e) => onChangeMaxHours(activeSchool, { ...maxHours, area: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="school-table-wrap">
        <table className="report-table teacher-subjects-table">
          <thead>
            <tr>
              <th>Materia / Área</th>
              <th>Horas semanales</th>
              <th>Tipo de maestro</th>
              <th>Horas totales/semana</th>
              <th>Maestros necesarios</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((row, idx) => (
              <tr key={row.id}>
                <td>
                  <input
                    className="subject-name-input"
                    value={row.name}
                    placeholder="Nombre de la materia"
                    onChange={(e) => updateSubject(idx, { name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="group-input"
                    value={row.hoursPerWeek}
                    onChange={(e) => updateSubject(idx, { hoursPerWeek: Number(e.target.value) || 0 })}
                  />
                </td>
                <td>
                  <select
                    className="teacher-type-select"
                    value={row.teacherType === 'homeroom' ? 'homeroom' : 'area'}
                    onChange={(e) => updateSubject(idx, { teacherType: e.target.value })}
                  >
                    <option value="homeroom">Director de grupo (HRT)</option>
                    <option value="area">Maestro de área</option>
                  </select>
                </td>
                <td>{row.totalHours}</td>
                <td className="total-cell">{row.teachers}</td>
                <td>
                  <button className="btn-remove-group" onClick={() => removeSubject(idx)} title="Eliminar materia">✕</button>
                </td>
              </tr>
            ))}
            {plan.rows.length === 0 && (
              <tr>
                <td colSpan="6" className="teacher-empty-row">
                  No hay materias configuradas para {activeSchool}. Agrega la primera con "+ Agregar materia".
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3"><strong>Total horas semanales configuradas</strong></td>
              <td colSpan="3"><strong>{plan.totalHoursConfigured}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button className="btn-add-group teacher-add-subject" onClick={addSubject}>+ Agregar materia</button>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="card-label">Directores de grupo</span>
          <span className="card-value">{plan.homeroomTeachers}</span>
          {plan.homeroomFloorApplied && (
            <span className="card-note">mínimo 1 por grupo ({plan.totalGroups}) — por horas daría menos</span>
          )}
        </div>
        <div className="summary-card accent">
          <span className="card-label">Maestros de área</span>
          <span className="card-value">{plan.areaTeachers}</span>
        </div>
        <div className="summary-card positive">
          <span className="card-label">Total maestros — {activeSchool}</span>
          <span className="card-value">{plan.totalTeachers}</span>
        </div>
      </div>
    </div>
  );
}

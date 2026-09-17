import { useMemo, useState } from 'react';
import { GRADES_BY_SCHOOL, SCHOOL_COLORS } from '../data/initialData';
import { totalGroupsForSchool } from '../utils/projection';
import { calculateSchoolTeacherPlan, availableHoursForSchool } from '../utils/teachers';

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
  numPeriods,
  onChangeNumPeriods,
  numWeeks,
  onChangeNumWeeks,
  teachersRoster,
  onChangeRoster,
}) {
  const [activeSchool, setActiveSchool] = useState(SCHOOL_TYPES[0]);
  const [yearMode, setYearMode] = useState('projected');

  const sedesForMode = yearMode === 'projected' ? projectedSedes : currentSedes;

  const totalGroups = useMemo(
    () => totalGroupsForSchool(sedesForMode, activeSchool),
    [sedesForMode, activeSchool]
  );

  // Grupos por sede, para materias que solo aplican a una sede específica
  // (ej. Música P1-P2 en Medellín, P3-P4 en El Retiro).
  const groupsBySede = useMemo(() => {
    const map = {};
    for (const sede of sedesForMode) {
      map[sede.id] = totalGroupsForSchool([sede], activeSchool);
    }
    return map;
  }, [sedesForMode, activeSchool]);

  function resolveGroups(subject) {
    if (subject.sedeId && groupsBySede[subject.sedeId] != null) return groupsBySede[subject.sedeId];
    return totalGroups;
  }

  const subjects = useMemo(() => subjectsBySchool[activeSchool] || [], [subjectsBySchool, activeSchool]);
  const maxHours = useMemo(
    () => teacherMaxHours[activeSchool] || { homeroom: 19.5, area: 24 },
    [teacherMaxHours, activeSchool]
  );

  const plan = useMemo(
    () => calculateSchoolTeacherPlan(activeSchool, totalGroups, subjects, maxHours, numPeriods, resolveGroups, numWeeks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSchool, totalGroups, subjects, maxHours, numPeriods, numWeeks, groupsBySede]
  );

  const availableHomeroomHours = useMemo(
    () => availableHoursForSchool(teachersRoster, activeSchool, 'homeroom'),
    [teachersRoster, activeSchool]
  );
  const availableAreaHours = useMemo(
    () => availableHoursForSchool(teachersRoster, activeSchool, 'area'),
    [teachersRoster, activeSchool]
  );
  const homeroomDiffHours = availableHomeroomHours - plan.peakHomeroomHours;
  const areaDiffHours = availableAreaHours - plan.peakAreaHours;

  function updateTeacher(idx, patch) {
    const next = teachersRoster.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    onChangeRoster(next);
  }

  function addTeacher() {
    onChangeRoster([
      ...teachersRoster,
      { id: crypto.randomUUID(), name: '', role: 'area', maxHours: 24, schools: [activeSchool] },
    ]);
  }

  function removeTeacher(idx) {
    onChangeRoster(teachersRoster.filter((_, i) => i !== idx));
  }

  function toggleTeacherSchool(idx, teacher, school) {
    const current = teacher.schools || [];
    const next = current.includes(school) ? current.filter((s) => s !== school) : [...current, school];
    updateTeacher(idx, { schools: next });
  }

  function updateSubject(idx, patch) {
    const next = subjects.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChangeSubjects(activeSchool, next);
  }

  function addSubject() {
    onChangeSubjects(activeSchool, [
      ...subjects,
      { id: crypto.randomUUID(), name: '', hoursPerWeek: 1, teacherType: 'area', periods: 'all', sedeId: '' },
    ]);
  }

  function removeSubject(idx) {
    onChangeSubjects(activeSchool, subjects.filter((_, i) => i !== idx));
  }

  function togglePeriod(idx, row, period) {
    const current = Array.isArray(row.periods) ? row.periods : [];
    const active = current.includes(period);
    const next = active ? current.filter((p) => p !== period) : [...current, period].sort((a, b) => a - b);
    updateSubject(idx, { periods: next });
  }

  return (
    <div className="teacher-planner">
      <div className="report-header">
        <div className="report-header-row">
          <div>
            <h2>Plan de Maestros por Horas</h2>
            <p className="report-subtitle">
              Horas del área = horas semanales × grupos que la reciben. Mínimo de maestros = esas horas ÷ tope de horas semanales del maestro que la cubre, redondeado hacia abajo — las horas que sobran quedan como "horas pendientes" por resolver (otro maestro, tiempo compartido, etc.), en vez de asumir de una vez un maestro adicional completo. "Redondeado" es esa misma cuenta llevada hacia arriba, para cuando sí se quiere cubrir el 100%. El tope de horas depende de si el área la dicta un director de grupo (HRT) o un maestro de área. Las materias por periodo solo cuentan mientras están activas — el total real es el pico entre periodos.
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
          <label htmlFor="num-periods">
            Nº de periodos académicos
            <span className="k4-hint">Grupos proyectados en {activeSchool}: {totalGroups}</span>
          </label>
          <input
            id="num-periods"
            type="number"
            min="1"
            max="12"
            className="k4-input"
            value={numPeriods}
            onChange={(e) => onChangeNumPeriods(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div className="k4-control">
          <label htmlFor="num-weeks">
            Nº de semanas del año escolar
            <span className="k4-hint">&nbsp;</span>
          </label>
          <input
            id="num-weeks"
            type="number"
            min="1"
            max="52"
            className="k4-input"
            value={numWeeks}
            onChange={(e) => onChangeNumWeeks(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div className="k4-control">
          <label htmlFor="max-homeroom-hours">
            Horas máx. semanales — director de grupo (HRT)
            <span className="k4-hint">&nbsp;</span>
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

      <div className="teacher-table-scroll">
        <table className="report-table teacher-subjects-table">
          <thead>
            <tr>
              <th>Materia / Área</th>
              <th>Horas semanales</th>
              <th>Tipo de maestro</th>
              <th>Sede</th>
              <th>Periodos activos</th>
              <th>Horas totales/semana</th>
              <th>Horas anuales</th>
              <th>Mínimo de maestros</th>
              <th>Horas pendientes</th>
              <th>Redondeado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((row, idx) => {
              const isAllYear = row.periods === 'all' || !row.periods;
              return (
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
                  <td>
                    <select
                      className="teacher-type-select"
                      value={row.sedeId || ''}
                      onChange={(e) => updateSubject(idx, { sedeId: e.target.value })}
                    >
                      <option value="">Todas las sedes</option>
                      {currentSedes.map((sede) => (
                        <option key={sede.id} value={sede.id}>{sede.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="periods-cell">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isAllYear}
                        onChange={(e) => updateSubject(idx, { periods: e.target.checked ? 'all' : [] })}
                      />
                      Todo el año
                    </label>
                    {!isAllYear && (
                      <div className="period-badges">
                        {Array.from({ length: numPeriods }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            className={'period-badge' + (row.periods.includes(p) ? ' active' : '')}
                            onClick={() => togglePeriod(idx, row, p)}
                          >
                            P{p}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>{row.totalHours}</td>
                  <td>{Math.round(row.annualHours)}</td>
                  <td className="total-cell">{row.minTeachers}</td>
                  <td>{row.pendingHours > 0 ? `${row.pendingHours.toFixed(1)}h` : '—'}</td>
                  <td>{row.teachers}</td>
                  <td>
                    <button className="btn-remove-group" onClick={() => removeSubject(idx)} title="Eliminar materia">✕</button>
                  </td>
                </tr>
              );
            })}
            {plan.rows.length === 0 && (
              <tr>
                <td colSpan="11" className="teacher-empty-row">
                  No hay materias configuradas para {activeSchool}. Agrega la primera con "+ Agregar materia".
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="7"><strong>Total horas semanales configuradas</strong></td>
              <td colSpan="4"><strong>{plan.totalHoursConfigured}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button className="btn-add-group teacher-add-subject" onClick={addSubject}>+ Agregar materia</button>

      {numPeriods > 1 && (
        <div className="school-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Horas activas/semana</th>
                <th>Directores de grupo</th>
                <th>Maestros de área</th>
                <th>Total maestros</th>
              </tr>
            </thead>
            <tbody>
              {plan.periods.map((p) => (
                <tr key={p.period} className={p.period === plan.peakHomeroomPeriod || p.period === plan.peakAreaPeriod ? 'period-peak-row' : ''}>
                  <td className="grade-label">Periodo {p.period}</td>
                  <td>{p.totalHours}</td>
                  <td>{p.homeroomTeachers}</td>
                  <td>{p.areaTeachers}</td>
                  <td className="total-cell">{p.homeroomTeachers + p.areaTeachers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="summary-cards">
        <div className="summary-card">
          <span className="card-label">Directores de grupo (pico)</span>
          <span className="card-value">{plan.homeroomTeachers}</span>
          {plan.homeroomFloorApplied && (
            <span className="card-note">mínimo 1 por grupo ({plan.totalGroups}) — por horas daría menos</span>
          )}
        </div>
        <div className="summary-card accent">
          <span className="card-label">Maestros de área — redondeado (pico)</span>
          <span className="card-value">{plan.areaTeachers}</span>
          {numPeriods > 1 && <span className="card-note">periodo {plan.peakAreaPeriod} es el más cargado</span>}
        </div>
        <div className="summary-card positive">
          <span className="card-label">Total maestros — {activeSchool}</span>
          <span className="card-value">{plan.totalTeachers}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Mínimo de maestros de área</span>
          <span className="card-value">{plan.areaMinTeachers}</span>
          <span className="card-note">+ {plan.areaPendingHours.toFixed(1)}h pendientes sin cubrir</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Mínimo de directores de grupo</span>
          <span className="card-value">{plan.homeroomMinTeachers}</span>
          <span className="card-note">+ {plan.homeroomPendingHours.toFixed(1)}h pendientes (antes del mínimo de 1 por grupo)</span>
        </div>
      </div>

      <div className="report-header">
        <h2>Roster de Maestros</h2>
        <p className="report-subtitle">
          Maestros reales por nombre, rol y las escuelas que cubre. Si un maestro cubre más de una escuela, su tope de horas se reparte entre ellas para calcular cuánto aporta a cada una.
        </p>
      </div>

      <div className="teacher-table-scroll">
        <table className="report-table teacher-subjects-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Horas máx. semanales</th>
              <th>Escuelas que cubre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {teachersRoster.map((teacher, idx) => (
              <tr key={teacher.id}>
                <td>
                  <input
                    className="subject-name-input"
                    value={teacher.name}
                    placeholder="Nombre del maestro"
                    onChange={(e) => updateTeacher(idx, { name: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    className="teacher-type-select"
                    value={teacher.role === 'homeroom' ? 'homeroom' : 'area'}
                    onChange={(e) => updateTeacher(idx, { role: e.target.value })}
                  >
                    <option value="homeroom">Director de grupo (HRT)</option>
                    <option value="area">Maestro de área</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="group-input"
                    value={teacher.maxHours}
                    onChange={(e) => updateTeacher(idx, { maxHours: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="periods-cell">
                  <div className="period-badges">
                    {SCHOOL_TYPES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={'period-badge' + ((teacher.schools || []).includes(st) ? ' active' : '')}
                        onClick={() => toggleTeacherSchool(idx, teacher, st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </td>
                <td>
                  <button className="btn-remove-group" onClick={() => removeTeacher(idx)} title="Eliminar maestro">✕</button>
                </td>
              </tr>
            ))}
            {teachersRoster.length === 0 && (
              <tr>
                <td colSpan="5" className="teacher-empty-row">
                  No hay maestros en el roster. Agrega el primero con "+ Agregar maestro".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="btn-add-group teacher-add-subject" onClick={addTeacher}>+ Agregar maestro</button>

      <div className="summary-cards">
        {[
          { label: 'Directores de grupo', diff: homeroomDiffHours, available: availableHomeroomHours, needed: plan.peakHomeroomHours, cap: maxHours.homeroom },
          { label: 'Maestros de área', diff: areaDiffHours, available: availableAreaHours, needed: plan.peakAreaHours, cap: maxHours.area },
        ].map(({ label, diff, available, needed, cap }) => {
          const equivTeachers = Math.abs(Math.round(diff / (cap || 1)));
          return (
            <div key={label} className={'summary-card' + (diff < 0 ? ' negative' : ' positive')}>
              <span className="card-label">{label} — {activeSchool}</span>
              <span className="card-value">
                {diff < 0 ? '−' : '+'}{equivTeachers} maestro{equivTeachers === 1 ? '' : 's'}
              </span>
              <span className="card-note">
                {diff < 0 ? 'Déficit' : 'Superávit'} de {Math.abs(diff).toFixed(1)}h — {available.toFixed(1)}h disponibles vs {needed.toFixed(1)}h necesarias
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

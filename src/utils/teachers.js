// Paso 1 (número de grupos) lo entrega projection.js/aggregateBySchool —
// no se recalcula aquí. Cuando una materia aplica solo a una sede
// específica (ej. Música solo en Medellín), el número de grupos usado es
// el de esa sede — lo resuelve quien llama (resolveGroups), no esta capa.

// ¿La materia está activa en un periodo dado? 'all' (o sin periodos
// configurados) es "todo el año". Un array — incluso vacío, mientras el
// usuario aún no marca ningún periodo — restringe a esos periodos.
export function isActiveInPeriod(subject, period) {
  if (!subject.periods || subject.periods === 'all') return true;
  return subject.periods.includes(period);
}

// Semanas activas de una materia en el año: todas las semanas si es
// "todo el año", o solo las semanas de los periodos en que está activa.
export function activeWeeksForSubject(subject, weeksPerYear, numPeriods) {
  if (!subject.periods || subject.periods === 'all') return weeksPerYear;
  const weeksPerPeriod = weeksPerYear / (numPeriods || 1);
  return weeksPerPeriod * subject.periods.length;
}

// Paso 2: horas totales semanales que demanda un área/materia mientras
// está activa = intensidad semanal del área × número de grupos que la
// reciben.
export function subjectHoursNeeded(subject, groups) {
  return (Number(subject.hoursPerWeek) || 0) * groups;
}

// Horas anuales que demanda una materia = horas semanales × grupos ×
// semanas activas en el año (menos si solo corre en algunos periodos).
export function annualHoursForSubject(subject, groups, weeksPerYear, numPeriods) {
  return subjectHoursNeeded(subject, groups) * activeWeeksForSubject(subject, weeksPerYear, numPeriods);
}

// Paso 4: qué tope de horas semanales aplica, según si el área la cubre
// un director de grupo (HRT) o un maestro de área.
export function maxHoursForSubject(subject, maxHours) {
  const type = subject.teacherType === 'homeroom' ? 'homeroom' : 'area';
  return Number(maxHours?.[type]) || 0;
}

// Paso 3 (redondeado hacia arriba): maestros necesarios para cubrir el
// 100% del área = horas totales ÷ tope de horas del tipo de maestro que
// la cubre, redondeado hacia arriba.
export function teachersNeededForSubject(subject, groups, maxHours) {
  const hours = subjectHoursNeeded(subject, groups);
  const cap = maxHoursForSubject(subject, maxHours);
  if (hours <= 0 || !cap) return 0;
  return Math.ceil(hours / cap);
}

// Mínimo de maestros de tiempo completo que el área garantiza (horas
// totales ÷ tope, redondeado hacia abajo) — a diferencia del redondeo
// hacia arriba, no asume que el resto se cubre con un maestro adicional
// completo; ese resto queda como "horas pendientes" para resolver aparte
// (otro maestro a tiempo parcial, horas compartidas, etc).
export function minTeachersForSubject(subject, groups, maxHours) {
  const hours = subjectHoursNeeded(subject, groups);
  const cap = maxHoursForSubject(subject, maxHours);
  if (hours <= 0 || !cap) return 0;
  return Math.floor(hours / cap);
}

// Horas que quedan sin cubrir después del mínimo de maestros de tiempo
// completo (horas totales − mínimo × tope).
export function pendingHoursForSubject(subject, groups, maxHours) {
  const hours = subjectHoursNeeded(subject, groups);
  const cap = maxHoursForSubject(subject, maxHours);
  if (!cap) return hours;
  return hours - minTeachersForSubject(subject, groups, maxHours) * cap;
}

function sumByType(rows, type, field) {
  return rows
    .filter((r) => (r.teacherType === 'homeroom') === (type === 'homeroom'))
    .reduce((sum, r) => sum + r[field], 0);
}

// Plan completo de maestros para una escuela: desglose por área (horas,
// mínimo de maestros de tiempo completo y horas pendientes, mientras el
// área está activa), el detalle por periodo y el total real a
// contratar — el pico entre periodos, porque una materia que solo corre
// en 1-2 periodos no necesita maestro dedicado en los periodos en que no
// está activa.
export function calculateSchoolTeacherPlan(
  schoolType,
  totalGroups,
  subjects,
  maxHours,
  numPeriods,
  resolveGroups,
  weeksPerYear
) {
  const groupsFor = resolveGroups || (() => totalGroups);

  const rows = subjects.map((subject) => {
    const groups = groupsFor(subject);
    return {
      ...subject,
      groupsUsed: groups,
      totalHours: subjectHoursNeeded(subject, groups),
      annualHours: annualHoursForSubject(subject, groups, weeksPerYear || 40, numPeriods),
      teachers: teachersNeededForSubject(subject, groups, maxHours),
      minTeachers: minTeachersForSubject(subject, groups, maxHours),
      pendingHours: pendingHoursForSubject(subject, groups, maxHours),
    };
  });

  const periods = Array.from({ length: numPeriods || 1 }, (_, i) => i + 1).map((period) => {
    const activeRows = rows.filter((r) => isActiveInPeriod(r, period));
    return {
      period,
      totalHours: activeRows.reduce((s, r) => s + r.totalHours, 0),
      homeroomHours: sumByType(activeRows, 'homeroom', 'totalHours'),
      areaHours: sumByType(activeRows, 'area', 'totalHours'),
      homeroomByHours: sumByType(activeRows, 'homeroom', 'teachers'),
      homeroomTeachers: Math.max(sumByType(activeRows, 'homeroom', 'teachers'), totalGroups),
      areaTeachers: sumByType(activeRows, 'area', 'teachers'),
      homeroomMinTeachers: sumByType(activeRows, 'homeroom', 'minTeachers'),
      homeroomPendingHours: sumByType(activeRows, 'homeroom', 'pendingHours'),
      areaMinTeachers: sumByType(activeRows, 'area', 'minTeachers'),
      areaPendingHours: sumByType(activeRows, 'area', 'pendingHours'),
    };
  });

  const peakHomeroomPeriod = periods.reduce((a, b) => (b.homeroomTeachers > a.homeroomTeachers ? b : a), periods[0]);
  const peakAreaPeriod = periods.reduce((a, b) => (b.areaTeachers > a.areaTeachers ? b : a), periods[0]);

  const homeroomTeachers = peakHomeroomPeriod.homeroomTeachers;
  const homeroomFloorApplied = peakHomeroomPeriod.homeroomByHours < totalGroups;
  const areaTeachers = peakAreaPeriod.areaTeachers;
  const totalHoursConfigured = subjects.reduce((s, sub) => s + (Number(sub.hoursPerWeek) || 0), 0);

  return {
    schoolType,
    totalGroups,
    rows,
    periods,
    peakHomeroomPeriod: peakHomeroomPeriod.period,
    peakAreaPeriod: peakAreaPeriod.period,
    homeroomTeachers,
    homeroomFloorApplied,
    homeroomMinTeachers: peakHomeroomPeriod.homeroomMinTeachers,
    homeroomPendingHours: peakHomeroomPeriod.homeroomPendingHours,
    areaMinTeachers: peakAreaPeriod.areaMinTeachers,
    areaPendingHours: peakAreaPeriod.areaPendingHours,
    // Horas equivalentes en el pico, para comparar contra el roster real.
    peakHomeroomHours: homeroomTeachers * (Number(maxHours?.homeroom) || 0),
    peakAreaHours: peakAreaPeriod.areaHours,
    areaTeachers,
    totalTeachers: areaTeachers + homeroomTeachers,
    totalHoursConfigured,
  };
}

// Horas reales disponibles de un rol para una escuela, a partir del
// roster de maestros: cada maestro reparte su tope de horas semanales
// entre todas las escuelas que cubre (un maestro de 24h que cubre 2
// escuelas aporta 12h a cada una). sedeId filtra el roster a una sola
// sede primero (El Retiro, Medellín...) — sin sedeId cuenta a todos,
// incluyendo a quienes van a ambas sedes.
export function availableHoursForSchool(roster, schoolType, role, sedeId) {
  return roster
    .filter((t) => t.role === role && (t.schools || []).includes(schoolType))
    .filter((t) => !sedeId || !t.sedeIds || t.sedeIds.length === 0 || t.sedeIds.includes(sedeId))
    .reduce((sum, t) => sum + (Number(t.maxHours) || 0) / Math.max((t.schools || []).length, 1), 0);
}

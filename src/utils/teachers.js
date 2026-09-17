// Paso 1 (número de grupos) lo entrega projection.js/aggregateBySchool —
// no se recalcula aquí.

// Paso 2: horas totales semanales que demanda un área/materia en una
// escuela = intensidad semanal del área × número de grupos de la escuela.
export function subjectHoursNeeded(subject, totalGroups) {
  return (Number(subject.hoursPerWeek) || 0) * totalGroups;
}

// Paso 4: qué tope de horas semanales aplica, según si el área la cubre
// un director de grupo (HRT) o un maestro de área.
export function maxHoursForSubject(subject, maxHours) {
  const type = subject.teacherType === 'homeroom' ? 'homeroom' : 'area';
  return Number(maxHours?.[type]) || 0;
}

// Paso 3: maestros necesarios para un área = horas totales del área ÷ tope
// de horas semanales del tipo de maestro que la cubre (redondeado hacia
// arriba). La misma fórmula aplica a HRT y a maestro de área — solo cambia
// el tope de horas de cada uno.
export function teachersNeededForSubject(subject, totalGroups, maxHours) {
  const hours = subjectHoursNeeded(subject, totalGroups);
  const cap = maxHoursForSubject(subject, maxHours);
  if (hours <= 0 || !cap) return 0;
  return Math.ceil(hours / cap);
}

// Plan completo de maestros para una escuela: desglose por área y totales,
// separados entre directores de grupo (HRT) y maestros de área.
export function calculateSchoolTeacherPlan(schoolType, totalGroups, subjects, maxHours) {
  const rows = subjects.map((subject) => ({
    ...subject,
    totalHours: subjectHoursNeeded(subject, totalGroups),
    teachers: teachersNeededForSubject(subject, totalGroups, maxHours),
  }));

  // Piso: cada grupo necesita su propio director de grupo aunque las
  // materias de tipo HRT, por horas, den un total menor.
  const homeroomTeachersByHours = rows
    .filter((r) => r.teacherType === 'homeroom')
    .reduce((sum, r) => sum + r.teachers, 0);
  const homeroomTeachers = Math.max(homeroomTeachersByHours, totalGroups);
  const homeroomFloorApplied = totalGroups > homeroomTeachersByHours;
  const areaTeachers = rows
    .filter((r) => r.teacherType !== 'homeroom')
    .reduce((sum, r) => sum + r.teachers, 0);
  const totalHoursConfigured = subjects.reduce((s, sub) => s + (Number(sub.hoursPerWeek) || 0), 0);

  return {
    schoolType,
    totalGroups,
    rows,
    homeroomTeachers,
    homeroomFloorApplied,
    areaTeachers,
    totalTeachers: areaTeachers + homeroomTeachers,
    totalHoursConfigured,
  };
}

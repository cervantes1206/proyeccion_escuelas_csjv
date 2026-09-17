// Horas totales semanales que demanda una materia en una escuela:
// intensidad semanal de la materia × número de grupos de esa escuela.
export function subjectHoursNeeded(subject, totalGroups) {
  return (Number(subject.hoursPerWeek) || 0) * totalGroups;
}

// Maestros de área necesarios para cubrir una materia, dado el máximo de
// horas semanales que puede dictar un maestro. Las materias cubiertas por
// el director de grupo (needsAreaTeacher: false) no requieren cálculo:
// ya están dentro de la carga del director, que se cuenta 1 por grupo.
export function teachersNeededForSubject(subject, totalGroups, maxAreaHours) {
  if (!subject.needsAreaTeacher) return 0;
  const hours = subjectHoursNeeded(subject, totalGroups);
  if (hours <= 0 || !maxAreaHours) return 0;
  return Math.ceil(hours / maxAreaHours);
}

// Plan completo de maestros para una escuela: desglose por materia y
// totales (directores de grupo + maestros de área).
export function calculateSchoolTeacherPlan(schoolType, totalGroups, subjects, maxAreaHours) {
  const rows = subjects.map((subject) => ({
    ...subject,
    totalHours: subjectHoursNeeded(subject, totalGroups),
    teachers: teachersNeededForSubject(subject, totalGroups, maxAreaHours),
  }));

  const areaTeachers = rows.reduce((sum, r) => sum + r.teachers, 0);
  const homeroomTeachers = totalGroups;
  const totalHoursConfigured = subjects.reduce((s, sub) => s + (Number(sub.hoursPerWeek) || 0), 0);

  return {
    schoolType,
    totalGroups,
    rows,
    areaTeachers,
    homeroomTeachers,
    totalTeachers: areaTeachers + homeroomTeachers,
    totalHoursConfigured,
  };
}

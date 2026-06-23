import { GRADES_BY_SCHOOL, GRADE_LABELS } from '../data/initialData';
import { sedeStats, aggregateBySchool, grandTotal, gradeTotal } from './projection';

const SCHOOL_ORDER = ['Preschool', 'Elementary', 'Middle', 'Upper Middle', 'High'];

async function getXLSX() {
  return import('xlsx');
}

function styleHeader(ws, range, XLSX) {
  // xlsx community edition doesn't support cell styles — just return
  return ws;
}

// ── Informe por Sede ──────────────────────────────────────────────
export async function exportSedeReport(currentSede, projectedSede, currentYear, projectedYear) {
  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  const current = sedeStats(currentSede);
  const projected = sedeStats(projectedSede);

  // Summary sheet
  const summaryRows = [
    [`Informe por Sede: ${currentSede.name}`],
    [`Año actual: ${currentYear}`, '', `Año proyectado: ${projectedYear}`],
    [],
    ['Escuela', 'Grado', `Estudiantes ${currentYear}`, `Grupos ${currentYear}`, `Estudiantes ${projectedYear}`, `Grupos ${projectedYear}`, 'Variación'],
  ];

  let totalCur = 0, totalProj = 0;

  for (const schoolType of SCHOOL_ORDER) {
    const grades = GRADES_BY_SCHOOL[schoolType];
    const curSchool = current[schoolType] || {};
    const projSchool = projected[schoolType] || {};
    let schoolCur = 0, schoolProj = 0;

    for (const grade of grades) {
      const cur = curSchool[grade] || { total: 0, groups: 0 };
      const proj = projSchool[grade] || { total: 0, groups: 0 };
      const diff = proj.total - cur.total;
      summaryRows.push([schoolType, GRADE_LABELS[grade], cur.total, cur.groups, proj.total, proj.groups, diff >= 0 ? `+${diff}` : `${diff}`]);
      schoolCur += cur.total;
      schoolProj += proj.total;
    }

    const schoolDiff = schoolProj - schoolCur;
    summaryRows.push(['', `Total ${schoolType}`, schoolCur, '', schoolProj, '', schoolDiff >= 0 ? `+${schoolDiff}` : `${schoolDiff}`]);
    summaryRows.push([]);
    totalCur += schoolCur;
    totalProj += schoolProj;
  }

  const grandDiff = totalProj - totalCur;
  summaryRows.push(['TOTAL SEDE', '', totalCur, '', totalProj, '', grandDiff >= 0 ? `+${grandDiff}` : `${grandDiff}`]);

  const ws = XLSX.utils.aoa_to_sheet(summaryRows);
  ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Informe Sede');

  // Detail sheet: groups per grade
  const detailRows = [
    [`Detalle de grupos — ${currentSede.name}`],
    [],
    ['Escuela', 'Grado', 'Grupo', `Estudiantes ${currentYear}`, `Estudiantes ${projectedYear}`],
  ];

  for (const school of currentSede.schools) {
    const projSchool = projectedSede.schools.find(s => s.type === school.type);
    for (const gradeEntry of school.grades) {
      const projGrade = projSchool?.grades.find(g => g.grade === gradeEntry.grade);
      gradeEntry.groups.forEach((g, i) => {
        detailRows.push([school.type, GRADE_LABELS[gradeEntry.grade], `Grupo ${i + 1}`, g.students, projGrade?.groups[i]?.students ?? '-']);
      });
    }
  }

  const ws2 = XLSX.utils.aoa_to_sheet(detailRows);
  ws2['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 22 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalle Grupos');

  XLSX.writeFile(wb, `Proyeccion_${currentSede.name.replace(/\s+/g, '_')}_${projectedYear}.xlsx`);
}

// ── Informe General ───────────────────────────────────────────────
export async function exportGeneralReport(currentSedes, projectedSedes, currentYear, projectedYear) {
  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  const current = aggregateBySchool(currentSedes);
  const projected = aggregateBySchool(projectedSedes);
  const curGrand = grandTotal(currentSedes);
  const projGrand = grandTotal(projectedSedes);

  // General summary
  const rows = [
    ['Informe General Consolidado'],
    [`Año actual: ${currentYear}`, '', `Año proyectado: ${projectedYear}`],
    [`Total sedes: ${currentSedes.length}`],
    [],
    ['Escuela', 'Grado', `Estudiantes ${currentYear}`, `Grupos ${currentYear}`, `Estudiantes ${projectedYear}`, `Grupos ${projectedYear}`, 'Variación'],
  ];

  for (const schoolType of SCHOOL_ORDER) {
    const grades = GRADES_BY_SCHOOL[schoolType];
    let schoolCur = 0, schoolProj = 0;

    for (const grade of grades) {
      const cur = current[schoolType]?.[grade] || { total: 0, groups: 0 };
      const proj = projected[schoolType]?.[grade] || { total: 0, groups: 0 };
      const diff = proj.total - cur.total;
      rows.push([schoolType, GRADE_LABELS[grade], cur.total, cur.groups, proj.total, proj.groups, diff >= 0 ? `+${diff}` : `${diff}`]);
      schoolCur += cur.total;
      schoolProj += proj.total;
    }

    const schoolDiff = schoolProj - schoolCur;
    rows.push(['', `Total ${schoolType}`, schoolCur, '', schoolProj, '', schoolDiff >= 0 ? `+${schoolDiff}` : `${schoolDiff}`]);
    rows.push([]);
  }

  const grandDiff = projGrand - curGrand;
  rows.push(['TOTAL GENERAL', '', curGrand, '', projGrand, '', grandDiff >= 0 ? `+${grandDiff}` : `${grandDiff}`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'General');

  // One sheet per sede
  for (let i = 0; i < currentSedes.length; i++) {
    const sede = currentSedes[i];
    const projSede = projectedSedes[i];
    const curStats = sedeStats(sede);
    const projStats = sedeStats(projSede);

    const sedeRows = [
      [`Sede: ${sede.name}`],
      [],
      ['Escuela', 'Grado', `Estudiantes ${currentYear}`, `Grupos ${currentYear}`, `Estudiantes ${projectedYear}`, `Grupos ${projectedYear}`, 'Variación'],
    ];

    for (const schoolType of SCHOOL_ORDER) {
      for (const grade of GRADES_BY_SCHOOL[schoolType]) {
        const cur = curStats[schoolType]?.[grade] || { total: 0, groups: 0 };
        const proj = projStats[schoolType]?.[grade] || { total: 0, groups: 0 };
        const diff = proj.total - cur.total;
        sedeRows.push([schoolType, GRADE_LABELS[grade], cur.total, cur.groups, proj.total, proj.groups, diff >= 0 ? `+${diff}` : `${diff}`]);
      }
      const curT = curStats[schoolType]?._total || 0;
      const projT = projStats[schoolType]?._total || 0;
      const d = projT - curT;
      sedeRows.push(['', `Total ${schoolType}`, curT, '', projT, '', d >= 0 ? `+${d}` : `${d}`]);
      sedeRows.push([]);
    }

    const sedeTotalCur = Object.values(curStats).reduce((s, v) => s + (v._total || 0), 0);
    const sedeTotalProj = Object.values(projStats).reduce((s, v) => s + (v._total || 0), 0);
    const sedeDiff = sedeTotalProj - sedeTotalCur;
    sedeRows.push(['TOTAL SEDE', '', sedeTotalCur, '', sedeTotalProj, '', sedeDiff >= 0 ? `+${sedeDiff}` : `${sedeDiff}`]);

    const wsSede = XLSX.utils.aoa_to_sheet(sedeRows);
    wsSede['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsSede, sede.name.slice(0, 31));
  }

  XLSX.writeFile(wb, `Proyeccion_General_${projectedYear}.xlsx`);
}

import { NEXT_GRADE, GRADES_BY_SCHOOL, MAX_GROUP_SIZE, TRANSITION_GRADES } from '../data/initialData';

// Get which school type a grade belongs to
export function getSchoolForGrade(grade) {
  for (const [schoolType, grades] of Object.entries(GRADES_BY_SCHOOL)) {
    if (grades.includes(grade)) return schoolType;
  }
  return null;
}

// Total students in a grade entry
export function gradeTotal(gradeEntry) {
  return gradeEntry.groups.reduce((sum, g) => sum + (Number(g.students) || 0), 0);
}

// Project a single sede forward one year
export function projectSede(sede, newK4Input) {
  // Build a map: schoolType -> grade -> total students (current year)
  const currentData = {};
  for (const school of sede.schools) {
    currentData[school.type] = {};
    for (const gradeEntry of school.grades) {
      currentData[school.type][gradeEntry.grade] = gradeTotal(gradeEntry);
    }
  }

  // Build projected data: schoolType -> grade -> projected students
  const projected = {};
  for (const school of sede.schools) {
    projected[school.type] = {};
    for (const grade of GRADES_BY_SCHOOL[school.type]) {
      projected[school.type][grade] = 0;
    }
  }

  // Carry each grade forward
  for (const school of sede.schools) {
    for (const grade of GRADES_BY_SCHOOL[school.type]) {
      const students = currentData[school.type][grade] || 0;
      const nextGrade = NEXT_GRADE[grade];
      if (!nextGrade) continue; // grade 11 graduates

      const nextSchool = getSchoolForGrade(nextGrade);
      if (nextSchool && projected[nextSchool]) {
        projected[nextSchool][nextGrade] = (projected[nextSchool][nextGrade] || 0) + students;
      }
    }
  }

  // Add new K4 students
  if (projected['Preschool']) {
    projected['Preschool']['K4'] = (projected['Preschool']['K4'] || 0) + (Number(newK4Input) || 0);
  }

  // Build the projected sede with groups calculated
  const projectedSchools = sede.schools.map((school) => ({
    ...school,
    grades: GRADES_BY_SCHOOL[school.type].map((grade) => {
      const total = projected[school.type][grade] || 0;
      const groups = calculateGroups(grade, total);
      return { grade, groups };
    }),
  }));

  return { ...sede, schools: projectedSchools };
}

// Split total students into groups of max MAX_GROUP_SIZE
function calculateGroups(grade, total) {
  if (total === 0) return [{ id: crypto.randomUUID(), students: 0 }];
  const numGroups = Math.ceil(total / MAX_GROUP_SIZE);
  const base = Math.floor(total / numGroups);
  const remainder = total % numGroups;
  return Array.from({ length: numGroups }, (_, i) => ({
    id: crypto.randomUUID(),
    students: i < remainder ? base + 1 : base,
  }));
}

// Summarize totals for a sede
export function sedeStats(sede) {
  const stats = {};
  for (const school of sede.schools) {
    stats[school.type] = {};
    let schoolTotal = 0;
    for (const gradeEntry of school.grades) {
      const t = gradeTotal(gradeEntry);
      stats[school.type][gradeEntry.grade] = {
        total: t,
        groups: gradeEntry.groups.length,
      };
      schoolTotal += t;
    }
    stats[school.type]._total = schoolTotal;
  }
  return stats;
}

// Aggregate stats across all sedes for a given school type
export function aggregateBySchool(sedes) {
  const result = {};
  for (const [schoolType, grades] of Object.entries(GRADES_BY_SCHOOL)) {
    result[schoolType] = { _total: 0 };
    for (const grade of grades) {
      result[schoolType][grade] = { total: 0, groups: 0 };
    }
  }

  for (const sede of sedes) {
    for (const school of sede.schools) {
      for (const gradeEntry of school.grades) {
        const t = gradeTotal(gradeEntry);
        result[school.type][gradeEntry.grade].total += t;
        result[school.type][gradeEntry.grade].groups += gradeEntry.groups.length;
        result[school.type]._total += t;
      }
    }
  }
  return result;
}

// Grand total across everything
export function grandTotal(sedes) {
  return sedes.reduce((sum, sede) => {
    return (
      sum +
      sede.schools.reduce((s2, school) => {
        return s2 + school.grades.reduce((s3, g) => s3 + gradeTotal(g), 0);
      }, 0)
    );
  }, 0);
}

// Gender breakdown across all sedes: schoolType -> grade -> { girls, boys }
export function genderBySchool(sedes) {
  const result = {};
  for (const [schoolType, grades] of Object.entries(GRADES_BY_SCHOOL)) {
    result[schoolType] = { _girls: 0, _boys: 0 };
    for (const grade of grades) {
      result[schoolType][grade] = { girls: 0, boys: 0 };
    }
  }
  for (const sede of sedes) {
    for (const school of sede.schools) {
      for (const gradeEntry of school.grades) {
        for (const g of gradeEntry.groups) {
          const girls = Number(g.girls) || 0;
          const boys = Number(g.boys) || 0;
          result[school.type][gradeEntry.grade].girls += girls;
          result[school.type][gradeEntry.grade].boys += boys;
          result[school.type]._girls += girls;
          result[school.type]._boys += boys;
        }
      }
    }
  }
  return result;
}

// Detect transition grades that move between schools
export function getTransitions(sede) {
  const transitions = [];
  for (const school of sede.schools) {
    for (const gradeEntry of school.grades) {
      if (TRANSITION_GRADES.includes(gradeEntry.grade)) {
        const total = gradeTotal(gradeEntry);
        const nextGrade = NEXT_GRADE[gradeEntry.grade];
        const nextSchool = getSchoolForGrade(nextGrade);
        transitions.push({
          from: { school: school.type, grade: gradeEntry.grade, total },
          to: { school: nextSchool, grade: nextGrade },
        });
      }
    }
  }
  return transitions;
}

import { GRADES_BY_SCHOOL } from '../data/initialData';

const GRADE_MAP = {
  'KINDER 4': 'K4', 'KINDER 5': 'K5', 'KINDER 6': 'K6',
  'PRIMERO': '1', 'SEGUNDO': '2', 'TERCERO': '3',
  'CUARTO': '4', 'QUINTO': '5',
  'SEXTO': '6', 'SEPTIMO': '7', 'OCTAVO': '8',
  'NOVENO': '9', 'DECIMO': '10', 'UNDECIMO': '11',
};

const SCHOOL_BY_GRADE = {
  K4: 'Preschool', K5: 'Preschool', K6: 'Preschool',
  '1': 'Elementary', '2': 'Elementary', '3': 'Elementary',
  '4': 'Middle', '5': 'Middle',
  '6': 'Upper Middle', '7': 'Upper Middle', '8': 'Upper Middle',
  '9': 'High', '10': 'High', '11': 'High',
};

const SCHOOL_ORDER = ['Preschool', 'Elementary', 'Middle', 'Upper Middle', 'High'];
const GRADE_ORDER = ['K4', 'K5', 'K6', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

function isFemale(sexoRaw) {
  const s = (sexoRaw || '').toString().trim().toUpperCase();
  return s === 'F' || s === 'FEMENINO' || s === 'MUJER';
}

function normalizeSede(raw) {
  const s = raw?.toString().trim().toUpperCase();
  if (s === 'EL RETIRO') return 'El Retiro';
  if (s === 'MEDELLÍN' || s === 'MEDELLIN') return 'Medellín';
  return raw?.toString().trim() || 'Sin sede';
}

function parseGroupName(groupRaw) {
  const s = (groupRaw || '').toString().replace(/^Grupo\s*:\s*/i, '').trim();
  const match = s.match(/-([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : (s || 'A');
}

// Aggregate rows into: sedeName → schoolType → grade → groupName → { total, girls }
function aggregateRows(rows) {
  const tree = {};
  for (const row of rows) {
    const sedeName = normalizeSede(row['Sede']);
    const gradoRaw = (row['Grado'] || '').toString().trim().toUpperCase();
    const grade = GRADE_MAP[gradoRaw];
    if (!grade) continue;

    const school = SCHOOL_BY_GRADE[grade];
    const groupName = parseGroupName(row['Grupo']);
    const female = isFemale(row['Sexo']);

    if (!tree[sedeName]) tree[sedeName] = {};
    if (!tree[sedeName][school]) tree[sedeName][school] = {};
    if (!tree[sedeName][school][grade]) tree[sedeName][school][grade] = { __girls: 0 };
    if (!tree[sedeName][school][grade][groupName]) {
      tree[sedeName][school][grade][groupName] = { total: 0, girls: 0 };
    }
    tree[sedeName][school][grade][groupName].total++;
    if (female) {
      tree[sedeName][school][grade][groupName].girls++;
      tree[sedeName][school][grade].__girls++;
    }
  }
  return tree;
}

// Dashboard display structure: cascading sede → school → grade → groups[]
function buildDashboardTree(tree) {
  return Object.entries(tree)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sedeName, schools]) => ({
      name: sedeName,
      schools: SCHOOL_ORDER
        .filter((s) => schools[s])
        .map((schoolName) => ({
          name: schoolName,
          grades: GRADE_ORDER
            .filter((g) => schools[schoolName]?.[g])
            .map((grade) => ({
              grade,
              groups: Object.entries(schools[schoolName][grade])
                .filter(([k]) => k !== '__girls')
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([groupName, counts]) => ({ name: groupName, ...counts })),
            })),
        })),
    }));
}

// Projection-compatible structure (matches sedes2026.js / importExcel.js output)
function buildProjectionSedes(tree) {
  return Object.entries(tree)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sedeName, schools]) => ({
      id: crypto.randomUUID(),
      name: sedeName,
      schools: SCHOOL_ORDER.map((schoolType) => ({
        id: crypto.randomUUID(),
        type: schoolType,
        grades: GRADES_BY_SCHOOL[schoolType].map((grade) => {
          const gradeData = schools[schoolType]?.[grade] || {};
          const girls = gradeData.__girls || 0;
          const groups = Object.entries(gradeData)
            .filter(([k]) => k !== '__girls')
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, counts]) => ({ id: crypto.randomUUID(), students: counts.total }));
          return {
            grade,
            girls,
            groups: groups.length > 0 ? groups : [{ id: crypto.randomUUID(), students: 0 }],
          };
        }),
      })),
    }));
}

function parseCsvRows(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(';');
  return lines.slice(1).map((line) => {
    const vals = line.split(';');
    const row = {};
    headers.forEach((h, i) => { row[h.trim()] = vals[i]?.trim() || ''; });
    return row;
  });
}

// Returns { dashboardData, projectionSedes }
export function parseStudentFile(file) {
  return new Promise((resolve, reject) => {
    const name = file.name.toLowerCase();

    function processRows(rows) {
      const tree = aggregateRows(rows);
      resolve({
        dashboardData: buildDashboardTree(tree),
        projectionSedes: buildProjectionSedes(tree),
      });
    }

    if (name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try { processRows(parseCsvRows(e.target.result)); }
        catch (err) { reject(new Error('Error al leer CSV: ' + err.message)); }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file, 'ISO-8859-1');
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx');
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          processRows(XLSX.utils.sheet_to_json(ws));
        } catch (err) { reject(new Error('Error al leer Excel: ' + err.message)); }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Formato no soportado. Use .csv, .xlsx o .xls'));
    }
  });
}

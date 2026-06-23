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

// Normalize sede name from Excel value
function normalizeSede(raw) {
  const s = raw?.toString().trim().toUpperCase();
  if (s === 'EL RETIRO') return 'El Retiro';
  if (s === 'MEDELLÍN' || s === 'MEDELLIN') return 'Medellín';
  return raw?.toString().trim() || 'Sin sede';
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        resolve(buildSedes(rows));
      } catch (err) {
        reject(new Error('No se pudo leer el archivo: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}

function buildSedes(rows) {
  // Aggregate: sedeName -> schoolType -> grade -> groupName -> count
  const tree = {};

  for (const row of rows) {
    const sedeName = normalizeSede(row['Sede']);
    const gradoRaw = row['Grado']?.toString().trim().toUpperCase();
    const grade = GRADE_MAP[gradoRaw];
    if (!grade) continue;

    const schoolType = SCHOOL_BY_GRADE[grade];
    const groupRaw = row['Grupo']?.toString().trim() || '';
    const groupName = groupRaw.replace(/^Grupo\s*:\s*/i, '').trim() || 'G1';

    if (!tree[sedeName]) tree[sedeName] = {};
    if (!tree[sedeName][schoolType]) tree[sedeName][schoolType] = {};
    if (!tree[sedeName][schoolType][grade]) tree[sedeName][schoolType][grade] = {};
    if (!tree[sedeName][schoolType][grade][groupName]) {
      tree[sedeName][schoolType][grade][groupName] = 0;
    }
    tree[sedeName][schoolType][grade][groupName]++;

    // Count girls per grade (grade-level, not per group)
    if (!tree[sedeName][schoolType][grade].__girls) tree[sedeName][schoolType][grade].__girls = 0;
    const sexoRaw = (row['Sexo'] ?? row['SEXO'] ?? row['Género'] ?? row['Genero'] ?? row['GENERO'] ?? '')
      .toString().trim().toUpperCase();
    if (sexoRaw === 'F' || sexoRaw === 'FEMENINO' || sexoRaw === 'MUJER') {
      tree[sedeName][schoolType][grade].__girls++;
    }
  }

  // Build sedes array matching app structure
  return Object.entries(tree).map(([sedeName, schools]) => ({
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
          .map(([, count]) => ({ id: crypto.randomUUID(), students: count }));
        return {
          grade,
          girls,
          groups: groups.length > 0 ? groups : [{ id: crypto.randomUUID(), students: 0 }],
        };
      }),
    })),
  }));
}

export function validateExcelStructure(file) {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
    return 'El archivo debe ser .xlsx o .xls';
  }
  return null;
}

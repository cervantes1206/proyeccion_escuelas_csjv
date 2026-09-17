// School structure: Preschool → Elementary → Middle → Upper Middle → High
export const SCHOOL_TYPES = {
  PRESCHOOL: 'Preschool',
  ELEMENTARY: 'Elementary',
  MIDDLE: 'Middle',
  UPPER_MIDDLE: 'Upper Middle',
  HIGH: 'High',
};

export const GRADES_BY_SCHOOL = {
  Preschool: ['K4', 'K5', 'K6'],
  Elementary: ['1', '2', '3'],
  Middle: ['4', '5'],
  'Upper Middle': ['6', '7', '8'],
  High: ['9', '10', '11'],
};

export const ALL_GRADES = ['K4', 'K5', 'K6', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

// Categorical colors per school type, anchored on the institutional palette
// (navy/orange/cyan from the CSJV logo). Validated for CVD-safe adjacency
// in this fixed order with scripts/validate_palette.js from the dataviz skill.
export const SCHOOL_COLORS = {
  Preschool: '#1b63c7',
  Elementary: '#ef7b0b',
  Middle: '#00a7e1',
  'Upper Middle': '#0e8a5b',
  High: '#8b2f9e',
};

// Grades that transition to the next school level
export const TRANSITION_GRADES = ['K6', '3', '5', '8'];

// Grade 11 graduates (exit system)
export const GRADUATING_GRADE = '11';

// Max students per group for new intake (K4 to grade 3)
export const MAX_GROUP_SIZE = 28;

// Grades that can receive new students
export const NEW_INTAKE_GRADES = ['K4', 'K5', 'K6', '1', '2', '3'];

// Grade progression map (within same school or to next school)
export const NEXT_GRADE = {
  K4: 'K5',
  K5: 'K6',
  K6: '1',   // transitions to Elementary
  '1': '2',
  '2': '3',
  '3': '4',  // transitions to Middle
  '4': '5',
  '5': '6',  // transitions to Upper Middle
  '6': '7',
  '7': '8',
  '8': '9',  // transitions to High
  '9': '10',
  '10': '11',
  '11': null, // graduates
};

export const GRADE_LABELS = {
  K4: 'K4',
  K5: 'K5',
  K6: 'K6',
  '1': '1°',
  '2': '2°',
  '3': '3°',
  '4': '4°',
  '5': '5°',
  '6': '6°',
  '7': '7°',
  '8': '8°',
  '9': '9°',
  '10': '10°',
  '11': '11°',
};

// Default initial data structure
export const createDefaultSede = (name) => ({
  id: crypto.randomUUID(),
  name,
  schools: [
    createDefaultSchool('Preschool'),
    createDefaultSchool('Elementary'),
    createDefaultSchool('Middle'),
    createDefaultSchool('Upper Middle'),
    createDefaultSchool('High'),
  ],
});

export const createDefaultSchool = (type) => ({
  id: crypto.randomUUID(),
  type,
  grades: GRADES_BY_SCHOOL[type].map((grade) => ({
    grade,
    girls: 0,
    groups: [{ id: crypto.randomUUID(), students: 0 }],
  })),
});

export const INITIAL_SEDES = [
  createDefaultSede('Sede Principal'),
];

// ── Plan de maestros por horas ──
// Máximo de horas/momentos semanales que puede dictar un maestro de área,
// por escuela. Un director de grupo (homeroom) siempre es 1 por grupo, así
// que no requiere fórmula — solo el maestro de área se calcula por horas.
// Fuente del valor por defecto (24h): Informe de empalme Middle School 2026.
export const DEFAULT_TEACHER_MAX_HOURS = {
  Preschool: { area: 24 },
  Elementary: { area: 24 },
  Middle: { area: 24 },
  'Upper Middle': { area: 24 },
  High: { area: 24 },
};

// Materias/áreas por escuela con su intensidad semanal (horas o "momentos"
// por grupo) y si requieren un maestro de área dedicado (si no, se asume
// que el director de grupo la cubre dentro de su propia carga).
// Middle School viene precargado con el Plan de Estudios 2026 real
// (Informe de empalme Middle School — 29 momentos semanales); las demás
// escuelas quedan vacías para configurarlas desde el formulario.
export const DEFAULT_SUBJECTS_BY_SCHOOL = {
  Preschool: [],
  Elementary: [],
  Middle: [
    { id: crypto.randomUUID(), name: 'Science', hoursPerWeek: 4, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Ciencias Sociales', hoursPerWeek: 2, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Arts Life Project', hoursPerWeek: 1, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Educación Religiosa', hoursPerWeek: 1, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Educación Ética y en Valores Humanos', hoursPerWeek: 1, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Educación Física', hoursPerWeek: 2, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'English as a Second Language (ESL)', hoursPerWeek: 7, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Lengua Castellana', hoursPerWeek: 4, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Matemáticas', hoursPerWeek: 5, needsAreaTeacher: true },
    { id: crypto.randomUUID(), name: 'Life Project - Proyecto Vital', hoursPerWeek: 1, needsAreaTeacher: false },
    { id: crypto.randomUUID(), name: 'School Assembly', hoursPerWeek: 1, needsAreaTeacher: false },
  ],
  'Upper Middle': [],
  High: [],
};

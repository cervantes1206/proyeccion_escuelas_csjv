import { SEDE_EL_RETIRO_ID, SEDE_MEDELLIN_ID } from './sedes2026';

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
// Tope de horas/momentos semanales que puede dictar cada tipo de maestro,
// por escuela. La misma fórmula de horas se aplica a ambos tipos — solo
// cambia el tope: un director de grupo (HRT) tiene menos horas disponibles
// porque también lidera su grupo; un maestro de área dicta a varios grupos.
// Fuente de los valores por defecto: Informe de empalme Middle School 2026
// (HRT 19,5 h/semana, maestro de área 24 h/semana).
export const DEFAULT_TEACHER_MAX_HOURS = {
  Preschool: { homeroom: 19.5, area: 24 },
  Elementary: { homeroom: 19.5, area: 24 },
  Middle: { homeroom: 19.5, area: 24 },
  'Upper Middle': { homeroom: 19.5, area: 24 },
  High: { homeroom: 19.5, area: 24 },
};

// Materias/áreas por escuela con su intensidad semanal (horas o "momentos"
// por grupo) y el tipo de maestro que la cubre: 'homeroom' (director de
// grupo / HRT) o 'area' (maestro de área especializado).
// Middle School viene precargado con el Plan de Estudios 2026 real
// (Informe de empalme Middle School — 29 momentos semanales); las demás
// escuelas quedan vacías para configurarlas desde el formulario.
export const DEFAULT_SUBJECTS_BY_SCHOOL = {
  Preschool: [],
  Elementary: [],
  Middle: [
    { id: crypto.randomUUID(), name: 'Science', hoursPerWeek: 4, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Ciencias Sociales', hoursPerWeek: 2, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Arts Life Project', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Educación Religiosa', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Educación Ética y en Valores Humanos', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Educación Física', hoursPerWeek: 2, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'English as a Second Language (ESL)', hoursPerWeek: 7, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Lengua Castellana', hoursPerWeek: 4, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Matemáticas', hoursPerWeek: 5, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Life Project - Proyecto Vital', hoursPerWeek: 1, teacherType: 'homeroom' },
    { id: crypto.randomUUID(), name: 'School Assembly', hoursPerWeek: 1, teacherType: 'homeroom' },
  ],
  // Confirmado en Asignación Académica 2026 Middle.xlsx (mismas hojas del
  // roster): Science, Ciencias Sociales, Educación Física, Lengua
  // Castellana y Matemáticas mantienen la misma intensidad semanal que en
  // Middle — ESL en cambio es de 6h, no 7h, en Upper Middle. Arts Life
  // Project, Educación Religiosa, Ética, Proyecto Vital y School Assembly
  // no aparecen en ese archivo (no llevan maestro de área dedicado ahí) —
  // se replican iguales a Middle como punto de partida, sin confirmar.
  'Upper Middle': [
    { id: crypto.randomUUID(), name: 'Science', hoursPerWeek: 4, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Ciencias Sociales', hoursPerWeek: 2, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Arts Life Project', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Educación Religiosa', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Educación Ética y en Valores Humanos', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Educación Física', hoursPerWeek: 2, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'English as a Second Language (ESL)', hoursPerWeek: 6, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Lengua Castellana', hoursPerWeek: 4, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Matemáticas', hoursPerWeek: 5, teacherType: 'area' },
    // Estas dos sí aparecen con maestro de área dedicado en el Excel para
    // Upper Middle (1h/grupo cada una) — no estaban en el plan de Middle
    // porque el informe de esa escuela las trata como transversales sin
    // hora propia, pero aquí sí se ve horas reales asignadas.
    { id: crypto.randomUUID(), name: 'Meaningful Change', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Talent Road Map', hoursPerWeek: 1, teacherType: 'area' },
    { id: crypto.randomUUID(), name: 'Life Project - Proyecto Vital', hoursPerWeek: 1, teacherType: 'homeroom' },
    { id: crypto.randomUUID(), name: 'School Assembly', hoursPerWeek: 1, teacherType: 'homeroom' },
  ],
  High: [],
};

// Roster real de Middle y Upper Middle, tomado de "Asignación Académica
// 2026 Middle.xlsx" (hojas ÁREAS MID-UPPER, LENGUA MID-UPPER OFICIAL,
// MATEMÁTICAS MID-UPPER). Confirma que Middle y Upper Middle comparten el
// mismo pool de maestros de área — por eso casi todos cubren ambas escuelas.
// Para Lengua Castellana, cuyo horario cambia por periodo, se tomó el primer
// bloque de periodo (P1 / P1 y P2) de cada sede como referencia.
export const DEFAULT_TEACHERS_ROSTER = [
  { id: crypto.randomUUID(), name: 'Paula Ruiz Acevedo', documento: '32106035', area: 'Science', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Claudia Salazar', documento: '1128456182', area: 'Science', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Lorena Cárdenas', documento: '', area: 'Science', role: 'area', groupDirector: true, maxHours: 21.5, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Estefanía Arredondo Ferrer', documento: '', area: 'Science', role: 'area', groupDirector: false, maxHours: 24.0, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Luisa Maya', documento: '', area: 'Science', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Jenny Mejía Gil', documento: '21394126', area: 'Science', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Lina Ruiz', documento: '1152457005', area: 'Science', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Mateo Arboleda', documento: '', area: 'Science', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Julian Londoño', documento: '1035223629', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Isabel Cristina Gómez', documento: '43260352', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Sebastian Montaño', documento: '1152220952', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Gabriela Bautista', documento: '', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Gustavo Sanchez Cano', documento: '1037574961', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Juan Sebastián Arango', documento: '1017150303', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Elkin Villa', documento: '98543607', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Sarah Schneider', documento: '', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 13.5, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Gabriel Rios', documento: '', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Laura Gallego', documento: '1026155692', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Sara Restrepo', documento: '1017164951', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juan David Aguirre', documento: '', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: true, maxHours: 13.5, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Valentina López', documento: '', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: false, maxHours: 24.0, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juanita Correa', documento: '', area: 'English as a Second Language (ESL)', role: 'area', groupDirector: false, maxHours: 6.0, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Armando Zapata', documento: '', area: 'Ciencias Sociales', role: 'area', groupDirector: false, maxHours: 8.0, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Claudia Castañeda', documento: '', area: 'Ciencias Sociales', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Ana Maria Velasquez', documento: '', area: 'Ciencias Sociales', role: 'area', groupDirector: true, maxHours: 21.5, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Armando Zapata', documento: '', area: 'Ciencias Sociales', role: 'area', groupDirector: false, maxHours: 14.0, schools: ['Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Hector Zuleta', documento: '', area: 'Ciencias Sociales', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Sindy Orozco', documento: '', area: 'Meaningful Change', role: 'area', groupDirector: false, maxHours: 10.0, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Juan Manuel Escobar', documento: '', area: 'Meaningful Change', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Leidy Espinosa', documento: '', area: 'Meaningful Change', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Sindy Orozco', documento: '', area: 'Meaningful Change', role: 'area', groupDirector: false, maxHours: 9.0, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juan Carlos Muñoz', documento: '', area: 'Meaningful Change', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juan Camilo Gaviria', documento: '', area: 'Meaningful Change', role: 'area', groupDirector: false, maxHours: 7.0, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Paola Arias', documento: '', area: 'Educación Física', role: 'area', groupDirector: false, maxHours: 16.0, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Sara Cardona', documento: '', area: 'Educación Física', role: 'area', groupDirector: false, maxHours: 16.0, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Sebastián Arias', documento: '', area: 'Educación Física', role: 'area', groupDirector: false, maxHours: 10.0, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Fredy Florez', documento: '', area: 'Educación Física', role: 'area', groupDirector: false, maxHours: 21.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Julian Arango', documento: '', area: 'Educación Física', role: 'area', groupDirector: true, maxHours: 16.0, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juan Camilo Agudelo', documento: '', area: 'Talent Road Map', role: 'area', groupDirector: false, maxHours: 23.0, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Diana Rivera', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Gabriela Gutierrez', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: false, maxHours: 22.0, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Daniel Orrego', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Bibiana Ocampo', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Maria Élida Barrientos', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: false, maxHours: 22.0, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Juan Carlos Tafur', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: false, maxHours: 14.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Maribel Vera', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: false, maxHours: 21.5, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Anny Lopez', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: false, maxHours: 21.5, schools: ['Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juanita Correa', documento: '', area: 'Lengua Castellana', role: 'area', groupDirector: false, maxHours: 13.0, schools: ['Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Maria Eugenia Hincapie', documento: '', area: 'Matemáticas', role: 'area', groupDirector: false, maxHours: 20.0, schools: ['Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Pedro Monsalve Marín', documento: '', area: 'Matemáticas', role: 'area', groupDirector: false, maxHours: 20.0, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Paola Balvin', documento: '', area: 'Matemáticas', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Mauricio Aristizabal', documento: '', area: 'Matemáticas', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'John Suaza Muñoz', documento: '', area: 'Matemáticas', role: 'area', groupDirector: true, maxHours: 19.5, schools: ['Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Nancy Chica', documento: '', area: 'Matemáticas', role: 'area', groupDirector: false, maxHours: 21.0, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_MEDELLIN_ID] },
  { id: crypto.randomUUID(), name: 'Angelo Oquendo', documento: '', area: 'Matemáticas', role: 'area', groupDirector: false, maxHours: 24.0, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Diana Uribe', documento: '', area: 'Matemáticas', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Arbey Ocampo', documento: '', area: 'Matemáticas', role: 'area', groupDirector: true, maxHours: 17.5, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juan David Muller', documento: '', area: 'Matemáticas', role: 'area', groupDirector: false, maxHours: 24.0, schools: ['Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
  { id: crypto.randomUUID(), name: 'Juan Camilo Agudelo', documento: '', area: 'Talent Road Map', role: 'area', groupDirector: false, maxHours: 16.0, schools: ['Middle', 'Upper Middle'], sedeIds: [SEDE_EL_RETIRO_ID] },
];
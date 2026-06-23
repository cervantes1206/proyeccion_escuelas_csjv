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

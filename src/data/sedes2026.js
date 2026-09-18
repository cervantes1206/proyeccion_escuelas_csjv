// Datos reales 2026 importados desde BD_ESTUDIANTES_2026.xlsx
// 2 sedes · 3574 estudiantes

// IDs fijos (no crypto.randomUUID()) para estas dos sedes reales, porque
// el roster de maestros (initialData.js) necesita referenciarlas de forma
// estable entre sesiones. Una sede agregada manualmente sí usa un id
// aleatorio (ver createDefaultSede en initialData.js).
export const SEDE_EL_RETIRO_ID = 'sede-el-retiro-2026';
export const SEDE_MEDELLIN_ID = 'sede-medellin-2026';

export const SEDES_2026 = [
  {
    id: SEDE_EL_RETIRO_ID,
    name: 'El Retiro',
    schools: [
      {
        id: crypto.randomUUID(),
        type: 'Preschool',
        grades: [
          { grade: 'K4', groups: [
            { id: crypto.randomUUID(), students: 23 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 24 }
          ] },
          { grade: 'K5', groups: [
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 23 }
          ] },
          { grade: 'K6', groups: [
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 25 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'Elementary',
        grades: [
          { grade: '1', groups: [
            { id: crypto.randomUUID(), students: 23 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 24 }
          ] },
          { grade: '2', groups: [
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 25 }
          ] },
          { grade: '3', groups: [
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 24 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'Middle',
        grades: [
          { grade: '4', groups: [
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 24 }
          ] },
          { grade: '5', groups: [
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 24 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'Upper Middle',
        grades: [
          { grade: '6', groups: [
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 28 }
          ] },
          { grade: '7', groups: [
            { id: crypto.randomUUID(), students: 23 },
            { id: crypto.randomUUID(), students: 21 },
            { id: crypto.randomUUID(), students: 23 }
          ] },
          { grade: '8', groups: [
            { id: crypto.randomUUID(), students: 20 },
            { id: crypto.randomUUID(), students: 20 },
            { id: crypto.randomUUID(), students: 21 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'High',
        grades: [
          { grade: '9', groups: [
            { id: crypto.randomUUID(), students: 28 },
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 26 }
          ] },
          { grade: '10', groups: [
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 }
          ] },
          { grade: '11', groups: [
            { id: crypto.randomUUID(), students: 20 },
            { id: crypto.randomUUID(), students: 20 }
          ] },
        ],
      },
    ],
  },
  {
    id: SEDE_MEDELLIN_ID,
    name: 'Medellín',
    schools: [
      {
        id: crypto.randomUUID(),
        type: 'Preschool',
        grades: [
          { grade: 'K4', groups: [
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 23 },
            { id: crypto.randomUUID(), students: 23 }
          ] },
          { grade: 'K5', groups: [
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 25 }
          ] },
          { grade: 'K6', groups: [
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 23 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 24 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'Elementary',
        grades: [
          { grade: '1', groups: [
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 23 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 23 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 24 }
          ] },
          { grade: '2', groups: [
            { id: crypto.randomUUID(), students: 28 },
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 28 },
            { id: crypto.randomUUID(), students: 27 }
          ] },
          { grade: '3', groups: [
            { id: crypto.randomUUID(), students: 28 },
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 28 },
            { id: crypto.randomUUID(), students: 28 },
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 28 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'Middle',
        grades: [
          { grade: '4', groups: [
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 27 }
          ] },
          { grade: '5', groups: [
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 26 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'Upper Middle',
        grades: [
          { grade: '6', groups: [
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 25 }
          ] },
          { grade: '7', groups: [
            { id: crypto.randomUUID(), students: 27 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 26 }
          ] },
          { grade: '8', groups: [
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 26 },
            { id: crypto.randomUUID(), students: 23 }
          ] },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'High',
        grades: [
          { grade: '9', groups: [
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 25 },
            { id: crypto.randomUUID(), students: 25 }
          ] },
          { grade: '10', groups: [
            { id: crypto.randomUUID(), students: 24 },
            { id: crypto.randomUUID(), students: 21 },
            { id: crypto.randomUUID(), students: 25 }
          ] },
          { grade: '11', groups: [
            { id: crypto.randomUUID(), students: 22 },
            { id: crypto.randomUUID(), students: 16 },
            { id: crypto.randomUUID(), students: 20 }
          ] },
        ],
      },
    ],
  },
];

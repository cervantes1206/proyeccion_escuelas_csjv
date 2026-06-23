# 📚 Proyección Escolar CSJV

Sistema web para proyectar la matrícula escolar al año siguiente, permitiendo planificar grupos, docentes y recursos con anticipación. Genera informes por sede, por escuela y un consolidado general.

---

## ¿Qué hace la aplicación?

Toma la matrícula actual de cada grado y calcula automáticamente cuántos estudiantes habrá el próximo año, teniendo en cuenta:

- El avance natural de cada grado al siguiente.
- Los estudiantes que cambian de escuela al pasar a un nuevo nivel.
- Los estudiantes de grado 11 que egresan.
- Los nuevos estudiantes que ingresan a K4.
- La distribución de estudiantes en grupos de máximo 25.

---

## Estructura de escuelas y grados

```
Preschool      →  K4 · K5 · K6
Elementary     →  1° · 2° · 3°
Middle         →  4° · 5°
Upper Middle   →  6° · 7° · 8°
High           →  9° · 10° · 11°
```

### Transiciones entre escuelas

| Grado actual | Pasa a | Nueva escuela |
|---|---|---|
| K6 | 1° | Elementary |
| 3° | 4° | Middle |
| 5° | 6° | Upper Middle |
| 8° | 9° | High |
| 11° | — | Egresa |

---

## Funcionalidades

### Ingreso de datos
- Registro de estudiantes por grupo, por grado y por sede.
- Soporte para múltiples grupos por grado (G1, G2, G3...).
- Soporte para múltiples sedes.
- Nombre de sede editable.

### Proyección automática
- Calcula el número de estudiantes proyectados para cada grado.
- Distribuye automáticamente los estudiantes en grupos de máximo **25 estudiantes**.
- El número de nuevos estudiantes K4 es configurable.

### Informes
| Informe | Descripción |
|---|---|
| **Por Sede** | Comparativo actual vs proyectado para una sede seleccionada |
| **Por Escuela** | Vista de todas las sedes con sus escuelas |
| **General** | Consolidado total con variaciones por grado y escuela |

---

## Instalación

### Requisitos
- Node.js 18 o superior
- npm 9 o superior

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/cervantes1206/proyeccion_escuelas_csjv.git
cd proyeccion_escuelas_csjv

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir en el navegador: [http://localhost:5173](http://localhost:5173)

### Build para producción

```bash
npm run build
npm run preview
```

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Interfaz de usuario |
| Vite | 8 | Bundler y servidor de desarrollo |
| CSS puro | — | Estilos sin dependencias externas |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── GeneralReport.jsx   # Informe general consolidado
│   ├── GradeRow.jsx        # Fila de grado con grupos editables
│   ├── SchoolTable.jsx     # Tabla de una escuela
│   ├── SedePanel.jsx       # Panel de una sede con tabs por escuela
│   └── SedeReport.jsx      # Informe comparativo por sede
├── data/
│   └── initialData.js      # Constantes: grados, escuelas, transiciones
├── styles/
│   └── app.css             # Estilos globales
├── utils/
│   └── projection.js       # Lógica de proyección y cálculo de grupos
└── App.jsx                 # Componente raíz y navegación
```

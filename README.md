# Proyección Escolar CSJV

Aplicación web para proyectar la matrícula escolar del año siguiente, con informes por sede, por escuela y general.

## Estructura de escuelas

| Escuela | Grados |
|---|---|
| Preschool | K4, K5, K6 |
| Elementary | 1°, 2°, 3° |
| Middle | 4°, 5° |
| Upper Middle | 6°, 7°, 8° |
| High | 9°, 10°, 11° |

## Lógica de proyección

- Cada grado avanza automáticamente al siguiente año lectivo.
- **Grados que cambian de escuela:** K6 → Elementary, 3° → Middle, 5° → Upper Middle, 8° → High.
- **Grado 11°** egresa del sistema (no se proyecta).
- **Nuevos estudiantes** ingresan en K4 con un máximo de 25 por grupo.
- Los grupos se calculan automáticamente distribuyendo el total entre grupos de máximo 25 estudiantes.

## Vistas disponibles

1. **Ingreso de Datos** — Registra estudiantes por grupo para cada grado y sede. Permite agregar múltiples grupos por grado y múltiples sedes.
2. **Informe por Sede** — Comparativo lado a lado entre la matrícula actual y la proyectada para una sede seleccionada.
3. **Informe por Escuela** — Vista de todas las sedes con sus escuelas actuales y proyectadas.
4. **Informe General** — Tabla consolidada de todas las sedes con variaciones (+ / −) por grado y tipo de escuela.

## Instalación y uso

```bash
npm install
npm run dev
```

Abrir en el navegador: `http://localhost:5173`

### Build para producción

```bash
npm run build
npm run preview
```

## Stack tecnológico

- **React 19** — Interfaz de usuario
- **Vite 8** — Bundler y servidor de desarrollo
- **CSS puro** — Sin dependencias de UI externas

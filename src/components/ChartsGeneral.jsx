import { SchoolCompareChart, SchoolPieChart, VariationChart, GradeCompareChart } from './Charts';

export default function ChartsGeneral({ currentSedes, projectedSedes, currentYear, projectedYear }) {
  return (
    <div className="charts-grid">
      <SchoolCompareChart currentSedes={currentSedes} projectedSedes={projectedSedes} currentYear={currentYear} projectedYear={projectedYear} />
      <SchoolPieChart sedes={currentSedes} year={currentYear} label="Distribución actual" />
      <SchoolPieChart sedes={projectedSedes} year={projectedYear} label="Distribución proyectada" />
      <VariationChart currentSedes={currentSedes} projectedSedes={projectedSedes} currentYear={currentYear} projectedYear={projectedYear} />
      <GradeCompareChart currentSedes={currentSedes} projectedSedes={projectedSedes} currentYear={currentYear} projectedYear={projectedYear} />
    </div>
  );
}

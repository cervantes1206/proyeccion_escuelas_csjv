import { SedeSchoolChart, SedeGradeChart } from './Charts';

export default function ChartsSede({ currentSede, projectedSede, currentYear, projectedYear }) {
  return (
    <div className="charts-grid">
      <SedeSchoolChart currentSede={currentSede} projectedSede={projectedSede} currentYear={currentYear} projectedYear={projectedYear} />
      <SedeGradeChart currentSede={currentSede} projectedSede={projectedSede} currentYear={currentYear} projectedYear={projectedYear} />
    </div>
  );
}

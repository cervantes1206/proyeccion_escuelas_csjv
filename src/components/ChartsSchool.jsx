import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList, Cell,
} from 'recharts';
import { GRADES_BY_SCHOOL, GRADE_LABELS } from '../data/initialData';
import { aggregateBySchool, sedeStats } from '../utils/projection';

const COLOR_CURRENT = '#94a3b8';
const COLOR_PROJECTED = '#2563eb';

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.82rem',
};

export default function ChartsSchool({ schoolType, color, currentSedes, projectedSedes, currentYear, projectedYear }) {
  const grades = GRADES_BY_SCHOOL[schoolType];

  // Bar chart: students per grade (current vs projected)
  const current = aggregateBySchool(currentSedes);
  const projected = aggregateBySchool(projectedSedes);

  const gradeData = grades.map((grade) => ({
    name: GRADE_LABELS[grade],
    [currentYear]: current[schoolType]?.[grade]?.total || 0,
    [projectedYear]: projected[schoolType]?.[grade]?.total || 0,
  }));

  // Bar chart: students per sede for this school type
  const sedeData = currentSedes.map((sede, i) => {
    const curStats = sedeStats(sede);
    const projStats = sedeStats(projectedSedes[i]);
    return {
      name: sede.name,
      [currentYear]: curStats[schoolType]?._total || 0,
      [projectedYear]: projStats[schoolType]?._total || 0,
    };
  });

  // Variation per grade
  const varData = grades.map((grade) => {
    const cur = current[schoolType]?.[grade]?.total || 0;
    const proj = projected[schoolType]?.[grade]?.total || 0;
    return { name: GRADE_LABELS[grade], Variación: proj - cur };
  });

  return (
    <div className="charts-grid" style={{ marginBottom: '1rem' }}>
      <div className="chart-card">
        <h4 className="chart-title">Estudiantes por Grado</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={gradeData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={currentYear} fill={COLOR_CURRENT} radius={[4, 4, 0, 0]} />
            <Bar dataKey={projectedYear} fill={color} radius={[4, 4, 0, 0]}>
              <LabelList dataKey={projectedYear} position="top" style={{ fontSize: 10, fill: '#374151' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h4 className="chart-title">Estudiantes por Sede</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={sedeData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={currentYear} fill={COLOR_CURRENT} radius={[4, 4, 0, 0]} />
            <Bar dataKey={projectedYear} fill={color} radius={[4, 4, 0, 0]}>
              <LabelList dataKey={projectedYear} position="top" style={{ fontSize: 10, fill: '#374151' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h4 className="chart-title">Variación por Grado</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={varData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="Variación" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="Variación" position="top" style={{ fontSize: 11, fontWeight: 700 }}
                formatter={(v) => v >= 0 ? `+${v}` : `${v}`} />
              {varData.map((entry, i) => (
                <Cell key={i} fill={entry.Variación >= 0 ? '#059669' : '#dc2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

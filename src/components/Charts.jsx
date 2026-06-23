import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList,
} from 'recharts';
import { GRADES_BY_SCHOOL, GRADE_LABELS } from '../data/initialData';
import { sedeStats, aggregateBySchool, grandTotal } from '../utils/projection';

const SCHOOL_COLORS = {
  Preschool: '#7c3aed',
  Elementary: '#2563eb',
  Middle: '#059669',
  'Upper Middle': '#d97706',
  High: '#dc2626',
};

const COLOR_CURRENT = '#94a3b8';
const COLOR_PROJECTED = '#2563eb';

const SCHOOL_ORDER = ['Preschool', 'Elementary', 'Middle', 'Upper Middle', 'High'];

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.82rem',
};

// ── Bar: current vs projected by school type ──────────────────────
export function SchoolCompareChart({ currentSedes, projectedSedes, currentYear, projectedYear }) {
  const current = aggregateBySchool(currentSedes);
  const projected = aggregateBySchool(projectedSedes);

  const data = SCHOOL_ORDER.map((s) => ({
    name: s,
    [currentYear]: current[s]?._total || 0,
    [projectedYear]: projected[s]?._total || 0,
  }));

  return (
    <div className="chart-card">
      <h4 className="chart-title">Estudiantes por Escuela</h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={currentYear} fill={COLOR_CURRENT} radius={[4, 4, 0, 0]} />
          <Bar dataKey={projectedYear} fill={COLOR_PROJECTED} radius={[4, 4, 0, 0]}>
            <LabelList dataKey={projectedYear} position="top" style={{ fontSize: 10, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Bar: current vs projected by grade (all) ─────────────────────
export function GradeCompareChart({ currentSedes, projectedSedes, currentYear, projectedYear }) {
  const current = aggregateBySchool(currentSedes);
  const projected = aggregateBySchool(projectedSedes);

  const data = SCHOOL_ORDER.flatMap((school) =>
    GRADES_BY_SCHOOL[school].map((grade) => ({
      name: GRADE_LABELS[grade],
      school,
      [currentYear]: current[school]?.[grade]?.total || 0,
      [projectedYear]: projected[school]?.[grade]?.total || 0,
    }))
  );

  const CustomBar = (props) => {
    const { x, y, width, height, school } = props;
    return <rect x={x} y={y} width={width} height={height} fill={SCHOOL_COLORS[school]} rx={2} />;
  };

  return (
    <div className="chart-card chart-card--wide">
      <h4 className="chart-title">Estudiantes por Grado</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [value, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={currentYear} fill={COLOR_CURRENT} radius={[3, 3, 0, 0]} />
          <Bar dataKey={projectedYear} fill={COLOR_PROJECTED} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Pie: distribution by school type ─────────────────────────────
export function SchoolPieChart({ sedes, year, label }) {
  const agg = aggregateBySchool(sedes);
  const data = SCHOOL_ORDER
    .map((s) => ({ name: s, value: agg[s]?._total || 0 }))
    .filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {(percent * 100).toFixed(0)}%
      </text>
    ) : null;
  };

  return (
    <div className="chart-card">
      <h4 className="chart-title">{label} — Distribución {year}</h4>
      <p className="chart-subtitle">{total.toLocaleString()} estudiantes</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={SCHOOL_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Line: variation trend per school ─────────────────────────────
export function VariationChart({ currentSedes, projectedSedes, currentYear, projectedYear }) {
  const current = aggregateBySchool(currentSedes);
  const projected = aggregateBySchool(projectedSedes);

  const data = SCHOOL_ORDER.map((s) => {
    const cur = current[s]?._total || 0;
    const proj = projected[s]?._total || 0;
    return { name: s, Variación: proj - cur, Actual: cur, Proyectado: proj };
  });

  const CustomDot = (props) => {
    const { cx, cy, value } = props;
    return <circle cx={cx} cy={cy} r={5} fill={value >= 0 ? '#059669' : '#dc2626'} stroke="white" strokeWidth={2} />;
  };

  return (
    <div className="chart-card">
      <h4 className="chart-title">Variación por Escuela ({currentYear} → {projectedYear})</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="Variación" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="Variación" position="top" style={{ fontSize: 11, fontWeight: 700 }}
              formatter={(v) => v >= 0 ? `+${v}` : `${v}`} />
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.Variación >= 0 ? '#059669' : '#dc2626'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sede charts (single sede) ─────────────────────────────────────
export function SedeSchoolChart({ currentSede, projectedSede, currentYear, projectedYear }) {
  const current = sedeStats(currentSede);
  const projected = sedeStats(projectedSede);

  const data = SCHOOL_ORDER.map((s) => ({
    name: s,
    [currentYear]: current[s]?._total || 0,
    [projectedYear]: projected[s]?._total || 0,
  }));

  return (
    <div className="chart-card">
      <h4 className="chart-title">Por Escuela — {currentSede.name}</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={currentYear} fill={COLOR_CURRENT} radius={[4, 4, 0, 0]} />
          <Bar dataKey={projectedYear} fill={COLOR_PROJECTED} radius={[4, 4, 0, 0]}>
            <LabelList dataKey={projectedYear} position="top" style={{ fontSize: 10, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SedeGradeChart({ currentSede, projectedSede, currentYear, projectedYear }) {
  const current = sedeStats(currentSede);
  const projected = sedeStats(projectedSede);

  const data = SCHOOL_ORDER.flatMap((school) =>
    GRADES_BY_SCHOOL[school].map((grade) => ({
      name: GRADE_LABELS[grade],
      school,
      [currentYear]: current[school]?.[grade]?.total || 0,
      [projectedYear]: projected[school]?.[grade]?.total || 0,
    }))
  );

  return (
    <div className="chart-card chart-card--wide">
      <h4 className="chart-title">Por Grado — {currentSede.name}</h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={currentYear} fill={COLOR_CURRENT} radius={[3, 3, 0, 0]} />
          <Bar dataKey={projectedYear} fill={COLOR_PROJECTED} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ReactElement } from "react";
import type { ChartSpec } from "@/lib/analytics/chartSpec";

const COLORS = ["#0e7c6b", "#f2a310", "#d33a2c", "#3949ab", "#c97d00", "#8a9690"];
const GRID = "#e5dcc9";

function renderChart(spec: ChartSpec): ReactElement {
  if (spec.type === "pie") {
    return (
      <PieChart>
        <Pie data={spec.data} dataKey="value" nameKey="name" outerRadius={88} label>
          {spec.data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  }

  const series = spec.series ?? [];
  const axes = [
    <CartesianGrid key="g" strokeDasharray="3 3" stroke={GRID} />,
    <XAxis key="x" dataKey={spec.xKey} tick={{ fontSize: 11 }} />,
    <YAxis key="y" tick={{ fontSize: 11 }} allowDecimals={false} />,
    <Tooltip key="t" />,
    series.length > 1 ? <Legend key="l" /> : null,
  ];

  if (spec.type === "line") {
    return (
      <LineChart data={spec.data}>
        {axes}
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    );
  }
  if (spec.type === "area") {
    return (
      <AreaChart data={spec.data}>
        {axes}
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.18} />
        ))}
      </AreaChart>
    );
  }
  return (
    <BarChart data={spec.data}>
      {axes}
      {series.map((s, i) => (
        <Bar key={s.key} dataKey={s.key} name={s.label} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
      ))}
    </BarChart>
  );
}

export function ChartRenderer({ spec }: { spec: ChartSpec }) {
  return (
    <figure className="achart">
      <figcaption>{spec.title}</figcaption>
      <div className="achart-box">
        <ResponsiveContainer width="100%" height={240}>
          {renderChart(spec)}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

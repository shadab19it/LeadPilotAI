'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { CHART_COLORS } from '@/lib/utils';

// ─── Custom Tooltip ───────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <div className="text-[var(--text-secondary)] mb-1">{label || payload[0]?.name}</div>
      <div className="font-semibold text-[var(--text-primary)]">{payload[0]?.value}</div>
    </div>
  );
}

// ─── Tech Breakdown Chart ─────────────────────

interface TechChartProps {
  data: Array<{ name: string; count: number }>;
}

export function TechBreakdownChart({ data }: TechChartProps) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-sm">
        No technology data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
          {data.slice(0, 10).map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Source Breakdown Pie Chart ───────────────

interface SourceChartProps {
  data: Array<{ source: string; count: number }>;
}

export function SourceBreakdownChart({ data }: SourceChartProps) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-sm">
        No source data yet
      </div>
    );
  }

  const pieData = data.map((d) => ({ name: d.source, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Status Breakdown Chart ───────────────────

interface StatusChartProps {
  data: Array<{ status: string; count: number }>;
}

const STATUS_CHART_COLORS: Record<string, string> = {
  New: '#3b82f6',
  Qualified: '#8b5cf6',
  Contacted: '#f59e0b',
  'Follow Up': '#f97316',
  Interested: '#10b981',
  Meeting: '#06b6d4',
  Client: '#22c55e',
  Rejected: '#ef4444',
};

export function StatusBreakdownChart({ data }: StatusChartProps) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-sm">
        No status data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 0, bottom: 24 }}>
        <XAxis
          dataKey="status"
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] || '#475569'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Score Distribution Chart ─────────────────

interface ScoreDistChartProps {
  data: Array<{ range: string; count: number }>;
}

export function ScoreDistributionChart({ data }: ScoreDistChartProps) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-sm">
        No score data yet
      </div>
    );
  }

  const SCORE_COLORS = ['#475569', '#475569', '#6b7280', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
        <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {data.map((_, i) => (
            <Cell key={i} fill={SCORE_COLORS[i] || '#475569'} fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

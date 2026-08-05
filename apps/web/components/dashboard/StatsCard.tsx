'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  highlight?: boolean;
}

export function StatsCard({ title, value, subtitle, icon, iconBg, trend, highlight }: StatsCardProps) {
  return (
    <div
      className="glass-card p-5 flex flex-col gap-4 animate-fade-slide-up"
      style={highlight ? { borderColor: 'rgba(59,130,246,0.3)', boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1)' } : {}}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg || 'var(--accent-blue-dim)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          {icon}
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              color: trend.value >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)',
              background: trend.value >= 0 ? 'var(--accent-emerald-dim)' : 'var(--accent-red-dim)',
            }}
          >
            {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <div className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</div>}
        {trend && <div className="text-xs text-[var(--text-muted)] mt-1">{trend.label}</div>}
      </div>
    </div>
  );
}

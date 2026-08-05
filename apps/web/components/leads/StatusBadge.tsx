'use client';

import { STATUS_COLORS, STATUS_BG } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || '#475569';
  const bg = STATUS_BG[status] || 'rgba(71,85,105,0.12)';
  const padding = size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.625rem';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap"
      style={{ color, background: bg, padding, fontSize, border: `1px solid ${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {status}
    </span>
  );
}

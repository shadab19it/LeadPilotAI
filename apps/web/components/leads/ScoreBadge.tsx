'use client';

import { getScoreColor, getScoreLabel } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'md', showLabel = false }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const sizes = {
    sm: { outer: 36, stroke: 3, fontSize: '10px', gap: '0.375rem' },
    md: { outer: 48, stroke: 3.5, fontSize: '13px', gap: '0.5rem' },
    lg: { outer: 64, stroke: 4, fontSize: '16px', gap: '0.75rem' },
  };

  const { outer, stroke, fontSize } = sizes[size];
  const radius = (outer - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-shrink-0" style={{ width: outer, height: outer }}>
        <svg width={outer} height={outer} className="rotate-[-90deg]">
          {/* Background ring */}
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.1)"
            strokeWidth={stroke}
          />
          {/* Score ring */}
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}80)`, transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ fontSize, color }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}

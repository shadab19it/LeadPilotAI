import type { ScoreTier } from '@leadpilot/types';

// ─── Score Utilities ─────────────────────────

export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) return 'hot';
  if (score >= 70) return 'warm';
  return 'low';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#ef4444';
  if (score >= 70) return '#f59e0b';
  return '#475569';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return '🔥 Hot';
  if (score >= 70) return '🌡️ Warm';
  return '❄️ Low';
}

// ─── Status Utilities ────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  New: '#3b82f6',
  Qualified: '#8b5cf6',
  Contacted: '#f59e0b',
  'Follow Up': '#f97316',
  Interested: '#10b981',
  Meeting: '#06b6d4',
  Client: '#22c55e',
  Rejected: '#ef4444',
};

export const STATUS_BG: Record<string, string> = {
  New: 'rgba(59,130,246,0.12)',
  Qualified: 'rgba(139,92,246,0.12)',
  Contacted: 'rgba(245,158,11,0.12)',
  'Follow Up': 'rgba(249,115,22,0.12)',
  Interested: 'rgba(16,185,129,0.12)',
  Meeting: 'rgba(6,182,212,0.12)',
  Client: 'rgba(34,197,94,0.12)',
  Rejected: 'rgba(239,68,68,0.12)',
};

export const OUTREACH_LABELS: Record<string, string> = {
  linkedin_connection: 'LinkedIn Connection',
  linkedin_followup: 'LinkedIn Follow-up',
  cold_email: 'Cold Email',
  followup_email: 'Follow-up Email',
  contact_form: 'Contact Form',
  discovery_call: 'Discovery Call Script',
};

export const OUTREACH_ICONS: Record<string, string> = {
  linkedin_connection: '🔗',
  linkedin_followup: '↩️',
  cold_email: '📧',
  followup_email: '📬',
  contact_form: '📝',
  discovery_call: '📞',
};

// ─── Date Utilities ──────────────────────────

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// ─── String Utilities ────────────────────────

export function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function teamSizeToNum(teamSize: string): number {
  if (!teamSize) return 0;
  const num = parseInt(teamSize.replace(/[^0-9]/g, ''));
  return isNaN(num) ? 0 : num;
}

// ─── Number Utilities ────────────────────────

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ─── Colors ──────────────────────────────────

export const CHART_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#6366f1', '#14b8a6', '#a855f7',
];

export const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: '#0a66c2',
  Clutch: '#ef4444',
  GoodFirms: '#3b82f6',
  GitHub: '#f9f9f9',
  'Product Hunt': '#f97316',
  YC: '#f59e0b',
  Wellfound: '#10b981',
  Manual: '#8b5cf6',
  Google: '#06b6d4',
};

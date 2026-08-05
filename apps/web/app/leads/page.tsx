'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Lead, LeadStatus, LeadSource } from '@leadpilot/types';
import { getLeads } from '@/lib/api';
import { LeadTable } from '@/components/leads/LeadTable';
import { getExportUrl } from '@/lib/api';
import {
  Search, Filter, SlidersHorizontal, Download, RefreshCw,
  ChevronLeft, ChevronRight, X, Flame, Thermometer, Snowflake,
} from 'lucide-react';

const STATUSES: LeadStatus[] = ['New', 'Qualified', 'Contacted', 'Follow Up', 'Interested', 'Meeting', 'Client', 'Rejected'];
const SOURCES: LeadSource[] = ['Clutch', 'GoodFirms', 'GitHub', 'Product Hunt', 'YC', 'Wellfound', 'Google', 'Manual'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [scoreTier, setScoreTier] = useState<'' | 'hot' | 'warm' | 'low'>('');
  const [hiringOnly, setHiringOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'createdAt'>('score');

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const minScore = scoreTier === 'hot' ? 90 : scoreTier === 'warm' ? 70 : undefined;
      const maxScore = scoreTier === 'warm' ? 89 : scoreTier === 'low' ? 69 : undefined;

      const res = await getLeads({
        search: search || undefined,
        status: statusFilter as LeadStatus || undefined,
        source: sourceFilter as LeadSource || undefined,
        minScore,
        maxScore,
        hiringOnly: hiringOnly || undefined,
        page,
        limit: 25,
        sortBy,
        sortOrder: 'desc',
      });
      setLeads(res.data);
      setTotalPages(res.pagination.pages);
      setTotal(res.pagination.total);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sourceFilter, scoreTier, hiringOnly, page, sortBy]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, sourceFilter, scoreTier, hiringOnly, sortBy]);

  const activeFilterCount = [search, statusFilter, sourceFilter, scoreTier, hiringOnly].filter(Boolean).length;

  const handleLeadUpdated = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
  };

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Lead Intelligence</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {total.toLocaleString()} leads found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLeads} className="btn-ghost text-xs" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <a href={getExportUrl('csv')} className="btn-secondary text-xs" download>
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search companies, industries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input-base w-auto text-sm"
          >
            <option value="score">Sort: Score</option>
            <option value="createdAt">Sort: Date Added</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary text-xs ${activeFilterCount > 0 ? 'glow-border-blue' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'var(--accent-blue)', color: 'white' }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setSourceFilter(''); setScoreTier(''); setHiringOnly(false); }}
              className="btn-ghost text-xs text-red-400"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-[var(--border)] animate-fade-slide-up">
            {/* Score Tier */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--text-muted)] mr-1">Score:</span>
              {[
                { value: '', label: 'All' },
                { value: 'hot', label: '🔥 Hot 90+', color: '#ef4444' },
                { value: 'warm', label: '🌡️ Warm 70-89', color: '#f59e0b' },
                { value: 'low', label: '❄️ Low <70', color: '#475569' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setScoreTier(value as any)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: scoreTier === value ? (color ? `${color}20` : 'var(--accent-blue-dim)') : 'var(--bg-secondary)',
                    color: scoreTier === value ? (color || 'var(--accent-blue)') : 'var(--text-muted)',
                    border: `1px solid ${scoreTier === value ? (color ? `${color}50` : 'var(--border-accent)') : 'var(--border)'}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Status */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base w-auto text-xs">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Source */}
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="input-base w-auto text-xs">
              <option value="">All Sources</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Hiring */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hiringOnly}
                onChange={(e) => setHiringOnly(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <span className="text-xs text-[var(--text-secondary)]">Hiring Only</span>
            </label>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <LeadTable leads={leads} onLeadUpdated={handleLeadUpdated} isLoading={isLoading} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages} · {total.toLocaleString()} leads
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: page === p ? 'var(--accent-blue)' : 'var(--bg-card)',
                    color: page === p ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { Lead } from '@leadpilot/types';
import { getLeads } from '@/lib/api';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { RefreshCw, Kanban, Filter, Download } from 'lucide-react';
import { getExportUrl } from '@/lib/api';

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await getLeads({
        limit: 200,
        sortBy: 'score',
        sortOrder: 'desc',
        minScore: minScore || undefined,
      });
      setLeads(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [minScore]);

  const handleLeadUpdated = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
  };

  const counts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-400" /> CRM Pipeline
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {leads.length} leads · Drag cards between columns to update status
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Score Filter */}
          <div className="flex items-center gap-2 glass-card px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-transparent text-xs text-[var(--text-primary)] outline-none"
            >
              <option value={0}>All</option>
              <option value={70}>70+ (Warm)</option>
              <option value={90}>90+ (Hot)</option>
            </select>
          </div>
          <button onClick={fetchLeads} className="btn-ghost text-xs" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <a href={getExportUrl('csv')} className="btn-secondary text-xs" download>
            <Download className="w-4 h-4" /> Export
          </a>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="flex gap-3 flex-wrap">
        {[
          { status: 'New', color: '#3b82f6' },
          { status: 'Interested', color: '#10b981' },
          { status: 'Meeting', color: '#06b6d4' },
          { status: 'Client', color: '#22c55e' },
        ].map(({ status, color }) => (
          <div key={status} className="flex items-center gap-2 glass-card px-3 py-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-[var(--text-secondary)]">{status}</span>
            <span className="text-sm font-bold tabular-nums" style={{ color }}>
              {counts[status] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Loading pipeline...</p>
          </div>
        </div>
      ) : (
        <KanbanBoard leads={leads} onLeadUpdated={handleLeadUpdated} />
      )}
    </div>
  );
}

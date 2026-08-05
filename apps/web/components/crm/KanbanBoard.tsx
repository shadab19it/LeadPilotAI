'use client';

import { useState, useCallback } from 'react';
import type { Lead, LeadStatus } from '@leadpilot/types';
import { StatusBadge } from '@/components/leads/StatusBadge';
import { ScoreBadge } from '@/components/leads/ScoreBadge';
import { updateLeadStatus } from '@/lib/api';
import { formatRelativeDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { GripVertical, Flame, Thermometer, Snowflake, ExternalLink } from 'lucide-react';

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'New', label: 'New', color: '#3b82f6' },
  { status: 'Qualified', label: 'Qualified', color: '#8b5cf6' },
  { status: 'Contacted', label: 'Contacted', color: '#f59e0b' },
  { status: 'Follow Up', label: 'Follow Up', color: '#f97316' },
  { status: 'Interested', label: 'Interested', color: '#10b981' },
  { status: 'Meeting', label: 'Meeting', color: '#06b6d4' },
  { status: 'Client', label: 'Client ✓', color: '#22c55e' },
  { status: 'Rejected', label: 'Rejected', color: '#ef4444' },
];

interface KanbanBoardProps {
  leads: Lead[];
  onLeadUpdated?: (lead: Lead) => void;
}

function KanbanCard({ lead, onStatusChange }: { lead: Lead; onStatusChange: (status: LeadStatus) => void }) {
  const score = lead.score?.overall || 0;
  const ScoreIcon = score >= 90 ? Flame : score >= 70 ? Thermometer : Snowflake;
  const scoreColor = score >= 90 ? '#ef4444' : score >= 70 ? '#f59e0b' : '#475569';

  return (
    <div
      className="glass-card p-3 cursor-pointer hover:border-[var(--border-hover)] transition-all hover:-translate-y-0.5 group"
      style={{ fontSize: '13px' }}
    >
      {/* Company */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <Link href={`/leads/${lead._id}`} className="font-semibold text-[var(--text-primary)] hover:text-blue-400 transition-colors block truncate">
            {lead.company.name}
          </Link>
          <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {truncate(lead.company.website?.replace(/^https?:\/\//, '') || '', 28)}
          </div>
        </div>
        <ScoreIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: scoreColor }} />
      </div>

      {/* Score + Country */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold tabular-nums" style={{ color: scoreColor }}>
          {score}/100
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {lead.company.country || '—'} · {lead.company.teamSize || '?'}
        </span>
      </div>

      {/* Tech chips */}
      {lead.company.techStack?.detected?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {lead.company.techStack.detected.slice(0, 2).map((tech) => (
            <span key={tech} className="tech-chip" style={{ fontSize: '10px', padding: '1px 6px' }}>{tech}</span>
          ))}
          {lead.company.techStack.detected.length > 2 && (
            <span className="tech-chip" style={{ fontSize: '10px', padding: '1px 6px' }}>
              +{lead.company.techStack.detected.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <span className="text-[10px] text-[var(--text-muted)]">{formatRelativeDate(lead.createdAt)}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/leads/${lead._id}`} className="p-1 rounded hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-blue-400 transition-colors">
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ leads, onLeadUpdated }: KanbanBoardProps) {
  const [localLeads, setLocalLeads] = useState(leads);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const getColumnLeads = (status: LeadStatus) =>
    localLeads.filter((l) => l.status === status);

  const handleDragStart = (leadId: string) => setDragging(leadId);
  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOver(status);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, status: LeadStatus) => {
      e.preventDefault();
      if (!dragging) return;
      setDragOver(null);

      const lead = localLeads.find((l) => l._id === dragging);
      if (!lead || lead.status === status) { setDragging(null); return; }

      // Optimistic update
      setLocalLeads((prev) =>
        prev.map((l) => (l._id === dragging ? { ...l, status } : l))
      );
      setDragging(null);

      try {
        const updated = await updateLeadStatus(lead._id!, status);
        onLeadUpdated?.(updated);
      } catch {
        // Revert on error
        setLocalLeads((prev) =>
          prev.map((l) => (l._id === lead._id ? { ...l, status: lead.status } : l))
        );
      }
    },
    [dragging, localLeads, onLeadUpdated]
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
        {COLUMNS.map(({ status, label, color }) => {
          const colLeads = getColumnLeads(status);
          const isDragTarget = dragOver === status;

          return (
            <div
              key={status}
              className="kanban-col transition-all"
              style={{
                minWidth: 220,
                maxWidth: 240,
                borderColor: isDragTarget ? color : 'var(--border)',
                boxShadow: isDragTarget ? `0 0 0 2px ${color}40, 0 0 20px ${color}20` : undefined,
              }}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                </div>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{ color, background: `${color}18` }}
                >
                  {colLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colLeads.map((lead) => (
                  <div
                    key={lead._id}
                    draggable
                    onDragStart={() => handleDragStart(lead._id!)}
                    onDragEnd={() => setDragging(null)}
                    style={{ opacity: dragging === lead._id ? 0.4 : 1, transition: 'opacity 0.15s' }}
                  >
                    <KanbanCard
                      lead={lead}
                      onStatusChange={async (newStatus) => {
                        if (!lead._id) return;
                        const updated = await updateLeadStatus(lead._id, newStatus);
                        setLocalLeads((prev) =>
                          prev.map((l) => (l._id === lead._id ? { ...l, status: newStatus } : l))
                        );
                        onLeadUpdated?.(updated);
                      }}
                    />
                  </div>
                ))}
                {colLeads.length === 0 && (
                  <div
                    className="text-center text-xs text-[var(--text-muted)] py-8 rounded-lg border border-dashed border-[var(--border)]"
                    style={{ borderStyle: isDragTarget ? 'solid' : 'dashed', borderColor: isDragTarget ? color : undefined }}
                  >
                    {isDragTarget ? '↓ Drop here' : 'Empty'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lead, LeadStatus } from '@leadpilot/types';
import { ScoreBadge } from './ScoreBadge';
import { StatusBadge } from './StatusBadge';
import { formatRelativeDate, truncate } from '@/lib/utils';
import { updateLeadStatus } from '@/lib/api';
import {
  ExternalLink, Globe, MapPin, Users, Briefcase,
  ChevronUp, ChevronDown, Flame, Star, Building2, Laptop
} from 'lucide-react';

const ALL_STATUSES: LeadStatus[] = [
  'New', 'Qualified', 'Contacted', 'Follow Up', 'Interested', 'Meeting', 'Client', 'Rejected',
];

interface LeadTableProps {
  leads: Lead[];
  onLeadUpdated?: (lead: Lead) => void;
  isLoading?: boolean;
}

export function LeadTable({ leads, onLeadUpdated, isLoading }: LeadTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'score' | 'name' | 'createdAt'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    if (!lead._id) return;
    setUpdatingId(lead._id);
    try {
      const updated = await updateLeadStatus(lead._id, status);
      onLeadUpdated?.(updated);
    } finally {
      setUpdatingId(null);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-lg" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: 'var(--accent-blue-dim)', border: '1px solid var(--border-accent)' }}>
          <Building2 className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">No leads found</h3>
        <p className="text-sm text-[var(--text-muted)]">Try adjusting your filters or run a discovery job</p>
        <Link href="/discover" className="btn-primary mt-4 text-sm">
          <Star className="w-4 h-4" /> Discover Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>
              <button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={() => handleSort('score')}>
                Score <SortIcon field="score" />
              </button>
            </th>
            <th>
              <button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={() => handleSort('name')}>
                Company <SortIcon field="name" />
              </button>
            </th>
            <th>Industry</th>
            <th>Team</th>
            <th>Country</th>
            <th>Technologies</th>
            <th>Source</th>
            <th>Status</th>
            <th>Added</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr
              key={lead._id || idx}
              className="group animate-fade-slide-up"
              style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
            >
              <td>
                <ScoreBadge score={lead.score?.overall || 0} size="sm" />
              </td>
              <td>
                <div className="flex items-center gap-2 min-w-0">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                       style={{ background: `hsl(${(lead.company.name.charCodeAt(0) * 13) % 360}, 60%, 35%)` }}>
                    {lead.company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/leads/${lead._id}`}
                      className="font-semibold text-[var(--text-primary)] hover:text-blue-400 transition-colors block truncate max-w-[160px]"
                    >
                      {lead.company.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      {lead.company.website && (
                        <a
                          href={lead.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-muted)] hover:text-blue-400 transition-colors"
                          title={lead.company.website}
                        >
                          <Globe className="w-3 h-3" />
                        </a>
                      )}
                      <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">
                        {lead.company.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <Briefcase className="w-3 h-3 flex-shrink-0" />
                  {truncate(lead.company.industry || '—', 22)}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  {lead.company.teamSize || '—'}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {lead.company.country || '—'}
                </div>
              </td>
              <td>
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {lead.company.techStack?.detected?.slice(0, 3).map((tech) => (
                    <span key={tech} className="tech-chip">{tech}</span>
                  ))}
                  {(lead.company.techStack?.detected?.length || 0) > 3 && (
                    <span className="tech-chip">+{lead.company.techStack.detected.length - 3}</span>
                  )}
                </div>
              </td>
              <td>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {lead.source}
                </span>
              </td>
              <td>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                  disabled={updatingId === lead._id}
                  className="text-xs rounded-lg px-2 py-1 outline-none cursor-pointer transition-all border"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border)',
                    minWidth: '100px',
                  }}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="whitespace-nowrap">
                <span className="text-xs text-[var(--text-muted)]">
                  {formatRelativeDate(lead.createdAt)}
                </span>
              </td>
              <td>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/leads/${lead._id}`}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    title="View details"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </Link>
                  {lead.company.website && (
                    <a
                      href={lead.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                      title="Visit website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {lead.score?.overall >= 90 && (
                    <span title="Hot lead!">
                      <Flame className="w-4 h-4 text-red-400" />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

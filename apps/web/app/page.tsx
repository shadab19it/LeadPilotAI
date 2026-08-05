'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { DashboardStats, Lead } from '@leadpilot/types';
import { getDashboardStats } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TechBreakdownChart, SourceBreakdownChart, StatusBreakdownChart, ScoreDistributionChart } from '@/components/dashboard/Charts';
import { ScoreBadge } from '@/components/leads/ScoreBadge';
import { StatusBadge } from '@/components/leads/StatusBadge';
import { formatRelativeDate, truncate } from '@/lib/utils';
import {
  Users, Flame, Thermometer, Target, BarChart3,
  Compass, ArrowRight, Globe, Star, TrendingUp, Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
             style={{ background: 'var(--accent-red-dim)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <Zap className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">Connection Error</h2>
          <p className="text-sm text-[var(--text-muted)] mb-1">{error}</p>
          <p className="text-xs text-[var(--text-muted)]">Make sure the API is running at <code className="px-1 py-0.5 rounded text-xs" style={{background:'var(--bg-card)'}}>localhost:4000</code></p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-2xl">
      {/* Welcome Banner */}
      <div
        className="glass-card p-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)]">
              LeadPilot AI
            </span>
          </div>
          <h2 className="text-xl font-bold gradient-text">Welcome back!</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your pipeline has <strong className="text-[var(--text-primary)]">{stats?.hotLeads || 0} hot leads</strong> ready for outreach today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/discover" className="btn-primary">
            <Compass className="w-4 h-4" /> Discover Leads
          </Link>
          <Link href="/leads" className="btn-secondary">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
        <StatsCard
          title="Total Leads"
          value={stats?.totalLeads || 0}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          iconBg="var(--accent-blue-dim)"
          subtitle="All time"
        />
        <StatsCard
          title="New Today"
          value={stats?.newToday || 0}
          icon={<Star className="w-5 h-5 text-violet-400" />}
          iconBg="var(--accent-violet-dim)"
          subtitle="Added in last 24h"
          highlight={!!stats?.newToday}
        />
        <StatsCard
          title="Hot Leads 🔥"
          value={stats?.hotLeads || 0}
          icon={<Flame className="w-5 h-5 text-red-400" />}
          iconBg="var(--accent-red-dim)"
          subtitle="Score 90+"
          highlight={!!stats?.hotLeads}
        />
        <StatsCard
          title="Warm Leads"
          value={stats?.warmLeads || 0}
          icon={<Thermometer className="w-5 h-5 text-amber-400" />}
          iconBg="var(--accent-amber-dim)"
          subtitle="Score 70–89"
        />
        <StatsCard
          title="Avg Score"
          value={stats?.avgScore || 0}
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          iconBg="var(--accent-emerald-dim)"
          subtitle="Portfolio quality"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tech Breakdown */}
        <div className="glass-card p-5 lg:col-span-1">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'var(--accent-blue-dim)' }}>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Technology Stack</h3>
              <p className="text-xs text-[var(--text-muted)]">Most detected technologies</p>
            </div>
          </div>
          <TechBreakdownChart data={stats?.techBreakdown || []} />
        </div>

        {/* Source Breakdown */}
        <div className="glass-card p-5">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'var(--accent-violet-dim)' }}>
              <Globe className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Lead Sources</h3>
              <p className="text-xs text-[var(--text-muted)]">Where leads come from</p>
            </div>
          </div>
          <SourceBreakdownChart data={stats?.sourceBreakdown || []} />
        </div>

        {/* Status Breakdown */}
        <div className="glass-card p-5">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'var(--accent-emerald-dim)' }}>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pipeline Status</h3>
              <p className="text-xs text-[var(--text-muted)]">Leads by CRM stage</p>
            </div>
          </div>
          <StatusBreakdownChart data={stats?.statusBreakdown || []} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Leads */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Leads</h3>
            <Link href="/leads" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {stats?.recentLeads?.length ? (
              stats.recentLeads.map((lead: Lead) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                       style={{ background: `hsl(${(lead.company.name.charCodeAt(0) * 13) % 360}, 55%, 35%)` }}>
                    {lead.company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors truncate">
                        {lead.company.name}
                      </span>
                      <StatusBadge status={lead.status} size="sm" />
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      {truncate(lead.company.industry, 30)} · {lead.source}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ScoreBadge score={lead.score?.overall || 0} size="sm" />
                    <span className="text-xs text-[var(--text-muted)] hidden sm:block whitespace-nowrap">
                      {formatRelativeDate(lead.createdAt)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No leads yet</p>
                <Link href="/discover" className="btn-primary mt-3 inline-flex text-sm">
                  <Compass className="w-4 h-4" /> Start Discovering
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="glass-card p-5">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'var(--accent-amber-dim)' }}>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Score Distribution</h3>
              <p className="text-xs text-[var(--text-muted)]">Lead quality spread</p>
            </div>
          </div>
          <ScoreDistributionChart data={stats?.scoreDistribution || []} />

          {/* Country breakdown */}
          {stats?.countryBreakdown && stats.countryBreakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Top Countries</h4>
              <div className="space-y-2">
                {stats.countryBreakdown.slice(0, 5).map(({ country, count }) => (
                  <div key={country} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-secondary)] w-28 truncate">{country}</span>
                    <div className="flex-1 progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(count / (stats.countryBreakdown?.[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text-muted)] w-6 text-right tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

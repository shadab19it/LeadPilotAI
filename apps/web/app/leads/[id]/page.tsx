'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Lead, LeadStatus } from '@leadpilot/types';
import { getLead, analyzeLead, generateOutreach, updateLead, deleteLead } from '@/lib/api';
import { ScoreBadge } from '@/components/leads/ScoreBadge';
import { StatusBadge } from '@/components/leads/StatusBadge';
import { AIAnalysisPanel } from '@/components/ai/AIAnalysisPanel';
import { OutreachEditor } from '@/components/outreach/OutreachEditor';
import { formatDate, formatRelativeDate, OUTREACH_LABELS } from '@/lib/utils';
import {
  ArrowLeft, Globe, Linkedin, Github, Mail, Phone, MapPin,
  Users, Building2, Briefcase, Tag, Brain, MessageSquare,
  Trash2, Edit3, ExternalLink, ChevronDown, CheckCircle,
  Sparkles, Code2, Laptop, Star,
} from 'lucide-react';

const ALL_STATUSES: LeadStatus[] = ['New', 'Qualified', 'Contacted', 'Follow Up', 'Interested', 'Meeting', 'Client', 'Rejected'];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'outreach' | 'details'>('analysis');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    getLead(id)
      .then((data: Lead) => { setLead(data); setNotes(data.notes || ''); })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAnalyze = async () => {
    if (!id) return;
    setIsAnalyzing(true);
    try {
      const updated = await analyzeLead(id);
      setLead(updated);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!id) return;
    setIsGenerating(true);
    try {
      const drafts = await generateOutreach(id);
      setLead((prev) => prev ? { ...prev, outreachDrafts: drafts } : prev);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (!id || !lead) return;
    const updated = await updateLead(id, { status });
    setLead(updated);
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    await updateLead(id, { notes });
    setLead((prev) => prev ? { ...prev, notes } : prev);
    setEditingNotes(false);
  };

  const handleDelete = async () => {
    if (!id || !confirm(`Delete ${lead?.company.name}? This cannot be undone.`)) return;
    await deleteLead(id);
    router.push('/leads');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-screen-xl animate-pulse">
        <div className="skeleton h-10 w-48 rounded-lg" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-muted)]">Lead not found</p>
        <Link href="/leads" className="btn-primary mt-4 inline-flex">← Back to Leads</Link>
      </div>
    );
  }

  const { company, score, analysis, outreachDrafts, status, source, createdAt } = lead;

  return (
    <div className="space-y-5 max-w-screen-xl animate-fade-slide-up">
      {/* Back + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/leads" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="btn-secondary text-xs">
            <Brain className="w-4 h-4" /> {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </button>
          <button onClick={handleGenerateOutreach} disabled={isGenerating} className="btn-secondary text-xs">
            <Sparkles className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Outreach Drafts'}
          </button>
          <button onClick={handleDelete} className="btn-ghost text-xs text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.03))' }}>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Company Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
               style={{ background: `hsl(${(company.name.charCodeAt(0) * 13) % 360}, 55%, 35%)` }}>
            {company.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + Score */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{company.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <StatusBadge status={status} />
                  <span className="text-xs text-[var(--text-muted)]">via {source}</span>
                  <span className="text-xs text-[var(--text-muted)]">Added {formatRelativeDate(createdAt)}</span>
                </div>
              </div>
              <ScoreBadge score={score?.overall || 0} size="lg" showLabel />
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 mt-4">
              {company.country && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <MapPin className="w-4 h-4 text-blue-400" /> {company.country}
                </div>
              )}
              {company.teamSize && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <Users className="w-4 h-4 text-violet-400" /> {company.teamSize} employees
                </div>
              )}
              {company.industry && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> {company.industry}
                </div>
              )}
              {company.hiringStatus && (
                <div className="flex items-center gap-1.5 text-sm"
                     style={{ color: 'var(--accent-emerald)' }}>
                  <CheckCircle className="w-4 h-4" /> Actively Hiring
                </div>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {company.linkedInUrl && (
                <a href={company.linkedInUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {company.githubOrg && (
                <a href={company.githubOrg} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {company.publicEmail && (
                <a href={`mailto:${company.publicEmail}`} className="btn-secondary text-xs">
                  <Mail className="w-3.5 h-3.5" /> {company.publicEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Status change */}
        <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-[var(--text-muted)]">Move to:</span>
          {ALL_STATUSES.filter((s) => s !== status).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border hover:scale-105"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
            >
              → {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Company Details */}
        <div className="space-y-4">
          {/* Tech Stack */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-blue-400" /> Technology Stack
            </h3>
            {company.techStack?.detected?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {company.techStack.detected.map((tech) => (
                  <span key={tech} className="tech-chip">{tech}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No technologies detected</p>
            )}
          </div>

          {/* Services */}
          {company.services?.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-violet-400" /> Services
              </h3>
              <ul className="space-y-1.5">
                {company.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400" /> Score Breakdown
            </h3>
            <div className="space-y-2.5">
              {score?.breakdown && Object.entries(score.breakdown).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)] capitalize">{key}</span>
                    <span className="font-medium" style={{ color: val >= 70 ? 'var(--accent-emerald)' : val >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                      {val}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notes</h3>
              <button onClick={() => setEditingNotes(!editingNotes)} className="btn-ghost text-xs py-1 px-2">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="input-base text-sm resize-none"
                  placeholder="Add notes about this lead..."
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveNotes} className="btn-primary text-xs py-1 flex-1">Save</button>
                  <button onClick={() => setEditingNotes(false)} className="btn-secondary text-xs py-1">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {notes || <span className="text-[var(--text-muted)] italic">No notes yet. Click edit to add.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Right: Tabs (Analysis + Outreach) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Nav */}
          <div className="flex gap-1 glass-card p-1">
            {[
              { key: 'analysis', label: 'AI Analysis', icon: Brain },
              { key: 'outreach', label: `Outreach (${outreachDrafts?.length || 0})`, icon: MessageSquare },
              { key: 'details', label: 'Details', icon: Building2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === key ? 'var(--accent-blue-dim)' : 'transparent',
                  color: activeTab === key ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  border: activeTab === key ? '1px solid var(--border-accent)' : '1px solid transparent',
                }}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'analysis' && (
              <AIAnalysisPanel
                analysis={analysis}
                isLoading={isAnalyzing}
                onReAnalyze={handleAnalyze}
              />
            )}
            {activeTab === 'outreach' && (
              <OutreachEditor
                leadId={id}
                drafts={outreachDrafts || []}
                onGenerate={handleGenerateOutreach}
                isGenerating={isGenerating}
                onDraftUpdated={(draft: any) => {
                  setLead((prev) =>
                    prev ? {
                      ...prev,
                      outreachDrafts: prev.outreachDrafts.map((d: any) => d._id === draft._id ? draft : d),
                    } : prev
                  );
                }}
              />
            )}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="glass-card p-4 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Company', value: company.name },
                    { label: 'Website', value: company.website, link: true },
                    { label: 'Industry', value: company.industry },
                    { label: 'Team Size', value: company.teamSize },
                    { label: 'Country', value: company.country },
                    { label: 'Email', value: company.publicEmail, link: true, prefix: 'mailto:' },
                    { label: 'Founder', value: company.founderName },
                    { label: 'Title', value: company.founderTitle },
                    { label: 'Blog', value: company.blog, link: true },
                    { label: 'Case Studies', value: company.caseStudies, link: true },
                    { label: 'Portfolio', value: company.portfolio, link: true },
                    { label: 'GitHub', value: company.githubOrg, link: true },
                    { label: 'LinkedIn', value: company.linkedInUrl, link: true },
                    { label: 'Source URL', value: lead.sourceUrl, link: true },
                    { label: 'Added', value: formatDate(createdAt) },
                    { label: 'Updated', value: formatDate(lead.updatedAt) },
                  ].map(({ label, value, link, prefix }) =>
                    value ? (
                      <div key={label}>
                        <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">{label}</div>
                        {link ? (
                          <a href={`${prefix || ''}${value}`} target="_blank" rel="noopener noreferrer"
                             className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate">
                            {value} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <div className="text-sm text-[var(--text-secondary)]">{value}</div>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

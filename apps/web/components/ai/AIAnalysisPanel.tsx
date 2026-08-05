'use client';

import type { AIAnalysis } from '@leadpilot/types';
import {
  Brain, TrendingUp, Users, Zap, Target, ArrowRight,
  AlertCircle, CheckCircle, BarChart3, Lightbulb,
} from 'lucide-react';

interface AIAnalysisPanelProps {
  analysis: AIAnalysis | undefined;
  isLoading?: boolean;
  onReAnalyze?: () => void;
}

const LIKELIHOOD_CONFIG = {
  'Very High': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: '🔥 Very High' },
  High: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: '⬆️ High' },
  Medium: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: '➡️ Medium' },
  Low: { color: '#475569', bg: 'rgba(71,85,105,0.12)', label: '⬇️ Low' },
};

export function AIAnalysisPanel({ analysis, isLoading, onReAnalyze }: AIAnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full rounded-xl" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center glass-card">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: 'var(--accent-violet-dim)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <Brain className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">No Analysis Yet</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4 max-w-xs">
          Run AI analysis to get company insights, outsourcing likelihood, and the best outreach angle.
        </p>
        {onReAnalyze && (
          <button onClick={onReAnalyze} className="btn-primary">
            <Brain className="w-4 h-4" /> Run AI Analysis
          </button>
        )}
      </div>
    );
  }

  const likelihood = LIKELIHOOD_CONFIG[analysis.outsourcingLikelihood] || LIKELIHOOD_CONFIG.Medium;

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Summary */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent-violet-dim)' }}>
            <Brain className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Company Summary</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Key Info Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Business Model</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] font-medium">{analysis.businessModel}</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Target Customers</span>
          </div>
          <p className="text-sm text-[var(--text-primary)]">{analysis.targetCustomers}</p>
        </div>
      </div>

      {/* Outsourcing Likelihood */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Outsourcing Likelihood</span>
          </div>
          <span
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ color: likelihood.color, background: likelihood.bg }}
          >
            {likelihood.label}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: analysis.outsourcingLikelihood === 'Very High' ? '95%'
                : analysis.outsourcingLikelihood === 'High' ? '75%'
                : analysis.outsourcingLikelihood === 'Medium' ? '50%' : '25%',
              background: likelihood.color,
            }}
          />
        </div>
      </div>

      {/* Growth Signals */}
      {analysis.growthSignals?.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Growth Signals</span>
          </div>
          <ul className="space-y-2">
            {analysis.growthSignals.map((signal, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[var(--text-secondary)]">{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hiring Signals */}
      {analysis.hiringSignals?.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Hiring Signals</span>
          </div>
          <ul className="space-y-2">
            {analysis.hiringSignals.map((signal, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[var(--text-secondary)]">{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collaboration Opportunities */}
      {analysis.collaborationOpportunities?.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Collaboration Opportunities</span>
          </div>
          <ul className="space-y-2">
            {analysis.collaborationOpportunities.map((opp, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[var(--text-secondary)]">{opp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best Outreach Angle */}
      {analysis.bestOutreachAngle && (
        <div className="glass-card p-4" style={{ borderColor: 'rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Best Outreach Angle</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
            &ldquo;{analysis.bestOutreachAngle}&rdquo;
          </p>
        </div>
      )}

      {onReAnalyze && (
        <button onClick={onReAnalyze} className="btn-secondary w-full">
          <Brain className="w-4 h-4" /> Re-analyze with AI
        </button>
      )}
    </div>
  );
}

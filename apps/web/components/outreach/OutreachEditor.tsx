'use client';

import { useState } from 'react';
import type { OutreachDraft } from '@leadpilot/types';
import { OUTREACH_LABELS, OUTREACH_ICONS } from '@/lib/utils';
import { updateOutreachDraft } from '@/lib/api';
import { Copy, Check, Edit3, Save, X, Sparkles, Mail, Phone } from 'lucide-react';

interface OutreachEditorProps {
  leadId: string;
  drafts: OutreachDraft[];
  onDraftUpdated?: (draft: OutreachDraft) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function OutreachEditor({ leadId, drafts, onDraftUpdated, onGenerate, isGenerating }: OutreachEditorProps) {
  const [activeTab, setActiveTab] = useState(drafts[0]?.type || 'cold_email');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [saving, setSaving] = useState(false);

  const activeDraft = drafts.find((d) => d.type === activeTab);

  const handleCopy = async (draft: OutreachDraft) => {
    const text = draft.subject ? `Subject: ${draft.subject}\n\n${draft.content}` : draft.content;
    await navigator.clipboard.writeText(text);
    setCopiedId(draft.type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (draft: OutreachDraft) => {
    setEditingId(draft._id || draft.type);
    setEditContent(draft.content);
    setEditSubject(draft.subject || '');
  };

  const handleSave = async (draft: OutreachDraft) => {
    if (!draft._id) { setEditingId(null); return; }
    setSaving(true);
    try {
      await updateOutreachDraft(leadId, draft._id, {
        content: editContent,
        subject: editSubject || undefined,
      });
      onDraftUpdated?.({ ...draft, content: editContent, subject: editSubject });
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  if (!drafts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center glass-card">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: 'var(--accent-blue-dim)', border: '1px solid var(--border-accent)' }}>
          <Mail className="w-7 h-7 text-blue-400" />
        </div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">No Outreach Drafts</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4 max-w-xs">
          Generate personalized outreach messages for this lead. AI will tailor each message to their company.
        </p>
        {onGenerate && (
          <button onClick={onGenerate} disabled={isGenerating} className="btn-primary">
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Outreach Drafts'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {drafts.map((draft) => (
          <button
            key={draft.type}
            onClick={() => setActiveTab(draft.type)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={
              activeTab === draft.type
                ? { background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', border: '1px solid var(--border-accent)' }
                : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
            }
          >
            {OUTREACH_ICONS[draft.type]} {OUTREACH_LABELS[draft.type] || draft.type}
          </button>
        ))}
        {onGenerate && (
          <button onClick={onGenerate} disabled={isGenerating} className="btn-ghost text-xs ml-auto">
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        )}
      </div>

      {/* Active Draft */}
      {activeDraft && (
        <div className="glass-card p-4 space-y-3 animate-fade-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{OUTREACH_ICONS[activeDraft.type]}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {OUTREACH_LABELS[activeDraft.type]}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {editingId === (activeDraft._id || activeDraft.type) ? (
                <>
                  <button
                    onClick={() => handleSave(activeDraft)}
                    disabled={saving}
                    className="btn-primary text-xs py-1 px-2.5"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-ghost text-xs py-1 px-2">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(activeDraft)} className="btn-ghost text-xs py-1 px-2">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleCopy(activeDraft)} className="btn-secondary text-xs py-1 px-2.5">
                    {copiedId === activeDraft.type ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Subject (for emails) */}
          {(activeDraft.subject || activeDraft.type.includes('email')) && (
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1 block">
                Subject Line
              </label>
              {editingId === (activeDraft._id || activeDraft.type) ? (
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="input-base text-sm"
                  placeholder="Email subject..."
                />
              ) : (
                <div className="text-sm font-medium text-[var(--text-primary)] px-3 py-2 rounded-lg"
                     style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  {activeDraft.subject || '(No subject)'}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1 block">
              Message
            </label>
            {editingId === (activeDraft._id || activeDraft.type) ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={activeDraft.type === 'linkedin_connection' ? 3 : 10}
                className="input-base text-sm resize-y leading-relaxed font-mono text-sm"
                style={{ fontFamily: 'inherit' }}
              />
            ) : (
              <div
                className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap px-4 py-3 rounded-lg"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', maxHeight: '280px', overflowY: 'auto' }}
              >
                {activeDraft.type === 'discovery_call'
                  ? <><Phone className="inline w-3 h-3 mr-1 text-blue-400" />{activeDraft.content}</>
                  : activeDraft.content}
              </div>
            )}
          </div>

          {/* Character count for LinkedIn */}
          {activeDraft.type === 'linkedin_connection' && (
            <div className="text-right text-xs text-[var(--text-muted)]">
              {activeDraft.content.length}/300 chars
              {activeDraft.content.length > 300 && (
                <span className="text-red-400 ml-1">(LinkedIn limit: 300)</span>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-2">
            ⚠️ Review and personalize before sending. Replace <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-card)' }}>[Your Name]</code> with your details.
          </p>
        </div>
      )}
    </div>
  );
}

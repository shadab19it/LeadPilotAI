'use client';

import { useState } from 'react';
import { Settings, Key, Database, Bot, Calendar, Bell, Shield, Save, Check, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ title, icon: Icon, color, children }: any) => (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, description, children }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="sm:w-56 flex-shrink-0">
        <label className="text-sm font-medium text-[var(--text-secondary)] block">{label}</label>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Settings</h2>
          <p className="text-sm text-[var(--text-muted)]">Configure LeadPilot AI to match your workflow</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          {saved ? <><Check className="w-4 h-4 text-emerald-300" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* AI Settings */}
      <Section title="AI Configuration" icon={Bot} color="#3b82f6">
        <Field label="OpenAI API Key" description="Required for AI analysis and outreach generation">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="password"
              placeholder="sk-••••••••••••••••••••••••••••••"
              className="input-base pl-9 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Get your key at{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
               className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
              platform.openai.com <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </Field>
        <Field label="AI Model" description="Model used for analysis and outreach generation">
          <select className="input-base text-sm">
            <option value="gpt-4o-mini">GPT-4o Mini (Fast &amp; Cost-effective) ✓ Recommended</option>
            <option value="gpt-4o">GPT-4o (Highest quality)</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</option>
          </select>
        </Field>
        <Field label="Analysis Mode" description="How AI analysis is triggered">
          <div className="flex flex-col gap-2">
            {[
              { value: 'manual', label: 'Manual', desc: 'Analyze leads individually on demand' },
              { value: 'auto', label: 'Auto on Discovery', desc: 'Automatically analyze all discovered leads' },
            ].map(({ value, label, desc }) => (
              <label key={value} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-card-hover)] transition-all"
                     style={{ border: '1px solid var(--border)' }}>
                <input type="radio" name="analysisMode" value={value} defaultChecked={value === 'manual'}
                       className="mt-0.5 accent-blue-500" />
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Field>
      </Section>

      {/* Database */}
      <Section title="Database" icon={Database} color="#10b981">
        <Field label="MongoDB URI" description="Connection string for your MongoDB database">
          <div className="relative">
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              defaultValue="mongodb://localhost:27017/leadpilot"
              className="input-base pl-9 font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-400">Connected</span>
          </div>
        </Field>
      </Section>

      {/* Scheduler */}
      <Section title="Discovery Scheduler" icon={Calendar} color="#8b5cf6">
        <Field label="Daily Discovery" description="Automatically discover new leads on a schedule">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 rounded-full peer peer-checked:bg-blue-500 bg-[var(--bg-secondary)] border border-[var(--border)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
            <span className="ml-3 text-sm text-[var(--text-secondary)]">Enabled</span>
          </label>
        </Field>
        <Field label="Schedule (Cron)" description="When to run discovery (UTC time)">
          <input
            type="text"
            defaultValue="0 6 * * *"
            className="input-base font-mono text-sm"
            placeholder="0 6 * * *"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">Default: 6:00 AM UTC every day. Use <a href="https://crontab.guru" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">crontab.guru</a> to build expressions.</p>
        </Field>
        <Field label="Default Sources" description="Sources used in scheduled discovery">
          <div className="flex flex-wrap gap-2">
            {['Clutch', 'GoodFirms', 'GitHub', 'Product Hunt', 'YC'].map((s) => (
              <label key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-sm"
                     style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <input type="checkbox" defaultChecked className="accent-blue-500" />
                <span className="text-[var(--text-secondary)]">{s}</span>
              </label>
            ))}
          </div>
        </Field>
      </Section>

      {/* Scraper */}
      <Section title="Scraper Settings" icon={Shield} color="#f59e0b">
        <Field label="Rate Limit" description="Max requests per second to external sites">
          <div className="flex items-center gap-3">
            <input type="range" min="0.5" max="3" step="0.5" defaultValue="1"
                   className="flex-1 accent-blue-500" />
            <span className="text-sm font-bold text-[var(--text-primary)] w-12 text-right">1 RPS</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Higher = faster but more likely to be blocked. Keep at 1 or lower.</p>
        </Field>
        <Field label="Timeout" description="Request timeout for scraping">
          <select className="input-base text-sm" defaultValue="30000">
            <option value="15000">15 seconds</option>
            <option value="30000">30 seconds ✓</option>
            <option value="60000">60 seconds</option>
          </select>
        </Field>
      </Section>

      {/* Notifications (future) */}
      <Section title="Notifications" icon={Bell} color="#06b6d4">
        <div className="p-4 rounded-xl text-center"
             style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border)' }}>
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm text-[var(--text-muted)]">Email, Slack, and webhook notifications</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Coming in a future release</p>
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-8">
          {saved ? <><Check className="w-4 h-4 text-emerald-300" /> Changes Saved!</> : <><Save className="w-4 h-4" /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
}

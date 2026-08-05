'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, Download } from 'lucide-react';
import { getExportUrl } from '@/lib/api';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Lead Intelligence',
  '/discover': 'Discover Leads',
  '/crm': 'CRM Board',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )?.[1] || 'LeadPilot AI';

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-[var(--border)] bg-[var(--bg-sidebar)] flex-shrink-0">
      {/* Left: Page title */}
      <div>
        <h1 className="text-base font-semibold text-[var(--text-primary)]">{title}</h1>
        <p className="text-xs text-[var(--text-muted)]">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Center: Search */}
      <div className="relative w-72 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search leads, companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 py-2 text-sm"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <a
          href={getExportUrl('csv')}
          className="btn-ghost text-xs"
          title="Export as CSV"
          download
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </a>
        <button className="relative btn-ghost p-2">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ml-1"
             style={{ background: 'var(--gradient-brand)' }}>
          LP
        </div>
      </div>
    </header>
  );
}

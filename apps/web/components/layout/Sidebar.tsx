'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Compass,
  Kanban,
  Settings,
  Zap,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/crm', label: 'CRM Board', icon: Kanban },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)] z-10">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--gradient-brand)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm gradient-text">LeadPilot AI</div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide uppercase">
              Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)] px-2 mb-3 mt-1">
          Navigation
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="glass-card p-3 text-center">
          <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">AI Status</div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="notif-dot w-2 h-2" />
            <span className="text-xs text-[var(--accent-emerald)]">Active</span>
          </div>
        </div>
        <div className="mt-3 text-center text-[10px] text-[var(--text-muted)]">
          LeadPilot AI v1.0
        </div>
      </div>
    </aside>
  );
}

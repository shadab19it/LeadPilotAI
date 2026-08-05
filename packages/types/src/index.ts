// =============================================
// LeadPilot AI — Shared TypeScript Types
// =============================================

// ─── Lead Status ─────────────────────────────
export type LeadStatus =
  | 'New'
  | 'Qualified'
  | 'Contacted'
  | 'Follow Up'
  | 'Interested'
  | 'Meeting'
  | 'Client'
  | 'Rejected';

// ─── Lead Sources ────────────────────────────
export type LeadSource =
  | 'Clutch'
  | 'GoodFirms'
  | 'DesignRush'
  | 'TechBehemoths'
  | 'Agency Spotter'
  | 'Sortlist'
  | 'YC'
  | 'Wellfound'
  | 'Product Hunt'
  | 'GitHub'
  | 'GitLab'
  | 'Google'
  | 'LinkedIn'
  | 'Job Board'
  | 'Manual';

// ─── Technology Stack ────────────────────────
export interface TechStack {
  detected: string[];
  frameworks: string[];
  cloud: string[];
  databases: string[];
  tools: string[];
}

// ─── Company ─────────────────────────────────
export interface Company {
  name: string;
  website: string;
  industry: string;
  services: string[];
  teamSize: string;
  country: string;
  contactPage?: string;
  publicEmail?: string;
  founderName?: string;
  founderTitle?: string;
  linkedInUrl?: string;
  githubOrg?: string;
  portfolio?: string;
  caseStudies?: string;
  blog?: string;
  hiringStatus: boolean;
  techStack: TechStack;
}

// ─── Lead Score ──────────────────────────────
export interface LeadScore {
  overall: number; // 0–100
  confidence: number; // 0–100
  breakdown: {
    teamSize: number;
    technology: number;
    growth: number;
    hiring: number;
    activity: number;
  };
}

// ─── AI Analysis ─────────────────────────────
export interface AIAnalysis {
  summary: string;
  businessModel: string;
  targetCustomers: string;
  technologies: string;
  growthSignals: string[];
  hiringSignals: string[];
  outsourcingLikelihood: 'Very High' | 'High' | 'Medium' | 'Low';
  collaborationOpportunities: string[];
  bestOutreachAngle: string;
}

// ─── Outreach Draft ──────────────────────────
export type OutreachType =
  | 'linkedin_connection'
  | 'linkedin_followup'
  | 'cold_email'
  | 'followup_email'
  | 'contact_form'
  | 'discovery_call';

export interface OutreachDraft {
  _id?: string;
  type: OutreachType;
  subject?: string;
  content: string;
  generatedAt: Date | string;
}

// ─── Lead ────────────────────────────────────
export interface Lead {
  _id?: string;
  company: Company;
  source: LeadSource;
  sourceUrl: string;
  status: LeadStatus;
  score: LeadScore;
  analysis?: AIAnalysis;
  outreachDrafts: OutreachDraft[];
  notes: string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  lastContactedAt?: Date | string;
}

// ─── Dashboard Stats ─────────────────────────
export interface DashboardStats {
  totalLeads: number;
  newToday: number;
  hotLeads: number;
  warmLeads: number;
  contactedLeads: number;
  avgScore: number;
  techBreakdown: Array<{ name: string; count: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
  industryBreakdown: Array<{ industry: string; count: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  statusBreakdown: Array<{ status: LeadStatus; count: number }>;
  recentLeads: Lead[];
  scoreDistribution: Array<{ range: string; count: number }>;
}

// ─── Discovery Config ────────────────────────
export interface DiscoveryConfig {
  sources: LeadSource[];
  searchTerms?: string[];
  technologies?: string[];
  countries?: string[];
  minTeamSize?: number;
  maxTeamSize?: number;
  maxLeads?: number;
}

// ─── Discovery Result ────────────────────────
export interface DiscoveryResult {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total: number;
  added: number;
  updated: number;
  failed: number;
  startedAt: Date | string;
  completedAt?: Date | string;
  error?: string;
}

// ─── API Response Wrappers ───────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Lead Filters ────────────────────────────
export interface LeadFilters {
  search?: string;
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource | LeadSource[];
  minScore?: number;
  maxScore?: number;
  country?: string;
  industry?: string;
  technology?: string;
  hiringOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'score' | 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// ─── Score Tier ──────────────────────────────
export type ScoreTier = 'hot' | 'warm' | 'low';

export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) return 'hot';
  if (score >= 70) return 'warm';
  return 'low';
}

export const SCORE_TIER_LABELS: Record<ScoreTier, string> = {
  hot: '🔥 Hot',
  warm: '🌡️ Warm',
  low: '❄️ Low Priority',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  New: '#3B82F6',
  Qualified: '#8B5CF6',
  Contacted: '#F59E0B',
  'Follow Up': '#F97316',
  Interested: '#10B981',
  Meeting: '#06B6D4',
  Client: '#22C55E',
  Rejected: '#EF4444',
};

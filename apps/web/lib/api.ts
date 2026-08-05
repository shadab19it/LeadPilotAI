import axios from 'axios';
import type {
  Lead,
  LeadFilters,
  DashboardStats,
  DiscoveryConfig,
  PaginatedResponse,
  ApiResponse,
} from '@leadpilot/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Leads ───────────────────────────────────

export async function getLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
  if (filters.source) params.set('source', Array.isArray(filters.source) ? filters.source.join(',') : filters.source);
  if (filters.minScore !== undefined) params.set('minScore', String(filters.minScore));
  if (filters.maxScore !== undefined) params.set('maxScore', String(filters.maxScore));
  if (filters.country) params.set('country', filters.country);
  if (filters.industry) params.set('industry', filters.industry);
  if (filters.technology) params.set('technology', filters.technology);
  if (filters.hiringOnly) params.set('hiringOnly', 'true');
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const { data } = await api.get(`/leads?${params.toString()}`);
  return data;
}

export async function getLead(id: string): Promise<Lead> {
  const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
  return data.data!;
}

export async function createLead(lead: Partial<Lead>): Promise<Lead> {
  const { data } = await api.post<ApiResponse<Lead>>('/leads', lead);
  return data.data!;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${id}`, updates);
  return data.data!;
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
  const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${id}/status`, { status });
  return data.data!;
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/leads/${id}`);
}

// ─── Analysis ────────────────────────────────

export async function analyzeLead(id: string): Promise<Lead> {
  const { data } = await api.post<ApiResponse<Lead>>(`/analyze/${id}`);
  return data.data!;
}

// ─── Outreach ────────────────────────────────

export async function generateOutreach(id: string): Promise<Lead['outreachDrafts']> {
  const { data } = await api.post<ApiResponse<Lead['outreachDrafts']>>(`/outreach/${id}`);
  return data.data!;
}

export async function updateOutreachDraft(
  leadId: string,
  draftId: string,
  updates: { content?: string; subject?: string }
): Promise<void> {
  await api.patch(`/outreach/${leadId}/${draftId}`, updates);
}

// ─── Discovery ───────────────────────────────

export async function startDiscovery(config: Partial<DiscoveryConfig>): Promise<{ jobId: string }> {
  const { data } = await api.post('/discover', config);
  return data;
}

export async function getDiscoveryStatus(jobId: string): Promise<{
  jobId: string;
  status: string;
  progress: number;
  total: number;
  added: number;
  error?: string;
  completedAt?: string;
}> {
  const { data } = await api.get(`/discover/status/${jobId}`);
  return data.data;
}

export async function getDiscoveryJobs(): Promise<any[]> {
  const { data } = await api.get('/discover/jobs');
  return data.data;
}

// ─── Dashboard ───────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return data.data!;
}

// ─── Export ──────────────────────────────────

export function getExportUrl(format: 'csv' | 'json' = 'csv'): string {
  return `${BASE_URL}/export/${format}`;
}

export default api;

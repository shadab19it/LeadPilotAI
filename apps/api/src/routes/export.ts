import { Router, Request, Response, NextFunction } from 'express';
import { LeadModel } from '@leadpilot/database';

export const exportRouter = Router();

// ─── GET /api/export/csv ──────────────────────
exportRouter.get('/csv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, source, minScore } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = { $in: status.split(',') };
    if (source) filter.source = { $in: source.split(',') };
    if (minScore) filter['score.overall'] = { $gte: parseInt(minScore) };

    const leads = await LeadModel.find(filter)
      .sort({ 'score.overall': -1 })
      .limit(5000)
      .lean();

    // Build CSV manually for type safety
    const headers = [
      'Company Name', 'Website', 'Industry', 'Team Size', 'Country',
      'Source', 'Status', 'Score', 'Hiring', 'Email',
      'LinkedIn', 'GitHub', 'Technologies', 'Founder',
      'Outreach Likelihood', 'Notes', 'Created At',
    ];

    const rows = leads.map((lead) => [
      `"${(lead.company.name || '').replace(/"/g, '""')}"`,
      `"${lead.company.website || ''}"`,
      `"${lead.company.industry || ''}"`,
      `"${lead.company.teamSize || ''}"`,
      `"${lead.company.country || ''}"`,
      `"${lead.source || ''}"`,
      `"${lead.status || ''}"`,
      lead.score?.overall ?? 0,
      lead.company.hiringStatus ? 'Yes' : 'No',
      `"${lead.company.publicEmail || ''}"`,
      `"${lead.company.linkedInUrl || ''}"`,
      `"${lead.company.githubOrg || ''}"`,
      `"${(lead.company.techStack?.detected || []).join('; ')}"`,
      `"${lead.company.founderName || ''}"`,
      `"${(lead as any).analysis?.outsourcingLikelihood || ''}"`,
      `"${(lead.notes || '').replace(/"/g, '""')}"`,
      `"${new Date((lead as any).createdAt || Date.now()).toLocaleDateString()}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leadpilot-leads-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/export/json ─────────────────────
exportRouter.get('/json', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leads = await LeadModel.find().sort({ 'score.overall': -1 }).limit(1000).lean();
    res.setHeader('Content-Disposition', `attachment; filename="leadpilot-leads-${Date.now()}.json"`);
    res.json({ exported: leads.length, leads });
  } catch (error) {
    next(error);
  }
});

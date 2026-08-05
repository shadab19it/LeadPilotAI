import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LeadModel } from '@leadpilot/database';
import { runDiscovery } from '@leadpilot/playwright';
import { logger } from '@leadpilot/lib';
import type { DiscoveryConfig, LeadSource } from '@leadpilot/types';

export const discoverRouter = Router();

// In-memory job tracking (replace with Redis in production)
const activeJobs = new Map<string, {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  added: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
}>();

// ─── POST /api/discover ───────────────────────
discoverRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      sources = ['Clutch', 'GitHub', 'GoodFirms', 'Product Hunt'],
      searchTerms,
      maxLeads = 50,
    } = req.body as Partial<DiscoveryConfig>;

    const jobId = uuidv4();

    activeJobs.set(jobId, {
      status: 'pending',
      progress: 0,
      total: 0,
      added: 0,
      startedAt: new Date().toISOString(),
    });

    // Respond immediately with job ID
    res.status(202).json({
      success: true,
      jobId,
      message: 'Discovery job started',
    });

    // Run discovery in the background
    (async () => {
      const job = activeJobs.get(jobId)!;
      job.status = 'running';

      try {
        logger.info(`🚀 Discovery job ${jobId} started`, { sources, searchTerms });

        const config: DiscoveryConfig = {
          sources: sources as LeadSource[],
          searchTerms: searchTerms as string[] | undefined,
          maxLeads,
        };

        const { leads, stats } = await runDiscovery(config);

        job.total = leads.length;
        let added = 0;

        // Save leads (skip duplicates by website+source)
        for (const lead of leads) {
          try {
            const exists = await LeadModel.findOne({
              'company.website': lead.company?.website,
              source: lead.source,
            });

            if (!exists && lead.company?.name) {
              await LeadModel.create(lead);
              added++;
            }
          } catch (err) {
            // Skip duplicate key errors
            if ((err as any)?.code !== 11000) {
              logger.warn('Error saving lead', { error: String(err) });
            }
          }
        }

        job.added = added;
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        logger.info(`✅ Discovery job ${jobId} completed`, { total: leads.length, added, stats });
      } catch (error) {
        job.status = 'failed';
        job.error = String(error);
        job.completedAt = new Date().toISOString();
        logger.error(`❌ Discovery job ${jobId} failed`, { error: String(error) });
      }
    })();
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/discover/status/:jobId ─────────
discoverRouter.get('/status/:jobId', (req: Request, res: Response) => {
  const job = activeJobs.get(req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found' });
    return;
  }

  res.json({ success: true, data: { jobId: req.params.jobId, ...job } });
});

// ─── GET /api/discover/jobs ───────────────────
discoverRouter.get('/jobs', (_req: Request, res: Response) => {
  const jobs = Array.from(activeJobs.entries()).map(([id, job]) => ({
    jobId: id,
    ...job,
  }));

  res.json({ success: true, data: jobs.reverse().slice(0, 20) });
});

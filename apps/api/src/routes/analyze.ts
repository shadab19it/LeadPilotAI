import { Router, Request, Response, NextFunction } from 'express';
import { LeadModel } from '@leadpilot/database';
import { analyzeCompany, calculateLeadScore } from '@leadpilot/ai';
import { logger } from '@leadpilot/lib';

export const analyzeRouter = Router();

// ─── POST /api/analyze/:id ────────────────────
analyzeRouter.post('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await LeadModel.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }

    logger.info(`🤖 Running AI analysis for: ${lead.company.name}`);

    // Run analysis and re-score in parallel
    const [analysis, score] = await Promise.all([
      analyzeCompany(lead.company as any),
      Promise.resolve(calculateLeadScore(lead.company as any)),
    ]);

    lead.analysis = analysis as any;
    lead.score = score;
    await lead.save();

    logger.info(`✅ Analysis complete for ${lead.company.name}`, {
      score: score.overall,
      likelihood: analysis.outsourcingLikelihood,
    });

    res.json({ success: true, data: lead.toJSON() });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/analyze/batch ──────────────────
analyzeRouter.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, error: 'ids must be a non-empty array' });
      return;
    }

    const leads = await LeadModel.find({ _id: { $in: ids } });
    const results = { processed: 0, failed: 0 };

    for (const lead of leads) {
      try {
        const [analysis, score] = await Promise.all([
          analyzeCompany(lead.company as any),
          Promise.resolve(calculateLeadScore(lead.company as any)),
        ]);
        lead.analysis = analysis as any;
        lead.score = score;
        await lead.save();
        results.processed++;
      } catch {
        results.failed++;
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

import { Router, Request, Response, NextFunction } from 'express';
import { LeadModel } from '@leadpilot/database';
import { generateOutreachDrafts } from '@leadpilot/ai';
import { logger } from '@leadpilot/lib';

export const outreachRouter = Router();

// ─── POST /api/outreach/:id ───────────────────
// Generate all outreach drafts for a lead
outreachRouter.post('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await LeadModel.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }

    logger.info(`✉️ Generating outreach drafts for: ${lead.company.name}`);

    const drafts = await generateOutreachDrafts(
      lead.company as any,
      lead.analysis as any
    );

    lead.outreachDrafts = drafts as any;
    await lead.save();

    res.json({ success: true, data: lead.outreachDrafts });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/outreach/:id ────────────────────
outreachRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await LeadModel.findById(req.params.id).select('outreachDrafts company.name').lean();
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }
    res.json({ success: true, data: lead.outreachDrafts });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /api/outreach/:id/:draftId ─────────
// Update a specific draft content
outreachRouter.patch('/:id/:draftId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, subject } = req.body as { content?: string; subject?: string };

    const lead = await LeadModel.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }

    const draft = (lead.outreachDrafts as any[]).find((d: any) => String(d._id) === req.params.draftId || d.type === req.params.draftId);
    if (!draft) {
      res.status(404).json({ success: false, error: 'Draft not found' });
      return;
    }

    if (content !== undefined) draft.content = content;
    if (subject !== undefined) draft.subject = subject;

    await lead.save();
    res.json({ success: true, data: draft });
  } catch (error) {
    next(error);
  }
});

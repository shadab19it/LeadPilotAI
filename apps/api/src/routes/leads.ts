import { Router, Request, Response, NextFunction } from 'express';
import { LeadModel } from '@leadpilot/database';
import type { LeadStatus, LeadFilters } from '@leadpilot/types';

export const leadsRouter = Router();

// ─── GET /api/leads ───────────────────────────
leadsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      status,
      source,
      minScore,
      maxScore,
      country,
      industry,
      technology,
      hiringOnly,
      page = '1',
      limit = '20',
      sortBy = 'score',
      sortOrder = 'desc',
    } = req.query as Partial<Record<string, string>>;

    const filter: Record<string, unknown> = {};

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Status filter
    if (status) {
      const statuses = status.split(',') as LeadStatus[];
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    // Source filter
    if (source) {
      const sources = source.split(',');
      filter.source = sources.length === 1 ? sources[0] : { $in: sources };
    }

    // Score range
    if (minScore || maxScore) {
      filter['score.overall'] = {
        ...(minScore ? { $gte: parseInt(minScore) } : {}),
        ...(maxScore ? { $lte: parseInt(maxScore) } : {}),
      };
    }

    // Country
    if (country) {
      filter['company.country'] = { $regex: country, $options: 'i' };
    }

    // Industry
    if (industry) {
      filter['company.industry'] = { $regex: industry, $options: 'i' };
    }

    // Technology
    if (technology) {
      filter['company.techStack.detected'] = { $regex: technology, $options: 'i' };
    }

    // Hiring
    if (hiringOnly === 'true') {
      filter['company.hiringStatus'] = true;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortMap: Record<string, string> = {
      score: 'score.overall',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      name: 'company.name',
    };
    const sortField = sortMap[sortBy] || 'score.overall';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const [leads, total] = await Promise.all([
      LeadModel.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      LeadModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/leads ──────────────────────────
leadsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = new LeadModel(req.body);
    await lead.save();
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/leads/:id ───────────────────────
leadsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await LeadModel.findById(req.params.id).lean();
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /api/leads/:id ─────────────────────
leadsRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ALLOWED_FIELDS = ['status', 'notes', 'tags', 'company', 'lastContactedAt'];
    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const lead = await LeadModel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/leads/:id ───────────────────
leadsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await LeadModel.findByIdAndDelete(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /api/leads/:id/status ─────────────
leadsRouter.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: LeadStatus };
    const validStatuses: LeadStatus[] = ['New', 'Qualified', 'Contacted', 'Follow Up', 'Interested', 'Meeting', 'Client', 'Rejected'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: `Invalid status: ${status}` });
      return;
    }

    const updateData: Record<string, unknown> = { status };
    if (['Contacted', 'Follow Up', 'Interested', 'Meeting'].includes(status)) {
      updateData.lastContactedAt = new Date();
    }

    const lead = await LeadModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found' });
      return;
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
});

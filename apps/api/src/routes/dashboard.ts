import { Router, Request, Response, NextFunction } from 'express';
import { LeadModel } from '@leadpilot/database';

export const dashboardRouter = Router();

// ─── GET /api/dashboard/stats ────────────────
dashboardRouter.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalLeads,
      newToday,
      hotLeads,
      warmLeads,
      contactedLeads,
      recentLeads,
      techAgg,
      countryAgg,
      sourceAgg,
      statusAgg,
      industryAgg,
      scoreAgg,
    ] = await Promise.all([
      LeadModel.countDocuments(),
      LeadModel.countDocuments({ createdAt: { $gte: todayStart } }),
      LeadModel.countDocuments({ 'score.overall': { $gte: 90 } }),
      LeadModel.countDocuments({ 'score.overall': { $gte: 70, $lt: 90 } }),
      LeadModel.countDocuments({ status: { $in: ['Contacted', 'Follow Up', 'Interested', 'Meeting', 'Client'] } }),
      LeadModel.find().sort({ createdAt: -1 }).limit(8).lean(),
      // Technology breakdown
      LeadModel.aggregate([
        { $unwind: '$company.techStack.detected' },
        { $group: { _id: '$company.techStack.detected', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
        { $project: { name: '$_id', count: 1, _id: 0 } },
      ]),
      // Country breakdown
      LeadModel.aggregate([
        { $match: { 'company.country': { $ne: '' } } },
        { $group: { _id: '$company.country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { country: '$_id', count: 1, _id: 0 } },
      ]),
      // Source breakdown
      LeadModel.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { source: '$_id', count: 1, _id: 0 } },
      ]),
      // Status breakdown
      LeadModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      // Industry breakdown
      LeadModel.aggregate([
        { $match: { 'company.industry': { $ne: '' } } },
        { $group: { _id: '$company.industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { industry: '$_id', count: 1, _id: 0 } },
      ]),
      // Score distribution
      LeadModel.aggregate([
        {
          $bucket: {
            groupBy: '$score.overall',
            boundaries: [0, 40, 60, 70, 80, 90, 101],
            default: 'Unknown',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);

    // Score avg
    const avgScoreResult = await LeadModel.aggregate([
      { $group: { _id: null, avg: { $avg: '$score.overall' } } },
    ]);
    const avgScore = Math.round(avgScoreResult[0]?.avg || 0);

    // Format score distribution
    const scoreLabels = ['0-39', '40-59', '60-69', '70-79', '80-89', '90-100'];
    const scoreDistribution = scoreAgg.map((bucket: any, i: number) => ({
      range: scoreLabels[i] || 'Unknown',
      count: bucket.count,
    }));

    res.json({
      success: true,
      data: {
        totalLeads,
        newToday,
        hotLeads,
        warmLeads,
        contactedLeads,
        avgScore,
        techBreakdown: techAgg,
        countryBreakdown: countryAgg,
        sourceBreakdown: sourceAgg,
        statusBreakdown: statusAgg,
        industryBreakdown: industryAgg,
        scoreDistribution,
        recentLeads,
      },
    });
  } catch (error) {
    next(error);
  }
});

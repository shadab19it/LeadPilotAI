import cron from 'node-cron';
import { LeadModel } from '@leadpilot/database';
import { runDiscovery } from '@leadpilot/playwright';
import { logger } from '@leadpilot/lib';

const DEFAULT_SOURCES = [
  'Clutch', 'GoodFirms', 'GitHub', 'Product Hunt', 'YC',
] as const;

async function runDailyDiscovery() {
  logger.info('⏰ Daily discovery job triggered');

  try {
    const { leads } = await runDiscovery({
      sources: [...DEFAULT_SOURCES],
      searchTerms: [
        'software development agency',
        'web development company outsourcing',
        'digital agency react nextjs',
      ],
    });

    let added = 0;
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
        if ((err as any)?.code !== 11000) {
          logger.warn('Error saving lead in scheduler', { error: String(err) });
        }
      }
    }

    logger.info(`✅ Daily discovery complete: ${added} new leads added`);
  } catch (error) {
    logger.error('❌ Daily discovery job failed', { error: String(error) });
  }
}

export function startDiscoveryScheduler() {
  const cronExpression = process.env.DISCOVERY_CRON || '0 6 * * *';

  if (!cron.validate(cronExpression)) {
    logger.warn('Invalid DISCOVERY_CRON expression, using default "0 6 * * *"');
  }

  const schedule = cron.validate(cronExpression) ? cronExpression : '0 6 * * *';

  cron.schedule(schedule, runDailyDiscovery, {
    timezone: 'UTC',
  });

  logger.info(`📅 Discovery scheduler started`, { schedule });
}

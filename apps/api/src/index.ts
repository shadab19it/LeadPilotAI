import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from '@leadpilot/database';
import { logger } from '@leadpilot/lib';
import { leadsRouter } from './routes/leads';
import { discoverRouter } from './routes/discover';
import { analyzeRouter } from './routes/analyze';
import { outreachRouter } from './routes/outreach';
import { dashboardRouter } from './routes/dashboard';
import { exportRouter } from './routes/export';
import { errorHandler } from './middleware/errorHandler';
import { startDiscoveryScheduler } from './jobs/discoveryJob';

const app = express();
const PORT = parseInt(process.env.PORT || '4000');

// ─── Middleware ───────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ───────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: Object.keys(req.query).length ? req.query : undefined,
  });
  next();
});

// ─── Health Check ────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    openai: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-your'),
  });
});

// ─── Routes ──────────────────────────────────
app.use('/api/leads', leadsRouter);
app.use('/api/discover', discoverRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/outreach', outreachRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/export', exportRouter);

// ─── 404 Handler ─────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error Handler ───────────────────────────
app.use(errorHandler);

// ─── Boot ─────────────────────────────────────
async function bootstrap() {
  try {
    await connectDB(process.env.MONGODB_URI);
    logger.info('✅ Database connected');

    app.listen(PORT, () => {
      logger.info(`🚀 LeadPilot API running at http://localhost:${PORT}`);
      logger.info(`   Health: http://localhost:${PORT}/health`);
    });

    // Start the daily discovery scheduler
    startDiscoveryScheduler();
  } catch (error) {
    logger.error('❌ Failed to start server', { error: String(error) });
    process.exit(1);
  }
}

bootstrap();

export default app;

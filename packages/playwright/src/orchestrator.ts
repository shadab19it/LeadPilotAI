import { chromium, Browser } from 'playwright';
import type { Company, Lead, LeadSource, DiscoveryConfig, DiscoveryResult } from '@leadpilot/types';
import { calculateLeadScore, detectTechnologies } from '@leadpilot/ai';
import { logger, sleep, RateLimiter } from '@leadpilot/lib';
import { searchGitHubOrgs } from './scrapers/github';
import { googleSearchLeads } from './scrapers/google';
import { scrapeClutch } from './scrapers/clutch';
import { scrapeGoodFirms } from './scrapers/goodfirms';
import { scrapeYCDirectory } from './scrapers/yc';
import { scrapeProductHunt } from './scrapers/producthunt';
import { scrapeLinkedInCompanies } from './scrapers/linkedin';

// ─── Mock / Demo Lead Data ────────────────────

const MOCK_COMPANIES: Array<{ data: Partial<Company>; source: LeadSource; sourceUrl: string }> = [
  {
    source: 'Clutch',
    sourceUrl: 'https://clutch.co/profile/pixelcraft-studios',
    data: {
      name: 'Pixelcraft Studios',
      website: 'https://pixelcraft.io',
      industry: 'Digital Agency',
      services: ['Web Development', 'UI/UX Design', 'Mobile Apps', 'SaaS Development'],
      teamSize: '11-50',
      country: 'United States',
      publicEmail: 'hello@pixelcraft.io',
      linkedInUrl: 'https://linkedin.com/company/pixelcraft-studios',
      githubOrg: 'https://github.com/pixelcraft-studios',
      blog: 'https://pixelcraft.io/blog',
      hiringStatus: true,
      techStack: {
        detected: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript'],
        frameworks: ['React', 'Next.js', 'Node.js', 'TypeScript'],
        cloud: ['AWS'],
        databases: ['PostgreSQL'],
        tools: ['Docker'],
      },
    },
  },
  {
    source: 'GoodFirms',
    sourceUrl: 'https://goodfirms.co/company/cloudscale-tech',
    data: {
      name: 'CloudScale Technologies',
      website: 'https://cloudscale.tech',
      industry: 'Cloud / DevOps',
      services: ['Cloud Architecture', 'DevOps Consulting', 'Backend Development', 'Kubernetes'],
      teamSize: '51-200',
      country: 'United Kingdom',
      publicEmail: 'hello@cloudscale.tech',
      linkedInUrl: 'https://linkedin.com/company/cloudscale-technologies',
      blog: 'https://cloudscale.tech/blog',
      caseStudies: 'https://cloudscale.tech/case-studies',
      hiringStatus: true,
      techStack: {
        detected: ['Python', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'Docker', 'Go', 'Terraform'],
        frameworks: ['Python', 'Go', 'FastAPI'],
        cloud: ['AWS'],
        databases: ['PostgreSQL', 'Redis'],
        tools: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
      },
    },
  },
  {
    source: 'Clutch',
    sourceUrl: 'https://clutch.co/profile/reactiv-labs',
    data: {
      name: 'Reactiv Labs',
      website: 'https://reactivlabs.com',
      industry: 'SaaS Development',
      services: ['React Development', 'Node.js APIs', 'SaaS Products', 'Mobile Development'],
      teamSize: '11-50',
      country: 'Canada',
      founderName: 'James Chen',
      founderTitle: 'CEO & Co-Founder',
      linkedInUrl: 'https://linkedin.com/company/reactiv-labs',
      githubOrg: 'https://github.com/reactiv-labs',
      hiringStatus: true,
      techStack: {
        detected: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'NestJS'],
        frameworks: ['React', 'Node.js', 'TypeScript', 'NestJS'],
        cloud: ['AWS'],
        databases: ['MongoDB'],
        tools: ['Docker'],
      },
    },
  },
  {
    source: 'Product Hunt',
    sourceUrl: 'https://producthunt.com/@axiom-data',
    data: {
      name: 'Axiom Data Systems',
      website: 'https://axiomdata.io',
      industry: 'Data & Analytics',
      services: ['Data Engineering', 'ML Infrastructure', 'Analytics Platforms'],
      teamSize: '1-10',
      country: 'United States',
      founderName: 'Sarah Williams',
      founderTitle: 'Founder',
      linkedInUrl: 'https://linkedin.com/in/sarah-williams-axiom',
      hiringStatus: false,
      techStack: {
        detected: ['Python', 'React', 'AWS', 'PostgreSQL', 'Redis', 'Elasticsearch'],
        frameworks: ['Python', 'FastAPI', 'React'],
        cloud: ['AWS'],
        databases: ['PostgreSQL', 'Redis', 'Elasticsearch'],
        tools: ['Docker'],
      },
    },
  },
  {
    source: 'GitHub',
    sourceUrl: 'https://github.com/aurora-dev-studio',
    data: {
      name: 'Aurora Dev Studio',
      website: 'https://auroradev.studio',
      industry: 'Digital Agency',
      services: ['Full-stack Development', 'API Design', 'Open Source'],
      teamSize: '10-25',
      country: 'Germany',
      githubOrg: 'https://github.com/aurora-dev-studio',
      hiringStatus: true,
      techStack: {
        detected: ['Vue.js', 'Python', 'Docker', 'PostgreSQL', 'Azure'],
        frameworks: ['Vue.js', 'Python', 'Django'],
        cloud: ['Azure'],
        databases: ['PostgreSQL'],
        tools: ['Docker', 'CI/CD'],
      },
    },
  },
  {
    source: 'YC',
    sourceUrl: 'https://ycombinator.com/companies/velo-build',
    data: {
      name: 'Velo Build',
      website: 'https://velo.build',
      industry: 'Developer Tools',
      services: ['Developer Tools', 'CI/CD Platforms', 'DevOps Automation'],
      teamSize: '11-50',
      country: 'United States',
      founderName: 'Alex Rivera',
      founderTitle: 'CTO',
      linkedInUrl: 'https://linkedin.com/company/velo-build',
      githubOrg: 'https://github.com/velo-build',
      blog: 'https://velo.build/blog',
      hiringStatus: true,
      techStack: {
        detected: ['Go', 'React', 'TypeScript', 'Kubernetes', 'AWS', 'PostgreSQL'],
        frameworks: ['Go', 'React', 'TypeScript'],
        cloud: ['AWS'],
        databases: ['PostgreSQL'],
        tools: ['Docker', 'Kubernetes'],
      },
    },
  },
  {
    source: 'GoodFirms',
    sourceUrl: 'https://goodfirms.co/company/nova-mobile',
    data: {
      name: 'Nova Mobile Solutions',
      website: 'https://novamobile.dev',
      industry: 'Mobile Development',
      services: ['iOS Development', 'Android Development', 'React Native', 'Flutter'],
      teamSize: '51-200',
      country: 'India',
      publicEmail: 'contact@novamobile.dev',
      linkedInUrl: 'https://linkedin.com/company/nova-mobile-solutions',
      caseStudies: 'https://novamobile.dev/portfolio',
      hiringStatus: true,
      techStack: {
        detected: ['React Native', 'Flutter', 'Node.js', 'AWS', 'MongoDB'],
        frameworks: ['React Native', 'Flutter', 'Node.js'],
        cloud: ['AWS'],
        databases: ['MongoDB'],
        tools: ['Docker'],
      },
    },
  },
  {
    source: 'Clutch',
    sourceUrl: 'https://clutch.co/profile/helix-ai',
    data: {
      name: 'Helix AI Labs',
      website: 'https://helix-ai.dev',
      industry: 'AI / ML',
      services: ['AI Integration', 'LLM Development', 'Data Science', 'ML Engineering'],
      teamSize: '11-50',
      country: 'Netherlands',
      founderName: 'Nora Schmidt',
      founderTitle: 'CEO',
      linkedInUrl: 'https://linkedin.com/company/helix-ai-labs',
      githubOrg: 'https://github.com/helix-ai',
      blog: 'https://helix-ai.dev/blog',
      hiringStatus: false,
      techStack: {
        detected: ['Python', 'OpenAI', 'LangChain', 'React', 'PostgreSQL', 'AWS'],
        frameworks: ['Python', 'FastAPI', 'React'],
        cloud: ['AWS'],
        databases: ['PostgreSQL'],
        tools: ['Docker', 'Kubernetes'],
      },
    },
  },
  {
    source: 'Wellfound',
    sourceUrl: 'https://wellfound.com/company/sprint-digital',
    data: {
      name: 'Sprint Digital',
      website: 'https://sprintdigital.io',
      industry: 'E-commerce',
      services: ['Shopify Development', 'E-commerce Platforms', 'Headless Commerce'],
      teamSize: '11-50',
      country: 'Australia',
      publicEmail: 'hello@sprintdigital.io',
      linkedInUrl: 'https://linkedin.com/company/sprint-digital',
      hiringStatus: true,
      techStack: {
        detected: ['React', 'Next.js', 'Shopify', 'Node.js', 'PostgreSQL'],
        frameworks: ['React', 'Next.js', 'Node.js'],
        cloud: ['Vercel'],
        databases: ['PostgreSQL'],
        tools: ['Docker'],
      },
    },
  },
  {
    source: 'Clutch',
    sourceUrl: 'https://clutch.co/profile/orbit-tech',
    data: {
      name: 'Orbit Technology Partners',
      website: 'https://orbittech.co',
      industry: 'Enterprise Software',
      services: ['Enterprise Applications', '.NET Development', 'Azure Solutions', 'Microservices'],
      teamSize: '51-200',
      country: 'Poland',
      publicEmail: 'business@orbittech.co',
      linkedInUrl: 'https://linkedin.com/company/orbit-technology-partners',
      blog: 'https://orbittech.co/insights',
      caseStudies: 'https://orbittech.co/case-studies',
      hiringStatus: true,
      techStack: {
        detected: ['.NET', 'Azure', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'Kubernetes'],
        frameworks: ['.NET', 'React', 'TypeScript'],
        cloud: ['Azure'],
        databases: ['PostgreSQL'],
        tools: ['Docker', 'Kubernetes', 'CI/CD'],
      },
    },
  },
  {
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/company/nexus-digital-global',
    data: {
      name: 'Nexus Digital Global',
      website: 'https://nexusdigital.io',
      industry: 'IT Services & Software',
      services: ['Software Engineering', 'AI Solutions', 'Cloud Migration', 'Mobile Development'],
      teamSize: '51-200',
      country: 'United States',
      founderName: 'Marcus Vance',
      founderTitle: 'Managing Director',
      publicEmail: 'contact@nexusdigital.io',
      linkedInUrl: 'https://linkedin.com/company/nexus-digital-global',
      hiringStatus: true,
      techStack: {
        detected: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
        frameworks: ['React', 'Node.js', 'Python'],
        cloud: ['AWS'],
        databases: ['PostgreSQL'],
        tools: ['Docker'],
      },
    },
  },
  {
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/company/synapse-tech-agency',
    data: {
      name: 'Synapse Tech Agency',
      website: 'https://synapsetech.dev',
      industry: 'Custom Software Development',
      services: ['Full Stack Development', 'React Native', 'DevOps', 'UI/UX Design'],
      teamSize: '11-50',
      country: 'United Kingdom',
      founderName: 'Elena Rostova',
      founderTitle: 'Head of Operations',
      linkedInUrl: 'https://linkedin.com/company/synapse-tech-agency',
      hiringStatus: true,
      techStack: {
        detected: ['TypeScript', 'Next.js', 'GraphQL', 'PostgreSQL', 'Docker', 'Kubernetes'],
        frameworks: ['TypeScript', 'Next.js'],
        cloud: ['AWS'],
        databases: ['PostgreSQL'],
        tools: ['Docker', 'Kubernetes'],
      },
    },
  },
];

// ─── Orchestrator ─────────────────────────────

export class DiscoveryOrchestrator {
  private browser: Browser | null = null;
  private rateLimiter: RateLimiter;

  constructor() {
    const rps = parseFloat(process.env.SCRAPER_RPS || '1');
    this.rateLimiter = new RateLimiter(rps);
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    });
    logger.info('🎭 Playwright browser launched');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private buildCompany(partial: Partial<Company>): Company {
    return {
      name: partial.name || '',
      website: partial.website || '',
      industry: partial.industry || 'Technology',
      services: partial.services || [],
      teamSize: partial.teamSize || '',
      country: partial.country || '',
      contactPage: partial.contactPage,
      publicEmail: partial.publicEmail,
      founderName: partial.founderName,
      founderTitle: partial.founderTitle,
      linkedInUrl: partial.linkedInUrl,
      githubOrg: partial.githubOrg,
      portfolio: partial.portfolio,
      caseStudies: partial.caseStudies,
      blog: partial.blog,
      hiringStatus: partial.hiringStatus ?? false,
      techStack: partial.techStack || { detected: [], frameworks: [], cloud: [], databases: [], tools: [] },
    };
  }

  private buildLead(company: Company, source: LeadSource, sourceUrl: string): Partial<Lead> {
    return {
      company,
      source,
      sourceUrl,
      status: 'New',
      score: calculateLeadScore(company),
      outreachDrafts: [],
      notes: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async discover(config: DiscoveryConfig): Promise<Partial<Lead>[]> {
    const leads: Partial<Lead>[] = [];
    const searchTerms = config.searchTerms?.length
      ? config.searchTerms
      : ['software development agency', 'web development company'];

    logger.info('🔍 Starting lead discovery', { sources: config.sources, terms: searchTerms });

    // ─── GitHub ───────────────────────────────
    if (config.sources.includes('GitHub')) {
      for (const term of searchTerms) {
        const results = await this.rateLimiter.throttle(() => searchGitHubOrgs(term));
        for (const r of results) {
          leads.push(this.buildLead(this.buildCompany(r.company), r.source, r.sourceUrl));
        }
        await sleep(500);
      }
    }

    // ─── YC ───────────────────────────────────
    if (config.sources.includes('YC')) {
      const results = await this.rateLimiter.throttle(() => scrapeYCDirectory());
      for (const c of results) {
        leads.push(this.buildLead(this.buildCompany(c), 'YC', `https://ycombinator.com/companies`));
      }
    }

    // ─── Product Hunt ────────────────────────
    if (config.sources.includes('Product Hunt')) {
      const results = await this.rateLimiter.throttle(() => scrapeProductHunt());
      for (const c of results) {
        leads.push(this.buildLead(this.buildCompany(c), 'Product Hunt', `https://producthunt.com`));
      }
    }

    // ─── Browser-based scrapers ───────────────
    if (this.browser) {
      if (config.sources.includes('Clutch')) {
        const page = await this.browser.newPage();
        await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
        const results = await scrapeClutch(page);
        await page.close();
        for (const c of results) {
          leads.push(this.buildLead(this.buildCompany(c), 'Clutch', 'https://clutch.co'));
        }
      }

      if (config.sources.includes('LinkedIn')) {
        const page = await this.browser.newPage();
        await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
        for (const term of searchTerms) {
          const results = await scrapeLinkedInCompanies(page, term);
          for (const c of results) {
            leads.push(this.buildLead(this.buildCompany(c), 'LinkedIn', c.linkedInUrl || 'https://linkedin.com'));
          }
        }
        await page.close();
      }
    }

    // ─── Mock leads for demo mode ─────────────
    const selectedMocks = MOCK_COMPANIES.filter((m) =>
      config.sources.includes(m.source)
    );
    for (const m of selectedMocks) {
      // Avoid duplicates
      const alreadyExists = leads.some(
        (l) => l.company?.name?.toLowerCase() === m.data.name?.toLowerCase()
      );
      if (!alreadyExists) {
        leads.push(this.buildLead(this.buildCompany(m.data), m.source, m.sourceUrl));
      }
    }

    // ─── Score & sort ─────────────────────────
    for (const lead of leads) {
      if (lead.company && !lead.score?.overall) {
        lead.score = calculateLeadScore(lead.company as Company);
      }
    }

    leads.sort((a, b) => (b.score?.overall || 0) - (a.score?.overall || 0));

    logger.info(`✅ Discovery complete: ${leads.length} leads found`);
    return leads;
  }
}

// ─── runDiscovery (top-level entry) ──────────

export async function runDiscovery(config: DiscoveryConfig): Promise<{
  leads: Partial<Lead>[];
  stats: { total: number; bySource: Record<string, number> };
}> {
  const orchestrator = new DiscoveryOrchestrator();
  let leads: Partial<Lead>[] = [];

  try {
    await orchestrator.init();
    leads = await orchestrator.discover(config);
  } catch (error) {
    logger.error('Discovery orchestrator error', { error: String(error) });
    throw error;
  } finally {
    await orchestrator.close();
  }

  const bySource: Record<string, number> = {};
  for (const lead of leads) {
    const src = lead.source || 'Unknown';
    bySource[src] = (bySource[src] || 0) + 1;
  }

  return { leads, stats: { total: leads.length, bySource } };
}

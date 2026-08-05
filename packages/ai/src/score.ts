import type { Company, LeadScore } from '@leadpilot/types';

// ─── Scoring Weights ─────────────────────────
const WEIGHTS = {
  teamSize: 0.20,
  technology: 0.30,
  growth: 0.20,
  hiring: 0.20,
  activity: 0.10,
};

// ─── High-value tech signals ──────────────────
const HOT_TECHNOLOGIES = [
  'react', 'next.js', 'vue.js', 'angular', 'node.js', 'nestjs',
  'typescript', 'python', 'django', 'fastapi', 'go', 'rust',
  'aws', 'google cloud', 'azure', 'kubernetes', 'docker',
  'openai', 'anthropic', 'langchain', 'stripe', 'supabase',
];

// ─── Team Size Scoring ───────────────────────
function scoreTeamSize(teamSize: string): number {
  if (!teamSize) return 40;

  const size = teamSize.toLowerCase();

  // Pattern: "X-Y employees"
  if (size.match(/^1\s*[-–]\s*10/) || size.match(/^1\s*[-–]\s*9/)) return 55;
  if (size.match(/^10\s*[-–]\s*50/) || size.match(/^11\s*[-–]\s*50/)) return 90;
  if (size.match(/^50\s*[-–]\s*200/) || size.match(/^51\s*[-–]\s*200/)) return 88;
  if (size.match(/^200\s*[-–]\s*500/)) return 72;
  if (size.match(/500\+/) || size.match(/1000\+/)) return 38;

  // Numeric only
  const num = parseInt(size.replace(/[^0-9]/g, ''));
  if (isNaN(num)) return 40;
  if (num < 5) return 35;
  if (num <= 15) return 70;
  if (num <= 50) return 90;
  if (num <= 100) return 85;
  if (num <= 200) return 75;
  if (num <= 500) return 60;
  return 35;
}

// ─── Technology Scoring ──────────────────────
function scoreTechnology(techStack: Company['techStack']): number {
  if (!techStack) return 40;

  const allTech = [
    ...techStack.detected,
    ...techStack.frameworks,
    ...techStack.cloud,
    ...techStack.tools,
  ].map((t) => t.toLowerCase());

  if (allTech.length === 0) return 40;

  const hotMatches = allTech.filter((t) =>
    HOT_TECHNOLOGIES.some((hot) => t.includes(hot) || hot.includes(t))
  ).length;

  // Base 40, +10 per hot tech match, max 100
  return Math.min(100, 40 + hotMatches * 10);
}

// ─── Growth Scoring ──────────────────────────
function scoreGrowth(company: Company): number {
  let score = 40;
  if (company.blog) score += 20;
  if (company.caseStudies) score += 15;
  if (company.portfolio) score += 15;
  if (company.githubOrg) score += 10;
  return Math.min(100, score);
}

// ─── Hiring Scoring ──────────────────────────
function scoreHiring(company: Company): number {
  return company.hiringStatus ? 95 : 35;
}

// ─── Activity / Reachability Scoring ─────────
function scoreActivity(company: Company): number {
  let score = 30;
  if (company.website) score += 20;
  if (company.linkedInUrl) score += 20;
  if (company.publicEmail) score += 15;
  if (company.contactPage) score += 10;
  if (company.githubOrg) score += 10;
  return Math.min(100, score);
}

// ─── Main Scoring Function ───────────────────
export function calculateLeadScore(company: Company): LeadScore {
  const teamSizeScore = scoreTeamSize(company.teamSize);
  const technologyScore = scoreTechnology(company.techStack);
  const growthScore = scoreGrowth(company);
  const hiringScore = scoreHiring(company);
  const activityScore = scoreActivity(company);

  const overall = Math.round(
    teamSizeScore * WEIGHTS.teamSize +
    technologyScore * WEIGHTS.technology +
    growthScore * WEIGHTS.growth +
    hiringScore * WEIGHTS.hiring +
    activityScore * WEIGHTS.activity
  );

  // Confidence = how much info we have (0–100)
  const filledFields = [
    company.teamSize,
    company.country,
    company.publicEmail,
    company.linkedInUrl,
    company.techStack.detected.length > 0,
    company.hiringStatus !== undefined,
  ].filter(Boolean).length;

  const confidence = Math.round((filledFields / 6) * 100);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    confidence,
    breakdown: {
      teamSize: teamSizeScore,
      technology: technologyScore,
      growth: growthScore,
      hiring: hiringScore,
      activity: activityScore,
    },
  };
}

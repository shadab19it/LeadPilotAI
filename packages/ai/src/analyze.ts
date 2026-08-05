import OpenAI from 'openai';
import type { Company, AIAnalysis } from '@leadpilot/types';

// ─── Multi-Provider AI Client ─────────────────────────────────────────────────
//
// Supported providers via .env:
//
//   PROVIDER       | AI_PROVIDER  | AI_BASE_URL
//   ─────────────────────────────────────────────────────────────────────────────
//   OpenAI         | openai       | (leave blank — default)
//   Gemini         | gemini       | https://generativelanguage.googleapis.com/v1beta/openai/
//   DeepSeek       | deepseek     | https://api.deepseek.com
//   Grok (xAI)     | grok         | https://api.x.ai/v1
//   Groq (Llama)   | groq         | https://api.groq.com/openai/v1
//   Together AI    | together     | https://api.together.xyz/v1
//   Ollama (local) | ollama       | http://localhost:11434/v1
//
// Example .env for DeepSeek:
//   AI_PROVIDER=deepseek
//   AI_API_KEY=sk-your-deepseek-key
//   AI_MODEL=deepseek-chat
//
// Example .env for Gemini:
//   AI_PROVIDER=gemini
//   AI_API_KEY=AIza-your-gemini-key
//   AI_MODEL=gemini-1.5-flash
//
// Example .env for Grok:
//   AI_PROVIDER=grok
//   AI_API_KEY=xai-your-grok-key
//   AI_MODEL=grok-beta
//
// If none of these are set, falls back to OPENAI_API_KEY for backwards compatibility.

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai:   '',                                                               // uses OpenAI default
  gemini:   'https://generativelanguage.googleapis.com/v1beta/openai/',
  deepseek: 'https://api.deepseek.com',
  grok:     'https://api.x.ai/v1',
  groq:     'https://api.groq.com/openai/v1',
  together: 'https://api.together.xyz/v1',
  ollama:   'http://localhost:11434/v1',
};

const DEFAULT_MODELS: Record<string, string> = {
  openai:   'gpt-4o-mini',
  gemini:   'gemini-1.5-flash',
  deepseek: 'deepseek-chat',
  grok:     'grok-beta',
  groq:     'llama3-8b-8192',
  together: 'meta-llama/Llama-3-8b-chat-hf',
  ollama:   'llama3',
};

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  // Resolve API key — AI_API_KEY takes priority, then legacy OPENAI_API_KEY
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';

  if (!apiKey || apiKey.startsWith('sk-your') || apiKey.startsWith('AIza-your') || apiKey.startsWith('xai-your')) {
    return null;
  }

  if (!_client) {
    const provider   = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    const customUrl  = process.env.AI_BASE_URL;
    const baseURL    = customUrl || PROVIDER_BASE_URLS[provider] || '';

    _client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
  }

  return _client;
}

function getModel(): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  return DEFAULT_MODELS[provider] || 'gpt-4o-mini';
}

// ─── Mock Analysis (fallback) ─────────────────

function generateMockAnalysis(company: Company): AIAnalysis {
  const isHiring = company.hiringStatus;
  const hasModernTech = company.techStack.frameworks.some((t) =>
    ['React', 'Next.js', 'Vue.js', 'Node.js', 'Python'].includes(t)
  );

  const likelihood: AIAnalysis['outsourcingLikelihood'] =
    isHiring && hasModernTech ? 'Very High' : isHiring ? 'High' : hasModernTech ? 'High' : 'Medium';

  const services = company.services.slice(0, 3).join(', ') || 'digital solutions';

  return {
    summary: `${company.name} is a ${company.teamSize || 'growing'} ${company.industry || 'technology'} company based in ${company.country || 'their region'}, specializing in ${services}. They appear to be a ${hasModernTech ? 'technically sophisticated' : 'established'} organization with strong market presence.`,
    businessModel: company.services.some((s) => /saas|platform|software/i.test(s))
      ? 'B2B SaaS / Software Platform'
      : 'B2B Services / Digital Agency',
    targetCustomers: `Mid-market and enterprise clients seeking ${company.services[0] || 'technology'} solutions`,
    technologies: company.techStack.detected.slice(0, 6).join(', ') || 'Modern web stack',
    growthSignals: [
      ...(company.blog ? ['Maintains an active company blog'] : []),
      ...(isHiring ? ['Actively recruiting engineering talent'] : []),
      ...(company.githubOrg ? ['Open-source presence on GitHub'] : []),
      ...(company.caseStudies ? ['Published case studies and client success stories'] : []),
      'Growing portfolio and market presence',
    ].slice(0, 4),
    hiringSignals: isHiring
      ? [
          'Engineering roles actively posted',
          'Team expansion in progress',
          'Investment in technical capabilities',
        ]
      : ['Team appears stable at current size'],
    outsourcingLikelihood: likelihood,
    collaborationOpportunities: [
      'Staff augmentation for ongoing projects',
      'Dedicated development team partnerships',
      'Technical consulting and architecture reviews',
      'Specialized skill augmentation (AI, mobile, DevOps)',
    ],
    bestOutreachAngle: `Position as a strategic development partner who can help ${company.name} accelerate delivery without the overhead of full-time hiring. Emphasize quick ramp-up, technical expertise in ${company.techStack.frameworks[0] || 'their stack'}, and flexible engagement models.`,
  };
}

// ─── Real OpenAI Analysis ─────────────────────

export async function analyzeCompany(company: Company): Promise<AIAnalysis> {
  const openai = getClient();

  if (!openai) {
    return generateMockAnalysis(company);
  }

  const prompt = `You are a B2B lead intelligence analyst. Analyze this company for software development outsourcing opportunities.

COMPANY DATA:
- Name: ${company.name}
- Website: ${company.website}
- Industry: ${company.industry}
- Services: ${company.services.join(', ')}
- Team Size: ${company.teamSize}
- Country: ${company.country}
- Technologies: ${company.techStack.detected.join(', ')}
- Hiring: ${company.hiringStatus ? 'Yes' : 'No'}
- Has Blog: ${company.blog ? 'Yes' : 'No'}
- Has GitHub: ${company.githubOrg ? 'Yes' : 'No'}

Respond with a JSON object containing exactly these fields:
{
  "summary": "2-3 sentence company overview",
  "businessModel": "B2B/B2C/SaaS/Agency/etc",
  "targetCustomers": "who they serve",
  "technologies": "their tech stack in plain English",
  "growthSignals": ["signal1", "signal2", "signal3"],
  "hiringSignals": ["signal1", "signal2"],
  "outsourcingLikelihood": "Very High|High|Medium|Low",
  "collaborationOpportunities": ["opp1", "opp2", "opp3"],
  "bestOutreachAngle": "single best personalized outreach angle"
}

Only return valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: getModel(),
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty OpenAI response');

    return JSON.parse(content) as AIAnalysis;
  } catch (error) {
    console.error('OpenAI analysis failed, using mock:', error);
    return generateMockAnalysis(company);
  }
}

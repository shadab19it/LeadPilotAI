import OpenAI from 'openai';
import type { Company, AIAnalysis, OutreachDraft, OutreachType } from '@leadpilot/types';

// Re-uses the same provider resolution as analyze.ts
const PROVIDER_BASE_URLS: Record<string, string> = {
  openai:   '',
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
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
  if (!apiKey || apiKey.startsWith('sk-your') || apiKey.startsWith('AIza-your') || apiKey.startsWith('xai-your')) {
    return null;
  }
  if (!_client) {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    const baseURL  = process.env.AI_BASE_URL || PROVIDER_BASE_URLS[provider] || '';
    _client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  }
  return _client;
}

function getModel(): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  return DEFAULT_MODELS[provider] || 'gpt-4o-mini';
}

// ─── Mock Outreach Drafts ─────────────────────

function generateMockDrafts(company: Company, analysis?: AIAnalysis): OutreachDraft[] {
  const founderFirst = company.founderName?.split(' ')[0] || 'there';
  const name = company.name;
  const industry = company.industry || 'tech';
  const service = company.services[0] || 'digital solutions';
  const angle = analysis?.bestOutreachAngle || 'development partnership';

  return [
    {
      type: 'linkedin_connection',
      content: `Hi ${founderFirst}, I came across ${name} and was genuinely impressed by your work in ${industry}. We help agencies like yours scale engineering capacity on demand. Would love to connect!`,
      generatedAt: new Date(),
    },
    {
      type: 'linkedin_followup',
      content: `Hi ${founderFirst}, thanks for connecting! I noticed ${name} is ${company.hiringStatus ? 'actively growing your team' : 'doing great work in ' + industry}. We specialize in providing vetted remote development teams to growing agencies — no long-term commitments. Would a 15-minute call make sense this week?`,
      generatedAt: new Date(),
    },
    {
      type: 'cold_email',
      subject: `Scaling ${name}'s engineering capacity`,
      content: `Hi ${founderFirst},\n\nI came across ${name} while researching ${industry} companies and was impressed by your ${service} work.\n\nWe help growing agencies like yours scale their development capacity with vetted remote engineers — without the overhead of full-time hiring.\n\nSome of our recent results:\n• 40% faster time-to-hire vs traditional recruiting\n• Teams operational within 2 weeks\n• Flexible engagement (scale up or down monthly)\n\nWould you be open to a 15-minute call to see if there's a fit?\n\nBest,\n[Your Name]\n[Your Company] | [Phone]`,
      generatedAt: new Date(),
    },
    {
      type: 'followup_email',
      subject: `Re: Scaling ${name}'s engineering capacity`,
      content: `Hi ${founderFirst},\n\nJust following up on my previous email — I know your inbox is busy!\n\nI wanted to share a quick case study: We recently helped a ${industry} agency similar to ${name} build a 6-person React + Node.js team in under 3 weeks. They shipped their product on time and saved ~35% vs local hiring.\n\nIf you ever find yourself in a crunch — new client, tight deadline, hard-to-hire role — we'd love to be your first call.\n\nIs there a better time to connect?\n\nBest,\n[Your Name]`,
      generatedAt: new Date(),
    },
    {
      type: 'contact_form',
      content: `Hi, I'm reaching out about a potential development partnership. We help ${industry} companies like ${name} scale their engineering teams with vetted remote developers — quickly and cost-effectively. We'd love to explore how we can support your growth. Please feel free to reply or visit [your website] to learn more. Best regards, [Your Name] from [Your Company].`,
      generatedAt: new Date(),
    },
    {
      type: 'discovery_call',
      content: `"Hi ${founderFirst}, this is [Your Name] from [Your Company]. I'm calling because we specialize in helping ${industry} agencies like ${name} scale their engineering teams on demand.\n\n[If they say go ahead]: Great! I'll be brief. We provide vetted remote development teams — typically within 2 weeks. No long-term contracts. We handle recruitment, vetting, and HR. You just direct the work.\n\nI noticed ${name} is ${company.hiringStatus ? 'currently hiring engineers' : 'growing in the ' + industry + ' space'}, so I thought this might be timely. Do you have 10 minutes right now, or would another time work better?"`,
      generatedAt: new Date(),
    },
  ];
}

// ─── AI Outreach Generation ───────────────────

async function generateSingleDraft(
  openai: OpenAI,
  company: Company,
  analysis: AIAnalysis | undefined,
  type: OutreachType,
  instruction: string
): Promise<OutreachDraft | null> {
  const context = `
Company: ${company.name} | Industry: ${company.industry} | Country: ${company.country}
Services: ${company.services.slice(0, 3).join(', ')} | Team: ${company.teamSize}
Tech: ${company.techStack.detected.slice(0, 5).join(', ')}
Hiring: ${company.hiringStatus ? 'Yes' : 'No'} | Founder: ${company.founderName || 'Unknown'}
Best angle: ${analysis?.bestOutreachAngle || 'development partnership'}
`;

  try {
    const response = await openai.chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: 'system',
          content:
            'You are a senior business development professional writing personalized outreach for a software development agency. Be conversational, specific, and avoid clichés.',
        },
        {
          role: 'user',
          content: `${context}\n\n${instruction}\n\nRespond with JSON: { "subject": "...", "content": "..." } — subject is optional.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.85,
      max_tokens: 500,
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    if (!parsed.content) return null;

    return {
      type,
      subject: parsed.subject,
      content: parsed.content,
      generatedAt: new Date(),
    };
  } catch {
    return null;
  }
}

export async function generateOutreachDrafts(
  company: Company,
  analysis?: AIAnalysis
): Promise<OutreachDraft[]> {
  const openai = getClient();

  if (!openai) {
    return generateMockDrafts(company, analysis);
  }

  const draftsConfig: Array<{ type: OutreachType; instruction: string }> = [
    {
      type: 'linkedin_connection',
      instruction:
        'Write a LinkedIn connection request message. Max 300 characters. Personal, reference something specific about their company. No direct pitch.',
    },
    {
      type: 'cold_email',
      instruction:
        'Write a cold email with a compelling subject line. Mention something specific about their company/tech. Include 3 bullet points of value and a soft CTA. Max 180 words.',
    },
    {
      type: 'contact_form',
      instruction:
        'Write a contact form message. Professional, specific to their needs. Max 80 words.',
    },
  ];

  const aiDrafts = await Promise.all(
    draftsConfig.map(({ type, instruction }) =>
      generateSingleDraft(openai, company, analysis, type, instruction)
    )
  );

  const successfulAiDrafts = aiDrafts.filter((d): d is OutreachDraft => d !== null);
  const aiTypes = successfulAiDrafts.map((d) => d.type);

  // Fill in remaining with mock drafts
  const mockDrafts = generateMockDrafts(company, analysis).filter(
    (d) => !aiTypes.includes(d.type)
  );

  return [...successfulAiDrafts, ...mockDrafts];
}

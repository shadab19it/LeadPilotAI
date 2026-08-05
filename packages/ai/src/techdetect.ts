import type { TechStack } from '@leadpilot/types';

// ─── Technology Patterns ─────────────────────

const TECH_PATTERNS: Record<string, RegExp[]> = {
  // Frontend
  'React': [/\breact\b/i, /reactjs/i],
  'Next.js': [/next\.js/i, /nextjs/i],
  'Vue.js': [/\bvue\b/i, /vuejs/i, /nuxt/i],
  'Angular': [/\bangular\b/i],
  'Svelte': [/\bsvelte\b/i],
  'TypeScript': [/typescript/i, /\bts\b/i],
  // Backend
  'Node.js': [/node\.js/i, /nodejs/i, /\bnode\b.*server/i],
  'Express': [/\bexpress\b/i],
  'NestJS': [/nestjs/i, /nest\.js/i],
  'Python': [/\bpython\b/i],
  'Django': [/\bdjango\b/i],
  'FastAPI': [/fastapi/i],
  'Flask': [/\bflask\b/i],
  'Laravel': [/\blaravel\b/i],
  'Ruby on Rails': [/ruby on rails/i, /\brails\b/i],
  'Java': [/\bjava\b/i],
  'Spring Boot': [/spring boot/i, /springframework/i],
  '.NET': [/\b\.net\b/i, /asp\.net/i, /dotnet/i, /csharp/i, /c#/i],
  'Go': [/\bgolang\b/i, /\bgo\b.*language/i],
  'Rust': [/\brust\b/i],
  'PHP': [/\bphp\b/i],
  // Cloud
  'AWS': [/\baws\b/i, /amazon web services/i, /\bs3\b/i, /\bec2\b/i, /\blambda\b/i, /\bcloudfront\b/i],
  'Google Cloud': [/\bgcp\b/i, /google cloud/i, /\bgke\b/i, /\bfirebase\b/i],
  'Azure': [/\bazure\b/i, /microsoft azure/i],
  'Vercel': [/\bvercel\b/i],
  'Netlify': [/\bnetlify\b/i],
  'DigitalOcean': [/digitalocean/i],
  // Databases
  'PostgreSQL': [/postgres/i, /postgresql/i],
  'MongoDB': [/\bmongodb\b/i, /\bmongoose\b/i],
  'MySQL': [/\bmysql\b/i],
  'Redis': [/\bredis\b/i],
  'Elasticsearch': [/elasticsearch/i],
  'Supabase': [/\bsupabase\b/i],
  'PlanetScale': [/planetscale/i],
  // DevOps
  'Docker': [/\bdocker\b/i],
  'Kubernetes': [/\bkubernetes\b/i, /\bk8s\b/i],
  'Terraform': [/\bterraform\b/i],
  'CI/CD': [/github actions/i, /gitlab ci/i, /circleci/i, /\bjenkins\b/i],
  // AI/ML
  'OpenAI': [/\bopenai\b/i, /\bchatgpt\b/i, /\bgpt-/i],
  'Anthropic': [/\banthropic\b/i, /\bclaude\b/i],
  'LangChain': [/langchain/i],
  'HuggingFace': [/huggingface/i, /hugging face/i],
  // Payments & Commerce
  'Stripe': [/\bstripe\b/i],
  'Shopify': [/\bshopify\b/i],
  // Mobile
  'React Native': [/react native/i],
  'Flutter': [/\bflutter\b/i],
  'Swift': [/\bswift\b/i, /\bios\b/i],
};

const CLOUD_TECH = ['AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'DigitalOcean'];
const DB_TECH = ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'Supabase', 'PlanetScale'];
const DEVOPS_TECH = ['Docker', 'Kubernetes', 'Terraform', 'CI/CD'];

export function detectTechnologies(text: string): TechStack {
  if (!text) {
    return { detected: [], frameworks: [], cloud: [], databases: [], tools: [] };
  }

  const detected: string[] = [];
  const frameworks: string[] = [];
  const cloud: string[] = [];
  const databases: string[] = [];
  const tools: string[] = [];

  for (const [tech, patterns] of Object.entries(TECH_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) {
      detected.push(tech);

      if (CLOUD_TECH.includes(tech)) {
        cloud.push(tech);
      } else if (DB_TECH.includes(tech)) {
        databases.push(tech);
      } else if (DEVOPS_TECH.includes(tech)) {
        tools.push(tech);
      } else {
        frameworks.push(tech);
      }
    }
  }

  return { detected, frameworks, cloud, databases, tools };
}

export function mergeTechStacks(...stacks: Partial<TechStack>[]): TechStack {
  const merged: TechStack = { detected: [], frameworks: [], cloud: [], databases: [], tools: [] };

  for (const stack of stacks) {
    for (const key of Object.keys(merged) as (keyof TechStack)[]) {
      const items = stack[key] || [];
      for (const item of items) {
        if (!merged[key].includes(item)) {
          merged[key].push(item);
        }
      }
    }
  }

  return merged;
}

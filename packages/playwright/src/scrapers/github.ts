import type { Company, LeadSource } from '@leadpilot/types';
import { detectTechnologies } from '@leadpilot/ai';

export interface GitHubScrapeResult {
  company: Partial<Company>;
  sourceUrl: string;
  source: LeadSource;
}

const GH_HEADERS = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'LeadPilot-AI/1.0 (lead-intelligence)',
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function ghFetch(url: string): Promise<Response> {
  return fetch(url, { headers: GH_HEADERS });
}

export async function searchGitHubOrgs(query: string): Promise<GitHubScrapeResult[]> {
  const results: GitHubScrapeResult[] = [];

  try {
    const searchUrl = `https://api.github.com/search/users?q=${encodeURIComponent(query)}+type:org&per_page=15&sort=repositories`;
    const res = await ghFetch(searchUrl);

    if (!res.ok) {
      console.warn(`GitHub search HTTP ${res.status} — may be rate limited`);
      return results;
    }

    const data = (await res.json()) as { items?: Array<{ login: string }> };
    const orgs = data.items || [];

    for (const org of orgs.slice(0, 8)) {
      try {
        const orgRes = await ghFetch(`https://api.github.com/orgs/${org.login}`);
        if (!orgRes.ok) continue;

        const orgData = (await orgRes.json()) as {
          name?: string;
          description?: string;
          blog?: string;
          email?: string;
          location?: string;
          public_repos?: number;
          public_members_count?: number;
        };

        const techText = `${orgData.description || ''} ${orgData.blog || ''}`;
        const techStack = detectTechnologies(techText);

        results.push({
          company: {
            name: orgData.name || org.login,
            website: orgData.blog
              ? orgData.blog.startsWith('http')
                ? orgData.blog
                : `https://${orgData.blog}`
              : `https://github.com/${org.login}`,
            country: orgData.location || '',
            teamSize: orgData.public_members_count
              ? `${orgData.public_members_count}+ (GitHub)`
              : '',
            industry: 'Technology',
            services: ['Software Development', 'Open Source'],
            publicEmail: orgData.email || '',
            githubOrg: `https://github.com/${org.login}`,
            hiringStatus: false,
            techStack,
          },
          sourceUrl: `https://github.com/${org.login}`,
          source: 'GitHub',
        });
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error('GitHub scraping failed:', error);
  }

  return results;
}

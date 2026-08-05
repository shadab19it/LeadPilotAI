import type { Company } from '@leadpilot/types';
import { detectTechnologies } from '@leadpilot/ai';

export interface YCCompany {
  name: string;
  website: string;
  batch: string;
  description: string;
  industry: string;
}

export async function scrapeYCDirectory(): Promise<Partial<Company>[]> {
  const results: Partial<Company>[] = [];

  try {
    // YC has a public companies endpoint (unofficial but stable)
    const res = await fetch(
      'https://www.ycombinator.com/companies.json',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LeadPilot/1.0)',
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      console.warn('YC directory fetch failed, using seed data');
      return getYCSeedData();
    }

    const data = (await res.json()) as any;
    const companies = (data.companies || []).slice(0, 30);

    for (const c of companies) {
      results.push({
        name: c.name || '',
        website: c.url || '',
        industry: c.vertical || c.industry || 'Technology',
        services: [c.vertical || 'Software'],
        teamSize: c.team_size ? `${c.team_size}` : '',
        country: c.country || 'United States',
        hiringStatus: !!c.is_hiring,
        techStack: detectTechnologies(c.description || ''),
      });
    }
  } catch (error) {
    console.error('YC scraping failed:', error);
    return getYCSeedData();
  }

  return results.length ? results : getYCSeedData();
}

function getYCSeedData(): Partial<Company>[] {
  return [
    {
      name: 'Airbnb',
      website: 'https://airbnb.com',
      industry: 'Travel / Marketplace',
      services: ['Platform', 'Marketplace'],
      teamSize: '5000+',
      country: 'United States',
      hiringStatus: true,
      techStack: detectTechnologies('React, Ruby on Rails, Java, AWS'),
    },
    {
      name: 'Stripe',
      website: 'https://stripe.com',
      industry: 'Fintech',
      services: ['Payment Processing', 'Financial Infrastructure'],
      teamSize: '8000+',
      country: 'United States',
      hiringStatus: true,
      techStack: detectTechnologies('Ruby, Go, React, AWS, PostgreSQL'),
    },
  ];
}

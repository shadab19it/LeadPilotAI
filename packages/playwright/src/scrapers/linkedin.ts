import type { Page } from 'playwright';
import type { Company } from '@leadpilot/types';
import { detectTechnologies } from '@leadpilot/ai';
import { sleep } from '@leadpilot/lib';

export async function scrapeLinkedInCompanies(
  page: Page,
  query: string
): Promise<Partial<Company>[]> {
  const results: Partial<Company>[] = [];

  try {
    // Search LinkedIn company profiles via Google dorking to bypass login requirement
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `site:linkedin.com/company/ "${query}" software OR agency OR dev`
    )}&num=15`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    const companies = await page.evaluate(() => {
      const items = document.querySelectorAll('div.g, div[data-hveid]');
      const found: Array<{ name: string; url: string; snippet: string }> = [];

      items.forEach((item: Element) => {
        const linkEl = item.querySelector('a[href*="linkedin.com/company/"]') as HTMLAnchorElement | null;
        const titleEl = item.querySelector('h3');
        const snippetEl = item.querySelector('.VwiC3b, [data-sncf], .s3v9rd');

        if (linkEl && linkEl.href && titleEl) {
          const rawTitle = titleEl.textContent?.trim() || '';
          const name = rawTitle.replace(/\s*\|\s*LinkedIn.*$/i, '').replace(/\s*-\s*LinkedIn.*$/i, '').trim();

          if (name && !found.some((f) => f.url === linkEl.href)) {
            found.push({
              name,
              url: linkEl.href,
              snippet: snippetEl?.textContent?.trim() || '',
            });
          }
        }
      });

      return found;
    });

    for (const c of companies.slice(0, 10)) {
      const techStack = detectTechnologies(c.snippet);
      results.push({
        name: c.name,
        website: `https://www.linkedin.com/company/${c.url.split('/company/')[1]?.split('/')[0] || ''}`,
        linkedInUrl: c.url,
        industry: 'Software & Technology',
        services: ['Software Development', 'IT Consulting'],
        teamSize: '11-50',
        country: 'Global',
        hiringStatus: c.snippet.toLowerCase().includes('hiring') || c.snippet.toLowerCase().includes('jobs'),
        techStack,
      });
    }
  } catch (error) {
    console.error('LinkedIn company search failed:', error);
  }

  return results;
}

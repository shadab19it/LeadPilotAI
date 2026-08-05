import type { Page } from 'playwright';
import type { Company } from '@leadpilot/types';
import { sleep } from '@leadpilot/lib';
import { detectTechnologies } from '@leadpilot/ai';

export async function scrapeGoodFirms(page: Page): Promise<Partial<Company>[]> {
  const results: Partial<Company>[] = [];

  try {
    await page.goto('https://www.goodfirms.co/directory/platform/app-development', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await sleep(2500);

    const companies = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="company-block"], .company-listing-wrapper, [class*="firm"]');
      const data: any[] = [];

      cards.forEach((card: Element) => {
        const name =
          card.querySelector('h2 a, h3 a, .company-name a')?.textContent?.trim();
        const website =
          card.querySelector('a[href*="http"]')?.getAttribute('href') || '';
        const location =
          card.querySelector('[class*="location"], [class*="country"]')?.textContent?.trim();
        const employees =
          card.querySelector('[class*="emp"], [class*="size"]')?.textContent?.trim();
        const desc =
          card.querySelector('p, [class*="desc"]')?.textContent?.trim();

        if (name) {
          data.push({ name, website, location, employees, desc });
        }
      });

      return data;
    });

    for (const c of companies.slice(0, 20)) {
      results.push({
        name: c.name,
        website: c.website || '',
        country: c.location?.split(',')?.[1]?.trim() || c.location || '',
        teamSize: c.employees || '',
        industry: 'Software Development',
        services: ['Web Development', 'Mobile Development', 'Software Development'],
        hiringStatus: false,
        techStack: detectTechnologies(c.desc || ''),
      });
    }
  } catch (error) {
    console.error('GoodFirms scraping failed:', error);
  }

  return results;
}

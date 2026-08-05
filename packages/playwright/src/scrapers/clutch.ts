import type { Page } from 'playwright';
import type { Company } from '@leadpilot/types';
import { sleep } from '@leadpilot/lib';
import { detectTechnologies } from '@leadpilot/ai';

export async function scrapeClutch(page: Page, page_num = 1): Promise<Partial<Company>[]> {
  const results: Partial<Company>[] = [];

  try {
    const url = `https://clutch.co/it-services?page=${page_num - 1}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    const companies = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="provider"], .provider-info-block');
      const data: any[] = [];

      cards.forEach((card: Element) => {
        const name =
          card.querySelector('h3 a, .company-name a, [class*="company_name"]')?.textContent?.trim() ||
          card.querySelector('h3')?.textContent?.trim();
        const website = card
          .querySelector('a[href*="http"]')
          ?.getAttribute('href')
          ?.split('?')[0];
        const location = card.querySelector('[class*="location"], .locality')?.textContent?.trim();
        const teamSize = card.querySelector('[class*="employee"], [class*="size"]')?.textContent?.trim();
        const tagline = card.querySelector('[class*="tagline"], p')?.textContent?.trim();
        const services = Array.from(card.querySelectorAll('[class*="services"] li, [class*="focus"] li'))
          .map((el) => el.textContent?.trim())
          .filter(Boolean)
          .slice(0, 5);

        if (name && name.length > 1) {
          data.push({ name, website, location, teamSize, tagline, services });
        }
      });

      return data;
    });

    for (const c of companies.slice(0, 25)) {
      results.push({
        name: c.name,
        website: c.website || '',
        country: c.location?.split(',')?.[1]?.trim() || c.location || '',
        teamSize: c.teamSize || '',
        industry: 'IT Services / Digital Agency',
        services: c.services?.length ? c.services : ['Web Development', 'Software Development'],
        hiringStatus: false,
        techStack: detectTechnologies(c.tagline || ''),
      });
    }
  } catch (error) {
    console.error('Clutch scraping failed:', error);
  }

  return results;
}

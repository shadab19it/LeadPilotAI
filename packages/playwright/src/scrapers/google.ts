import type { Page } from 'playwright';
import type { Company, LeadSource } from '@leadpilot/types';
import { detectTechnologies } from '@leadpilot/ai';
import { sleep } from '@leadpilot/lib';

export interface ScrapedCompany {
  company: Partial<Company>;
  sourceUrl: string;
  source: LeadSource;
}

export async function googleSearchLeads(
  page: Page,
  query: string,
  maxResults = 10
): Promise<Array<{ url: string; title: string; snippet: string }>> {
  const results: Array<{ url: string; title: string; snippet: string }> = [];

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=20`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    const searchResults = await page.evaluate(() => {
      const items = document.querySelectorAll('div.g, div[data-hveid]');
      const found: Array<{ url: string; title: string; snippet: string }> = [];

      items.forEach((item) => {
        const titleEl = item.querySelector('h3');
        const linkEl = item.querySelector('a[href]') as HTMLAnchorElement | null;
        const snippetEl = item.querySelector('.VwiC3b, [data-sncf], .s3v9rd');

        if (titleEl && linkEl && linkEl.href && !linkEl.href.includes('google.com')) {
          found.push({
            url: linkEl.href,
            title: titleEl.textContent?.trim() || '',
            snippet: snippetEl?.textContent?.trim() || '',
          });
        }
      });

      return found;
    });

    results.push(...searchResults.slice(0, maxResults));
  } catch (error) {
    console.error('Google search failed:', error);
  }

  return results;
}

export async function scrapeCompanyWebsite(
  page: Page,
  url: string
): Promise<Partial<Company>> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(1500);

    const data = await page.evaluate(() => {
      const getMetaContent = (name: string) => {
        const el =
          document.querySelector(`meta[name="${name}"]`) ||
          document.querySelector(`meta[property="${name}"]`);
        return el?.getAttribute('content') || '';
      };

      const bodyText = document.body?.innerText || '';
      const descriptionEl = document.querySelector('.description, .about, [class*="about"]');

      return {
        bodyText: bodyText.slice(0, 3000),
        description: getMetaContent('description') || getMetaContent('og:description') || descriptionEl?.textContent?.slice(0, 500) || '',
        title: document.title || '',
        hasContactPage: !!document.querySelector('a[href*="contact"]'),
        hasBlog: !!document.querySelector('a[href*="blog"]') || !!document.querySelector('a[href*="articles"]'),
        emails: Array.from(document.querySelectorAll('a[href^="mailto:"]'))
          .map((a: Element) => (a as HTMLAnchorElement).getAttribute('href')?.replace('mailto:', '') || '')
          .filter(Boolean)
          .slice(0, 3),
        linkedInLinks: Array.from(document.querySelectorAll('a[href*="linkedin.com"]'))
          .map((a: Element) => (a as HTMLAnchorElement).getAttribute('href') || '')
          .filter((h: string) => h.includes('/company/') || h.includes('/in/'))
          .slice(0, 2),
        githubLinks: Array.from(document.querySelectorAll('a[href*="github.com"]'))
          .map((a: Element) => (a as HTMLAnchorElement).getAttribute('href') || '')
          .filter(Boolean)
          .slice(0, 1),
      };
    });

    const techStack = detectTechnologies(
      `${data.bodyText} ${data.description} ${data.title}`
    );

    return {
      techStack,
      contactPage: data.hasContactPage ? `${url}/contact` : undefined,
      blog: data.hasBlog ? `${url}/blog` : undefined,
      publicEmail: data.emails[0],
      linkedInUrl: data.linkedInLinks[0],
      githubOrg: data.githubLinks[0],
    };
  } catch {
    return {};
  }
}

import type { Company } from '@leadpilot/types';
import { detectTechnologies } from '@leadpilot/ai';

export async function scrapeProductHunt(): Promise<Partial<Company>[]> {
  const results: Partial<Company>[] = [];

  try {
    // ProductHunt's unofficial daily leaderboard via their public API
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(
      `https://www.producthunt.com/frontend/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; LeadPilot/1.0)',
        },
        body: JSON.stringify({
          query: `{
            posts(first: 20, order: VOTES) {
              edges {
                node {
                  name
                  tagline
                  website
                  user { name }
                  topics { edges { node { name } } }
                }
              }
            }
          }`,
        }),
      }
    );

    if (!res.ok) return results;

    const data = (await res.json()) as any;
    const posts = data?.data?.posts?.edges || [];

    for (const edge of posts) {
      const post = edge.node;
      if (!post.name) continue;

      const topics = post.topics?.edges?.map((e: any) => e.node.name) || [];
      results.push({
        name: post.name,
        website: post.website || '',
        industry: topics[0] || 'Technology',
        services: topics.slice(0, 3),
        teamSize: '',
        country: '',
        hiringStatus: false,
        founderName: post.user?.name,
        techStack: detectTechnologies(`${post.tagline} ${topics.join(' ')}`),
      });
    }
  } catch (error) {
    console.error('ProductHunt scraping failed:', error);
  }

  return results;
}

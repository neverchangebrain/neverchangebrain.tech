import { env } from '@/env';

const REVALIDATE_SECONDS = 60 * 60;

const cacheHeaders = {
  'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${60 * 60 * 24}`,
};

export async function GET() {
  const apiKey = env.WAKATIME_API_KEY;

  try {
    const res = await fetch('https://wakatime.com/api/v1/users/neverchangebrain/stats', {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data as any)?.error || 'Failed to fetch WakaTime stats';
      return new Response(JSON.stringify({ error: message }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...cacheHeaders },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cacheHeaders },
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch WakaTime stats';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cacheHeaders },
    });
  }
}

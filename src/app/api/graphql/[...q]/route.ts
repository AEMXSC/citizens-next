import type { NextRequest } from 'next/server';
import { getAemConfig } from '@/lib/aem-config';

// Server-side proxy for client-side persisted-query reads. A client component
// calls /api/graphql/execute.json/<prefix>/<name>;params and this handler
// forwards it to AEM publish, attaching the bearer token when the tenant is
// gated. This removes the standalone Cloudflare worker the NYL app needed just
// to add CORS, and wires auth in from day one.

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ q: string[] }> },
): Promise<Response> {
  const { q } = await ctx.params;
  const config = getAemConfig();

  if (!config.publish) {
    return Response.json(
      { error: 'AEM_PUBLISH is not configured' },
      { status: 500, headers: { 'access-control-allow-origin': '*' } },
    );
  }

  // Rebuild the AEM path. Matrix params containing slashes (e.g. ;path=/content
  // /dam/..) arrive split across segments; join('/') restores them exactly.
  const aemPath = `/graphql/${q.join('/')}`;
  const target = `${config.publish}${aemPath}${req.nextUrl.search}`;

  const headers: Record<string, string> = { accept: 'application/json' };
  if (config.token) {
    headers.authorization = `Bearer ${config.token}`;
  }

  try {
    const upstream = await fetch(target, { headers, cache: 'no-store' });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store',
      },
    });
  } catch (err) {
    return Response.json(
      { error: 'Upstream AEM request failed', detail: String(err) },
      { status: 502, headers: { 'access-control-allow-origin': '*' } },
    );
  }
}

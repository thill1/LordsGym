/**
 * Cloudflare Pages Function: Public Supabase runtime config
 *
 * Returns public Supabase settings from runtime env so browser clients can
 * recover from stale build-time config.
 *
 * GET /api/public-supabase-config
 */
export async function onRequestGet(context: any) {
  const appOrigin = new URL(context.request.url).origin;
  const requestOrigin = context.request.headers.get('origin');
  const allowedOrigin = requestOrigin === appOrigin ? requestOrigin : appOrigin;

  const cors = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const supabaseUrl = ((context.env && context.env.VITE_SUPABASE_URL) || 'https://ktzvzossoyyfvexkgagm.supabase.co').trim();
  const anonKey = ((context.env && context.env.VITE_SUPABASE_ANON_KEY) || '').trim();

  const hasValidShape = /^https:\/\/[a-z0-9]{20}\.supabase\.co\/?$/i.test(supabaseUrl) && anonKey.startsWith('eyJ');

  if (!hasValidShape) {
    return new Response(
      JSON.stringify({ error: 'Runtime Supabase config missing' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ supabaseUrl, anonKey }),
    {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function onRequestOptions(context: any) {
  const appOrigin = new URL(context.request.url).origin;
  const requestOrigin = context.request.headers.get('origin');
  const allowedOrigin = requestOrigin === appOrigin ? requestOrigin : appOrigin;
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Cloudflare Pages Function: Auth login proxy
 *
 * Proxies signInWithPassword to Supabase from Cloudflare's edge.
 * Use when direct browser->Supabase has network issues (522, timeout).
 *
 * POST /api/auth-login
 * Body: { email: string, password: string }
 * Returns: { access_token, refresh_token, user } or { error: string }
 */
export async function onRequestPost(context: any) {
  const appOrigin = new URL(context.request.url).origin;
  const requestOrigin = context.request.headers.get('origin');
  const allowedOrigin = requestOrigin === appOrigin ? requestOrigin : appOrigin;

  const cors = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  let body: { email?: string; password?: string };
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();
  const supabaseUrl = ((context.env && context.env.VITE_SUPABASE_URL) || 'https://ktzvzossoyyfvexkgagm.supabase.co').replace(/\/$/, '');
  const anonKey = (context.env && context.env.VITE_SUPABASE_ANON_KEY) || '';

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'email and password required' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  if (!anonKey || !anonKey.startsWith('eyJ')) {
    return new Response(
      JSON.stringify({ error: 'Server auth proxy is not configured.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(25000),
    });

    const data = await res.json().catch(() => ({} as Record<string, unknown>));

    if (!res.ok) {
      const isCredentialError = res.status === 400 || res.status === 401 || res.status === 422;
      return new Response(
        JSON.stringify({ error: isCredentialError ? 'Invalid login credentials' : 'Auth provider temporarily unavailable' }),
        { status: isCredentialError ? 400 : 502, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        user: data.user,
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const msg = err?.message || String(err);
    return new Response(
      JSON.stringify({
        error: msg.includes('timeout') ? 'Auth provider timeout' : 'Auth provider unavailable',
      }),
      { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
}

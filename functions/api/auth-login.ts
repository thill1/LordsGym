/**
 * Cloudflare Pages Function: Auth login proxy
 *
 * Proxies signInWithPassword to Supabase from Cloudflare's edge.
 * Use when direct browser->Supabase has network issues (522, timeout).
 *
 * POST /api/auth-login
 * Body: { email: string, password: string, supabaseUrl?: string, anonKey?: string }
 * Returns: { access_token, refresh_token, user } or { error: string }
 */
export async function onRequestPost(context: any) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  let body: { email?: string; password?: string; supabaseUrl?: string; anonKey?: string };
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
  const supabaseUrl = (body.supabaseUrl || (context.env && context.env.VITE_SUPABASE_URL) || 'https://mrptukahxloqpdqiaxkb.supabase.co').replace(/\/$/, '');
  const anonKey = body.anonKey || (context.env && context.env.VITE_SUPABASE_ANON_KEY) || '';

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'email and password required' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  if (!anonKey || !anonKey.startsWith('eyJ')) {
    return new Response(
      JSON.stringify({ error: 'anonKey required (JWT from Supabase API settings)' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
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

    const data = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: data.msg || data.error_description || `Supabase returned ${res.status}`,
          errorCode: data.error,
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
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
        error: msg.includes('timeout') ? 'Supabase timed out from Cloudflare edge' : msg,
      }),
      { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
}

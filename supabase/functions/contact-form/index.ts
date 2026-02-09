const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFY_EMAIL = 'lordsgymoutreach@gmail.com';

interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendKey = Deno.env.get('RESEND_API_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { firstName, lastName, email, phone, inquiryType, message } = payload;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !inquiryType?.trim() || !message?.trim()) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 1. Insert into Supabase
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        inquiry_type: inquiryType.trim(),
        message: message.trim(),
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error('Supabase insert failed:', insertRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Failed to save submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Send email notification (if Resend is configured)
    if (resendKey) {
      const subject = inquiryType.trim();
      const textBody = [
        'Contact Information:',
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        '',
        'Message:',
        message,
      ].join('\n');

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Lord\'s Gym Contact <onboarding@resend.dev>',
          to: [NOTIFY_EMAIL],
          subject: `[Lord's Gym] ${subject}`,
          text: textBody,
        }),
      });

      if (!emailRes.ok) {
        const errData = await emailRes.json().catch(() => ({}));
        console.error('Resend email failed:', emailRes.status, errData);
        // Don't fail the request - data is saved, email is best-effort
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

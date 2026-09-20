import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let handle: (request: Request) => Promise<Response>;
const fetchMock = vi.fn();

beforeAll(async () => {
  vi.stubGlobal('Deno', {
    serve: (handler: typeof handle) => { handle = handler; },
    env: { get: (name: string) => ({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      RESEND_API_KEY: 'test-resend-key',
    })[name as 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY' | 'RESEND_API_KEY'] },
  });
});

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

function request(body: object) {
  return new Request('https://example.supabase.co/functions/v1/contact-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validSubmission = {
  firstName: 'Test',
  lastName: 'Visitor',
  email: 'test@example.com',
  inquiryType: 'Membership',
  message: 'A test inquiry',
};

describe('contact-form Edge Function', () => {
  beforeAll(async () => {
    await import('./index');
  });

  it('answers browser preflight without writing', async () => {
    const response = await handle(new Request('https://example.supabase.co/functions/v1/contact-form', { method: 'OPTIONS' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects incomplete submissions without writing', async () => {
    const response = await handle(request({ ...validSubmission, message: ' ' }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('saves a valid submission and sends a notification', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const response = await handle(request(validSubmission));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, notificationSent: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.supabase.co/rest/v1/contact_submissions');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ first_name: 'Test', email: 'test@example.com' });
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.resend.com/emails');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      from: "Lord's Gym Contact <orders@lordsgymoutreach.com>",
      to: ['lordsgymoutreach@gmail.com'],
      reply_to: 'test@example.com',
    });
  });

  it('does not report success when the database rejects the submission', async () => {
    fetchMock.mockResolvedValueOnce(new Response('insert failed', { status: 500 }));
    const response = await handle(request(validSubmission));
    expect(response.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports a saved inquiry without falsely promising an email alert', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 403 }));
    const response = await handle(request(validSubmission));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, notificationSent: false });
  });
});

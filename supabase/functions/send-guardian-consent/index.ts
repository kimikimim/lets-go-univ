// Sends a one-time guardian consent link via SMS and logs the request for
// dispute records (timestamp + IP), per the guardian-consent compliance
// requirement. Runs with the service role — never callable with the anon key
// alone to write `verified` status; only this function may do that (via the
// separate verify-guardian-consent function, not yet implemented).
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SMS_GATEWAY_URL = Deno.env.get('SMS_GATEWAY_URL');
const SMS_GATEWAY_API_KEY = Deno.env.get('SMS_GATEWAY_API_KEY');
const SMS_SENDER_NUMBER = Deno.env.get('SMS_SENDER_NUMBER'); // must be pre-registered per Korean anti-spam law
const CONSENT_LINK_BASE_URL = Deno.env.get('CONSENT_LINK_BASE_URL') ?? 'https://your-content-site.pages.dev/guardian-consent';

Deno.serve(async (req) => {
  const { student_id, guardian_phone } = await req.json();
  if (!student_id || !guardian_phone) {
    return new Response(JSON.stringify({ error: 'student_id, guardian_phone가 필요해요.' }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const consentToken = crypto.randomUUID();
  const requestIp = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? 'unknown';

  const { data: consent, error } = await supabase
    .from('guardian_consents')
    .insert({
      student_id,
      guardian_phone,
      consent_token: consentToken,
      request_ip: requestIp,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (SMS_GATEWAY_URL && SMS_GATEWAY_API_KEY && SMS_SENDER_NUMBER) {
    const consentLink = `${CONSENT_LINK_BASE_URL}?token=${consentToken}`;
    await fetch(SMS_GATEWAY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${SMS_GATEWAY_API_KEY}` },
      body: JSON.stringify({
        from: SMS_SENDER_NUMBER,
        to: guardian_phone,
        text: `[생기부뭐쓰지?] 자녀의 결제 진행을 위한 보호자 동의가 필요합니다. ${consentLink}`,
      }),
    });
  } else {
    console.warn('[send-guardian-consent] SMS gateway not configured — consent row created without sending SMS.');
  }

  return new Response(JSON.stringify({ consent }), { headers: { 'content-type': 'application/json' } });
});

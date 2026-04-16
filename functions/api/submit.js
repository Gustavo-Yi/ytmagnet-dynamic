/**
 * Cloudflare Pages Function — POST /api/submit
 * Handles contact form submissions with:
 *  - Cloudflare Turnstile verification
 *  - IP rate limiting (max 2 per day)
 *  - Field validation
 *  - D1 database storage
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // ── Get Client IP ──
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown';

  // ── Parse Request Body ──
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'invalid_body', message: '请求格式错误' }, 400);
  }

  const { name, email, country_code, whatsapp, message, turnstileToken } = body;

  // ── Step 1: Turnstile Verification ──
  if (!turnstileToken) {
    return json({ success: false, error: 'missing_token', message: '请完成人机验证' }, 400);
  }

  const turnstileRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: ip,
      }),
    }
  );

  const turnstileData = await turnstileRes.json();
  if (!turnstileData.success) {
    return json({ success: false, error: 'turnstile_failed', message: '人机验证失败，请刷新重试' }, 400);
  }

  // ── Step 2: IP Rate Limiting (2 per day) ──
  const now = Math.floor(Date.now() / 1000);
  const dayStart = now - (now % 86400);

  const rateRecord = await env.DB.prepare(
    'SELECT count, window_start FROM rate_limits WHERE ip = ?'
  ).bind(ip).first();

  if (rateRecord) {
    if (rateRecord.window_start >= dayStart && rateRecord.count >= 2) {
      return json({
        success: false,
        error: 'rate_limit_exceeded',
        message: '您今日提交次数已达上限（每日最多2次），请明天再试',
      }, 429);
    }

    if (rateRecord.window_start >= dayStart) {
      await env.DB.prepare(
        'UPDATE rate_limits SET count = count + 1 WHERE ip = ?'
      ).bind(ip).run();
    } else {
      await env.DB.prepare(
        'UPDATE rate_limits SET count = 1, window_start = ? WHERE ip = ?'
      ).bind(dayStart, ip).run();
    }
  } else {
    await env.DB.prepare(
      'INSERT INTO rate_limits (ip, count, window_start) VALUES (?, 1, ?)'
    ).bind(ip, dayStart).run();
  }

  // ── Step 3: Field Validation ──
  if (!country_code || !whatsapp || !message) {
    return json({ success: false, error: 'missing_fields', message: '请填写必填项（区号、WhatsApp、留言）' }, 400);
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, error: 'invalid_email', message: '邮箱格式不正确' }, 400);
  }

  if (message.length > 1000) {
    return json({ success: false, error: 'message_too_long', message: '留言内容不能超过 1000 字' }, 400);
  }

  // Strict WhatsApp digit validation
  if (!/^\d+$/.test(whatsapp)) {
    return json({ success: false, error: 'invalid_whatsapp', message: 'WhatsApp 号码必须全部为数字' }, 400);
  }

  if (whatsapp.length > 20) {
    return json({ success: false, error: 'invalid_whatsapp', message: 'WhatsApp 号码长度不能超过 20 位' }, 400);
  }

  // ── Step 4: Save to D1 ──
  await env.DB.prepare(
    'INSERT INTO messages (name, email, country_code, whatsapp, message, ip) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    (name || '').slice(0, 100),
    (email || '').slice(0, 200),
    country_code.slice(0, 20),
    whatsapp.slice(0, 20),
    message.slice(0, 1000),
    ip
  ).run();

  return json({ success: true, message: '留言提交成功！我们会尽快与您联系。' });
}

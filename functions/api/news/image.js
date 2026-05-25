const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function isSafeNewsKey(key) {
  return key.startsWith('news/') && !key.includes('..') && !key.includes('\\');
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = (url.searchParams.get('key') || '').trim();

  if (!key || !isSafeNewsKey(key)) {
    return json({ success: false, message: 'Invalid image key.' }, 400);
  }

  if (!env.R2) {
    return json({ success: false, message: 'R2 binding is not configured.' }, 500);
  }

  const object = await env.R2.get(key);

  if (!object) {
    return json({ success: false, message: 'Image not found.' }, 404);
  }

  const headers = new Headers(CORS_HEADERS);
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  if (object.httpEtag) {
    headers.set('ETag', object.httpEtag);
  }

  return new Response(object.body, { headers });
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.split(' ')[1];
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp >= Date.now();
  } catch {
    return false;
  }
}

function makeImageUrl(request, env, key) {
  if (env.R2_PUBLIC_BASE_URL) {
    const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, '');
    return `${base}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  }

  const url = new URL(request.url);
  url.pathname = '/api/news/image';
  url.search = `?key=${encodeURIComponent(key)}`;
  return url.toString();
}

function isSafeNewsKey(key) {
  return key.startsWith('news/') && !key.includes('..') && !key.includes('\\');
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: 'Unauthorized or expired session.' }, 401);
  }

  if (!env.R2) {
    return json({ success: false, message: 'R2 binding is not configured.' }, 500);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ success: false, message: 'Invalid multipart form data.' }, 400);
  }

  const file = formData.get('file');
  if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function') {
    return json({ success: false, message: 'Image file is required.' }, 400);
  }

  const contentType = String(file.type || '').toLowerCase();
  const extension = IMAGE_TYPES.get(contentType);

  if (!extension) {
    return json({ success: false, message: 'Only JPG, PNG, WEBP, AVIF, and GIF images are allowed.' }, 400);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return json({ success: false, message: 'Image file must be smaller than 5MB.' }, 400);
  }

  const scope = String(formData.get('scope') || 'cover').toLowerCase();
  const folder = scope === 'content' ? 'content' : 'covers';
  const datePrefix = new Date().toISOString().slice(0, 10);
  const key = `news/${folder}/${datePrefix}/${crypto.randomUUID()}.${extension}`;
  const buffer = await file.arrayBuffer();

  await env.R2.put(key, buffer, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  return json({
    success: true,
    data: {
      key,
      url: makeImageUrl(request, env, key),
      contentType,
      size: file.size,
    },
  }, 201);
}

export async function onRequestDelete(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: 'Unauthorized or expired session.' }, 401);
  }

  const url = new URL(request.url);
  const key = (url.searchParams.get('key') || '').trim();

  if (!key || !isSafeNewsKey(key)) {
    return json({ success: false, message: 'Invalid image key.' }, 400);
  }

  if (!env.R2) {
    return json({ success: false, message: 'R2 binding is not configured.' }, 500);
  }

  await env.R2.delete(key);
  return json({ success: true, message: 'Image deleted.' });
}

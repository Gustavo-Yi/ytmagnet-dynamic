const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const CATEGORY_VALUES = new Set(['company', 'product', 'industry']);
const STATUS_VALUES = new Set(['draft', 'published']);

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

function getPageParam(url, name, fallback, max) {
  const value = Number.parseInt(url.searchParams.get(name) || '', 10);
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.min(value, max);
}

function text(value, fallback = '', maxLength = 5000) {
  if (value === undefined) return fallback;
  if (value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function optionalDate(value, fallback = null) {
  if (value === undefined) return fallback;
  if (value === null || value === '') return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function makeImageUrl(request, env, key, storedUrl) {
  if (storedUrl) return storedUrl;
  if (!key) return null;

  if (env.R2_PUBLIC_BASE_URL) {
    const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, '');
    return `${base}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  }

  const url = new URL(request.url);
  url.pathname = '/api/news/image';
  url.search = `?key=${encodeURIComponent(key)}`;
  return url.toString();
}

function mapPost(request, env, post) {
  return {
    ...post,
    cover_image_url: makeImageUrl(request, env, post.cover_image_key, post.cover_image_url),
    featured: Boolean(post.featured),
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function ensureUniqueSlug(env, baseSlug, excludeId = 0) {
  const base = baseSlug || `news-${Date.now()}`;

  for (let index = 0; index < 30; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await env.DB.prepare(
      'SELECT id FROM news_posts WHERE slug = ? AND id <> ? LIMIT 1'
    ).bind(candidate, excludeId).first();

    if (!existing) return candidate;
  }

  return `${base}-${Date.now()}`;
}

function buildPostInput(body, existing, request, env) {
  const titleZh = text(body.title_zh, existing?.title_zh, 180);
  const contentZh = text(body.content_zh, existing?.content_zh, 50000);

  if (!titleZh) return { error: 'title_zh is required.' };
  if (!contentZh) return { error: 'content_zh is required.' };

  const category = text(body.category, existing?.category || 'company', 40);
  if (!CATEGORY_VALUES.has(category)) {
    return { error: 'category must be company, product, or industry.' };
  }

  const status = text(body.status, existing?.status || 'draft', 40);
  if (!STATUS_VALUES.has(status)) {
    return { error: 'status must be draft or published.' };
  }

  let publishedAt = optionalDate(body.published_at, existing?.published_at || null);
  if (status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString();
  }
  if (status === 'draft' && body.status !== undefined) {
    publishedAt = null;
  }

  const coverImageKey = text(body.cover_image_key, existing?.cover_image_key || '', 500);
  const coverImageUrlInput = text(body.cover_image_url, existing?.cover_image_url || '', 1000);

  return {
    data: {
      slug: text(body.slug, existing?.slug || '', 100),
      category,
      status,
      title_zh: titleZh,
      title_en: text(body.title_en, existing?.title_en || '', 180),
      summary_zh: text(body.summary_zh, existing?.summary_zh || '', 360),
      summary_en: text(body.summary_en, existing?.summary_en || '', 360),
      content_zh: contentZh,
      content_en: text(body.content_en, existing?.content_en || '', 50000),
      cover_image_key: coverImageKey || null,
      cover_image_url: makeImageUrl(request, env, coverImageKey, coverImageUrlInput || null),
      cover_image_alt_zh: text(body.cover_image_alt_zh, existing?.cover_image_alt_zh || '', 180),
      cover_image_alt_en: text(body.cover_image_alt_en, existing?.cover_image_alt_en || '', 180),
      seo_title_zh: text(body.seo_title_zh, existing?.seo_title_zh || '', 180),
      seo_title_en: text(body.seo_title_en, existing?.seo_title_en || '', 180),
      seo_description_zh: text(body.seo_description_zh, existing?.seo_description_zh || '', 360),
      seo_description_en: text(body.seo_description_en, existing?.seo_description_en || '', 360),
      featured: body.featured === undefined ? Number(existing?.featured || 0) : (body.featured ? 1 : 0),
      published_at: publishedAt,
    },
  };
}

async function deleteR2Object(env, key) {
  if (!key) return;
  if (!key.startsWith('news/') || key.includes('..') || key.includes('\\')) {
    throw new Error('Unsafe R2 key.');
  }
  if (!env.R2) {
    throw new Error('R2 binding is not configured.');
  }
  await env.R2.delete(key);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: 'Unauthorized or expired session.' }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const slug = (url.searchParams.get('slug') || '').trim();

  try {
    if (id || slug) {
      const post = id
        ? await env.DB.prepare('SELECT * FROM news_posts WHERE id = ? LIMIT 1').bind(id).first()
        : await env.DB.prepare('SELECT * FROM news_posts WHERE slug = ? LIMIT 1').bind(slug).first();

      if (!post) {
        return json({ success: false, message: 'News post not found.' }, 404);
      }

      return json({ success: true, data: mapPost(request, env, post) });
    }

    const page = getPageParam(url, 'page', 1, 1000);
    const pageSize = getPageParam(url, 'pageSize', 20, 100);
    const offset = (page - 1) * pageSize;
    const category = (url.searchParams.get('category') || '').trim();
    const status = (url.searchParams.get('status') || '').trim();
    const q = (url.searchParams.get('q') || '').trim();

    const where = ['1 = 1'];
    const binds = [];

    if (category && CATEGORY_VALUES.has(category)) {
      where.push('category = ?');
      binds.push(category);
    }

    if (status && STATUS_VALUES.has(status)) {
      where.push('status = ?');
      binds.push(status);
    }

    if (q) {
      where.push(`(
        title_zh LIKE ?
        OR title_en LIKE ?
        OR summary_zh LIKE ?
        OR summary_en LIKE ?
        OR content_zh LIKE ?
        OR content_en LIKE ?
      )`);
      const like = `%${q}%`;
      binds.push(like, like, like, like, like, like);
    }

    const whereSql = where.join(' AND ');
    const countRow = await env.DB.prepare(
      `SELECT COUNT(*) AS total FROM news_posts WHERE ${whereSql}`
    ).bind(...binds).first();

    const { results } = await env.DB.prepare(
      `SELECT
        id, slug, category, status, title_zh, title_en, summary_zh, summary_en,
        cover_image_key, cover_image_url, cover_image_alt_zh, cover_image_alt_en,
        seo_title_zh, seo_title_en, seo_description_zh, seo_description_en,
        featured, published_at, created_at, updated_at
       FROM news_posts
       WHERE ${whereSql}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?`
    ).bind(...binds, pageSize, offset).all();

    const total = Number(countRow?.total || 0);

    return json({
      success: true,
      data: results.map((post) => mapPost(request, env, post)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) {
    return json({ success: false, message: 'Failed to read admin news posts.', error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: 'Unauthorized or expired session.' }, 401);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ success: false, message: 'Invalid JSON body.' }, 400);
  }

  const input = buildPostInput(body, null, request, env);
  if (input.error) {
    return json({ success: false, message: input.error }, 400);
  }

  const baseSlug = normalizeSlug(input.data.slug || input.data.title_en || input.data.title_zh);
  const slug = await ensureUniqueSlug(env, baseSlug);
  const now = new Date().toISOString();

  try {
    const result = await env.DB.prepare(
      `INSERT INTO news_posts (
        slug, category, status, title_zh, title_en, summary_zh, summary_en,
        content_zh, content_en, cover_image_key, cover_image_url,
        cover_image_alt_zh, cover_image_alt_en, seo_title_zh, seo_title_en,
        seo_description_zh, seo_description_en, featured, published_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      slug,
      input.data.category,
      input.data.status,
      input.data.title_zh,
      input.data.title_en,
      input.data.summary_zh,
      input.data.summary_en,
      input.data.content_zh,
      input.data.content_en,
      input.data.cover_image_key,
      input.data.cover_image_url,
      input.data.cover_image_alt_zh,
      input.data.cover_image_alt_en,
      input.data.seo_title_zh,
      input.data.seo_title_en,
      input.data.seo_description_zh,
      input.data.seo_description_en,
      input.data.featured,
      input.data.published_at,
      now,
      now
    ).run();

    const post = await env.DB.prepare('SELECT * FROM news_posts WHERE id = ? LIMIT 1')
      .bind(result.meta.last_row_id)
      .first();

    return json({ success: true, data: mapPost(request, env, post) }, 201);
  } catch (err) {
    return json({ success: false, message: 'Failed to create news post.', error: err.message }, 500);
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: 'Unauthorized or expired session.' }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return json({ success: false, message: 'Missing news post id.' }, 400);
  }

  const existing = await env.DB.prepare('SELECT * FROM news_posts WHERE id = ? LIMIT 1').bind(id).first();
  if (!existing) {
    return json({ success: false, message: 'News post not found.' }, 404);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ success: false, message: 'Invalid JSON body.' }, 400);
  }

  const input = buildPostInput(body, existing, request, env);
  if (input.error) {
    return json({ success: false, message: input.error }, 400);
  }

  const slugChanged = body.slug !== undefined && input.data.slug !== existing.slug;
  const slug = slugChanged
    ? await ensureUniqueSlug(env, normalizeSlug(input.data.slug), Number(id))
    : existing.slug;
  const oldCoverKey = existing.cover_image_key;
  const newCoverKey = input.data.cover_image_key;

  try {
    await env.DB.prepare(
      `UPDATE news_posts
       SET slug = ?,
           category = ?,
           status = ?,
           title_zh = ?,
           title_en = ?,
           summary_zh = ?,
           summary_en = ?,
           content_zh = ?,
           content_en = ?,
           cover_image_key = ?,
           cover_image_url = ?,
           cover_image_alt_zh = ?,
           cover_image_alt_en = ?,
           seo_title_zh = ?,
           seo_title_en = ?,
           seo_description_zh = ?,
           seo_description_en = ?,
           featured = ?,
           published_at = ?,
           updated_at = ?
       WHERE id = ?`
    ).bind(
      slug,
      input.data.category,
      input.data.status,
      input.data.title_zh,
      input.data.title_en,
      input.data.summary_zh,
      input.data.summary_en,
      input.data.content_zh,
      input.data.content_en,
      input.data.cover_image_key,
      input.data.cover_image_url,
      input.data.cover_image_alt_zh,
      input.data.cover_image_alt_en,
      input.data.seo_title_zh,
      input.data.seo_title_en,
      input.data.seo_description_zh,
      input.data.seo_description_en,
      input.data.featured,
      input.data.published_at,
      new Date().toISOString(),
      id
    ).run();

    if (oldCoverKey && oldCoverKey !== newCoverKey) {
      await deleteR2Object(env, oldCoverKey).catch(() => {});
    }

    const post = await env.DB.prepare('SELECT * FROM news_posts WHERE id = ? LIMIT 1').bind(id).first();
    return json({ success: true, data: mapPost(request, env, post) });
  } catch (err) {
    return json({ success: false, message: 'Failed to update news post.', error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: 'Unauthorized or expired session.' }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return json({ success: false, message: 'Missing news post id.' }, 400);
  }

  try {
    const post = await env.DB.prepare('SELECT id, cover_image_key FROM news_posts WHERE id = ? LIMIT 1')
      .bind(id)
      .first();

    if (!post) {
      return json({ success: false, message: 'News post not found.' }, 404);
    }

    if (post.cover_image_key) {
      await deleteR2Object(env, post.cover_image_key);
    }

    await env.DB.prepare('DELETE FROM news_posts WHERE id = ?').bind(id).run();
    return json({ success: true, message: 'News post permanently deleted.' });
  } catch (err) {
    return json({ success: false, message: 'Failed to delete news post.', error: err.message }, 500);
  }
}

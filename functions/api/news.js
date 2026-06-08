const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const CATEGORY_VALUES = new Set(['company', 'industry', 'faq']);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

function getPageParam(url, name, fallback, max) {
  const value = Number.parseInt(url.searchParams.get(name) || '', 10);
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.min(value, max);
}

function getImageUrl(request, env, key, storedUrl) {
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
    category: CATEGORY_VALUES.has(post.category) ? post.category : 'company',
    cover_image_url: getImageUrl(request, env, post.cover_image_key, post.cover_image_url),
    pinned: Boolean(post.pinned),
    featured: Boolean(post.featured),
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = (url.searchParams.get('slug') || '').trim();

  try {
    if (slug) {
      const post = await env.DB.prepare(
        `SELECT *
         FROM news_posts
         WHERE slug = ? AND status = 'published'
         LIMIT 1`
      ).bind(slug).first();

      if (!post) {
        return json({ success: false, message: 'News post not found.' }, 404);
      }

      return json({ success: true, data: mapPost(request, env, post) });
    }

    const page = getPageParam(url, 'page', 1, 1000);
    const pageSize = getPageParam(url, 'pageSize', 9, 24);
    const offset = (page - 1) * pageSize;
    const category = (url.searchParams.get('category') || '').trim();
    const q = (url.searchParams.get('q') || '').trim();

    const where = ["status = 'published'"];
    const binds = [];

    if (category) {
      if (!CATEGORY_VALUES.has(category)) {
        where.push('1 = 0');
      } else if (category === 'company') {
        where.push('category IN (?, ?)');
        binds.push('company', 'product');
      } else {
        where.push('category = ?');
        binds.push(category);
      }
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
        pinned, featured, published_at, created_at, updated_at
       FROM news_posts
       WHERE ${whereSql}
       ORDER BY pinned DESC, featured DESC, published_at DESC, id DESC
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
    return json({ success: false, message: 'Failed to read news posts.', error: err.message }, 500);
  }
}

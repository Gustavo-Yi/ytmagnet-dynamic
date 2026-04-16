const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  try {
    if (slug) {
      // --- GET SINGLE NEWS BY SLUG ---
      const news = await env.DB.prepare(
        'SELECT * FROM news WHERE slug = ? AND status = "published" LIMIT 1'
      ).bind(slug).first();

      if (!news) {
        return json({ success: false, message: '文章未找到' }, 404);
      }

      return json({ success: true, data: news });
    } else {
      // --- GET NEWS LIST ---
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = 12;
      const offset = (page - 1) * limit;

      const { results } = await env.DB.prepare(
        'SELECT id, title, slug, excerpt, cover_image, category, published_at FROM news WHERE status = "published" ORDER BY published_at DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all();

      return json({ success: true, data: results });
    }
  } catch (err) {
    return json({ success: false, message: '读取失败', error: err.message }, 500);
  }
}

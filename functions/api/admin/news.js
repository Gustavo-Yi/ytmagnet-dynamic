const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Simple token verification (reusing the logic from admin messages)
function verifyToken(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.split(' ')[1];
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  // Global Auth Check for Admin APIs
  if (request.method !== 'OPTIONS' && !verifyToken(request)) {
    return json({ success: false, message: '未授权访问' }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  try {
    // --- CREATE (POST) ---
    if (request.method === 'POST') {
      const data = await request.json();
      const { title, slug, excerpt, content, cover_image, category, meta_keywords, meta_description } = data;

      if (!title || !slug) return json({ success: false, message: '标题和路径(slug)是必填项' }, 400);

      const result = await env.DB.prepare(
        `INSERT INTO news (title, slug, excerpt, content, cover_image, category, meta_keywords, meta_description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(title, slug, excerpt, content, cover_image, category, meta_keywords, meta_description).run();

      return json({ success: true, message: '新闻发布成功', id: result.lastRowId });
    }

    // --- UPDATE (PUT) ---
    if (request.method === 'PUT') {
      if (!id) return json({ success: false, message: '缺失新闻ID' }, 400);
      const data = await request.json();
      const { title, slug, excerpt, content, cover_image, category, meta_keywords, meta_description } = data;

      await env.DB.prepare(
        `UPDATE news SET 
          title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, 
          category = ?, meta_keywords = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(title, slug, excerpt, content, cover_image, category, meta_keywords, meta_description, id).run();

      return json({ success: true, message: '新闻更新成功' });
    }

    // --- DELETE (DELETE) ---
    if (request.method === 'DELETE') {
      if (!id) return json({ success: false, message: '缺失新闻ID' }, 400);
      await env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
      return json({ success: true, message: '新闻已删除' });
    }

    // --- LIST (GET in admin context) ---
    if (request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM news ORDER BY created_at DESC').all();
      return json({ success: true, data: result.results });
    }

    return json({ success: false, message: '不支持的方法' }, 405);
  } catch (err) {
    return json({ success: false, message: '服务器内部错误', error: err.message }, 500);
  }
}

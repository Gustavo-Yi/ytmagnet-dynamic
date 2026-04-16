const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: '未授权或登录已过期' }, 401);
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM messages ORDER BY created_at DESC'
    ).all();
    
    return json({ success: true, data: results });
  } catch (err) {
    return json({ success: false, message: '数据库查询失败', error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: '未授权或登录已过期' }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return json({ success: false, message: '缺少消息 ID' }, 400);
  }

  try {
    await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
    return json({ success: true, message: '留言已删除' });
  } catch (err) {
    return json({ success: false, message: '删除失败', error: err.message }, 500);
  }
}

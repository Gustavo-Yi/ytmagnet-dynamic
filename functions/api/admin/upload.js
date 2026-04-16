const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

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

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!verifyToken(request)) {
    return json({ success: false, message: '未授权访问' }, 401);
  }

  if (!env.R2) {
    return json({ success: false, message: 'R2 存储桶未绑定' }, 500);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return json({ success: false, message: '未找到上传文件' }, 400);
    }

    const filename = file.name;
    const extension = filename.split('.').pop();
    const key = `news/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;

    // Upload to R2
    await env.R2.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    // We return the key. In the frontend, we can use a proxy or R2 public URL
    // For simplicity, we'll suggest using a proxy API if no public domain exists
    return json({ 
      success: true, 
      message: '图片上传成功', 
      key: key,
      url: `/api/images/${key}` // We will implement this proxy next
    });
  } catch (err) {
    return json({ success: false, message: '上传失败', error: err.message }, 500);
  }
}

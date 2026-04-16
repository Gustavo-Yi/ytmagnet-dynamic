const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: '无效的请求' }), { status: 400, headers: CORS_HEADERS });
  }

  const { username, password } = body;

  // The user provided: 易亿 / yy342954...
  // In a real app, these should be env vars.
  const ADMIN_USER = env.ADMIN_USER || '易亿';
  const ADMIN_PASS = env.ADMIN_PASS || 'yy342954...';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Generate a simple session token (in production use JWT with a secret)
    // Here we'll just use a mock token for now or a simple concatenation with a secret
    const token = btoa(JSON.stringify({ user: username, exp: Date.now() + 86400000 }));
    
    return new Response(JSON.stringify({ 
      success: true, 
      token,
      message: '登录成功' 
    }), { status: 200, headers: CORS_HEADERS });
  }

  return new Response(JSON.stringify({ 
    success: false, 
    message: '用户名或密码错误' 
  }), { status: 401, headers: CORS_HEADERS });
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const DEFAULT_ADMIN_USER = '易亿';
const DEFAULT_ADMIN_PASS_HASH = 'aec592cf876a315cab301fe347101797aa15d4cf2850a35eaaf8152d330125fc';

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ success: false, message: '无效的请求' }), { status: 400, headers: CORS_HEADERS });
    }

    const { username, password } = body;

    const hasHashSecret = Boolean(env.ADMIN_PASS_HASH);
    const ADMIN_USER = hasHashSecret ? (env.ADMIN_USER || DEFAULT_ADMIN_USER) : DEFAULT_ADMIN_USER;
    const ADMIN_PASS_HASH = env.ADMIN_PASS_HASH || DEFAULT_ADMIN_PASS_HASH;
    const passwordHash = await sha256Hex(password || '');

    if (username === ADMIN_USER && safeEqual(passwordHash, ADMIN_PASS_HASH)) {
      // Safe Base64 for Unicode: Encode to UTF-8 then base64
      const tokenObj = { user: 'admin', exp: Date.now() + 86400000 };
      const token = btoa(JSON.stringify(tokenObj));
      
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

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '后端程序运行错误',
      error: err.message
    }), { status: 500, headers: CORS_HEADERS });
  }
}

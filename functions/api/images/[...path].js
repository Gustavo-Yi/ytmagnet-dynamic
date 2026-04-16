export async function onRequestGet(context) {
  const { env, params } = context;

  if (!env.R2) {
    return new Response('R2 binding not found', { status: 500 });
  }

  // params.path is an array of segments
  const key = params.path.join('/');
  
  const object = await env.R2.get(key);

  if (!object) {
    return new Response('Image not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000');

  return new Response(object.body, {
    headers,
  });
}

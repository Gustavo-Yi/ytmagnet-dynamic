const STATIC_PATHS = ['/', '/about', '/products', '/news', '/contact'];

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(request, path) {
  return new URL(path, new URL(request.url).origin).toString();
}

function urlEntry(location, lastmod, priority = '0.7') {
  return [
    '  <url>',
    `    <loc>${escapeXml(location)}</loc>`,
    lastmod ? `    <lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : '',
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function getNewsPosts(env) {
  if (!env.DB) return [];

  const { results } = await env.DB.prepare(
    `SELECT slug, updated_at, published_at, created_at
     FROM news_posts
     WHERE status = 'published'
     ORDER BY pinned DESC, featured DESC, published_at DESC, id DESC
     LIMIT 1000`
  ).all();

  return Array.isArray(results) ? results : [];
}

export async function onRequestGet({ request, env }) {
  const now = new Date().toISOString();
  const posts = await getNewsPosts(env);

  const entries = [
    ...STATIC_PATHS.map((path) => urlEntry(absoluteUrl(request, path), now, path === '/' ? '1.0' : '0.8')),
    ...posts.map((post) => urlEntry(
      absoluteUrl(request, `/news/${post.slug}`),
      post.updated_at || post.published_at || post.created_at,
      '0.7',
    )),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

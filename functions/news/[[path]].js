const SITE_NAME = '宁波钰彤新材料科技有限公司';
const SITE_NAME_EN = 'Yutong Magnet';
const NEWS_TITLE = `新闻中心 | ${SITE_NAME}`;
const NEWS_DESCRIPTION = '了解宁波钰彤新材料科技有限公司的公司新闻、磁组件定制案例与行业资讯。';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(request, value) {
  if (!value) return '';
  try {
    return new URL(value, new URL(request.url).origin).toString();
  } catch {
    return value;
  }
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

function getPathParam(context) {
  const value = context.params?.path;
  if (Array.isArray(value)) return value.join('/');
  return String(value || '').replace(/^\/+|\/+$/g, '');
}

function compactJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function injectSeo(html, seo) {
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const canonical = escapeHtml(seo.canonical);
  const image = escapeHtml(seo.image);
  const type = seo.article ? 'article' : 'website';

  const tags = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME_EN)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    image ? `<meta property="og:image" content="${image}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    image ? `<meta name="twitter:image" content="${image}" />` : '',
    seo.jsonLd ? `<script type="application/ld+json">${compactJsonLd(seo.jsonLd)}</script>` : '',
  ].filter(Boolean).join('\n    ');

  const withTitle = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  const withDescription = withTitle.replace(
    /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="description" content="${description}" />`,
  );

  return withDescription.replace('</head>', `    ${tags}\n  </head>`);
}

async function readIndex(request, env) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = '/index.html';
  assetUrl.search = '';
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), {
    method: 'GET',
    headers: request.headers,
  }));
  const html = await response.text();
  if (html.trim()) return html;

  const fallback = await fetch(assetUrl.toString());
  return fallback.text();
}

async function getPublishedPost(request, env, slug) {
  if (!env.DB || !slug) return null;

  const post = await env.DB.prepare(
    `SELECT *
     FROM news_posts
     WHERE slug = ? AND status = 'published'
     LIMIT 1`
  ).bind(slug).first();

  if (!post) return null;

  return {
    ...post,
    cover_image_url: makeImageUrl(request, env, post.cover_image_key, post.cover_image_url),
  };
}

function buildNewsSeo(request) {
  return {
    title: NEWS_TITLE,
    description: NEWS_DESCRIPTION,
    canonical: absoluteUrl(request, '/news'),
    image: absoluteUrl(request, '/news-center-hero.png'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: NEWS_TITLE,
      description: NEWS_DESCRIPTION,
      url: absoluteUrl(request, '/news'),
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl(request, '/logo.png'),
        },
      },
    },
  };
}

function buildArticleSeo(request, post) {
  const title = post.seo_title_zh || post.title_zh || post.title_en || NEWS_TITLE;
  const description = post.seo_description_zh
    || post.summary_zh
    || stripHtml(post.content_zh || post.content_en).slice(0, 155)
    || NEWS_DESCRIPTION;
  const canonical = absoluteUrl(request, `/news/${post.slug}`);
  const image = absoluteUrl(request, post.cover_image_url || '/news-center-hero.png');

  return {
    title,
    description,
    canonical,
    image,
    article: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description,
      image: image ? [image] : undefined,
      datePublished: post.published_at || post.created_at || undefined,
      dateModified: post.updated_at || post.published_at || post.created_at || undefined,
      author: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl(request, '/logo.png'),
        },
      },
      mainEntityOfPage: canonical,
    },
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const slug = getPathParam(context);
  const indexHtml = await readIndex(request, env);

  if (!slug) {
    return new Response(injectSeo(indexHtml, buildNewsSeo(request)), {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    });
  }

  const post = await getPublishedPost(request, env, slug);
  const seo = post ? buildArticleSeo(request, post) : buildNewsSeo(request);

  return new Response(injectSeo(indexHtml, seo), {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  });
}

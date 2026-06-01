import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { Link, useParams } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './NewsPage.css';

const CATEGORY_OPTIONS = [
  { value: 'company', zh: '公司新闻', en: 'Company News' },
  { value: 'industry', zh: '行业资讯', en: 'Industry News' },
];

const FALLBACK_IMAGE = '/contact-bg.jpg';
const CATEGORY_PAGE_SIZE = 6;
const FEATURED_SLIDE_SIZE = 5;

const COPY = {
  zh: {
    listTitle: '新闻中心',
    listSubtitle: '宇通磁业资讯',
    heroText: '了解宇通磁业公司新闻与行业趋势，掌握磁性应用的前沿信息与解决方案。',
    featuredTitle: '精选新闻',
    featuredEyebrow: '重点推荐',
    categoryTitle: '新闻分类',
    readNow: '立即阅读',
    readMore: '阅读全文',
    loading: '正在加载新闻内容...',
    emptyTitle: '暂无新闻内容',
    emptyText: '后台发布新闻后，这里会自动展示公司新闻和行业资讯。',
    categoryEmpty: '这个分类暂时没有新闻',
    back: '返回新闻中心',
    notFound: '没有找到这篇新闻',
    notFoundText: '这篇新闻可能尚未发布，或链接别名已经变更。',
    related: '更多新闻',
    category: '分类',
    publishedAt: '发布时间',
    previous: '上一页',
    next: '下一页',
    carouselPrev: '查看上一组精选新闻',
    carouselNext: '查看下一组精选新闻',
  },
  en: {
    listTitle: 'News Center',
    listSubtitle: 'Yutong Magnet Updates',
    heroText: 'Explore Yutong Magnet company news and industry trends for magnetic applications.',
    featuredTitle: 'Featured News',
    featuredEyebrow: 'Editor Picks',
    categoryTitle: 'News Categories',
    readNow: 'Read Now',
    readMore: 'Read Article',
    loading: 'Loading news...',
    emptyTitle: 'No news yet',
    emptyText: 'Published articles from the admin dashboard will appear here automatically.',
    categoryEmpty: 'No articles in this category yet',
    back: 'Back to News',
    notFound: 'Article not found',
    notFoundText: 'This article may not be published yet, or its link alias has changed.',
    related: 'More News',
    category: 'Category',
    publishedAt: 'Published',
    previous: 'Previous page',
    next: 'Next page',
    carouselPrev: 'Show previous featured articles',
    carouselNext: 'Show next featured articles',
  },
};

function getCopy(lang) {
  return COPY[lang === 'zh' ? 'zh' : 'en'];
}

function getCategoryLabel(category, lang) {
  return CATEGORY_OPTIONS.find((item) => item.value === category)?.[lang === 'zh' ? 'zh' : 'en'] || category || '-';
}

function getPostTitle(post, lang) {
  return (lang === 'zh' ? post.title_zh : post.title_en) || post.title_zh || post.title_en || '';
}

function getPostSummary(post, lang) {
  return (lang === 'zh' ? post.summary_zh : post.summary_en) || post.summary_zh || post.summary_en || '';
}

function getPostContent(post, lang) {
  return (lang === 'zh' ? post.content_zh : post.content_en) || post.content_zh || post.content_en || '';
}

function getImageAlt(post, lang) {
  return (lang === 'zh' ? post.cover_image_alt_zh : post.cover_image_alt_en)
    || getPostTitle(post, lang)
    || 'Yutong Magnet news image';
}

function getPostDate(post) {
  return post.published_at || post.created_at || '';
}

function formatDate(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function updateMeta(name, content) {
  if (!content) return;

  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function updatePropertyMeta(property, content) {
  if (!content) return;

  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function updateCanonical(url) {
  if (!url) return;

  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function updateJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function absoluteUrl(value) {
  if (!value) return '';
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return value;
  }
}

function splitParagraphs(content) {
  return content
    .split(/\n{2,}|\r\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function hasHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildArticleHtml(content) {
  const raw = String(content || '').trim();
  if (!raw) return '';

  const html = hasHtml(raw)
    ? raw
    : splitParagraphs(raw)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
      .join('');

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'loading', 'colspan', 'rowspan'],
  });
}

function sortPosts(posts, priorityFirst = false) {
  return [...posts].sort((left, right) => {
    if (priorityFirst) {
      const pinnedDiff = Number(right.pinned) - Number(left.pinned);
      if (pinnedDiff !== 0) return pinnedDiff;

      const featuredDiff = Number(right.featured) - Number(left.featured);
      if (featuredDiff !== 0) return featuredDiff;
    }

    return new Date(getPostDate(right)).getTime() - new Date(getPostDate(left)).getTime();
  });
}

function getCircularWindow(items, start, size) {
  const count = Math.min(size, items.length);
  return Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
}

function getPaginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('ellipsis-left');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('ellipsis-right');
  pages.push(total);

  return pages;
}

function handlePointerGlow(event) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const xRatio = x / rect.width - 0.5;
  const yRatio = y / rect.height - 0.5;

  target.style.setProperty('--pointer-x', `${x}px`);
  target.style.setProperty('--pointer-y', `${y}px`);
  target.style.setProperty('--tilt-x', `${(-yRatio * 3.6).toFixed(2)}deg`);
  target.style.setProperty('--tilt-y', `${(xRatio * 3.6).toFixed(2)}deg`);
  target.style.setProperty('--image-shift-x', `${(xRatio * 8).toFixed(2)}px`);
  target.style.setProperty('--image-shift-y', `${(yRatio * 8).toFixed(2)}px`);
}

function resetPointerGlow(event) {
  const target = event.currentTarget;

  target.style.setProperty('--pointer-x', '50%');
  target.style.setProperty('--pointer-y', '50%');
  target.style.setProperty('--tilt-x', '0deg');
  target.style.setProperty('--tilt-y', '0deg');
  target.style.setProperty('--image-shift-x', '0px');
  target.style.setProperty('--image-shift-y', '0px');
}

function handleMagneticPointer(event) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const xRatio = x / rect.width - 0.5;
  const yRatio = y / rect.height - 0.5;

  target.style.setProperty('--pointer-x', `${x}px`);
  target.style.setProperty('--pointer-y', `${y}px`);
  target.style.setProperty('--magnet-x', `${(xRatio * 8).toFixed(2)}px`);
  target.style.setProperty('--magnet-y', `${(yRatio * 8).toFixed(2)}px`);
}

function resetMagneticPointer(event) {
  const target = event.currentTarget;

  target.style.setProperty('--pointer-x', '50%');
  target.style.setProperty('--pointer-y', '50%');
  target.style.setProperty('--magnet-x', '0px');
  target.style.setProperty('--magnet-y', '0px');
}

function NewsImage({ post, lang, loading = 'lazy' }) {
  return (
    <img
      src={post.cover_image_url || FALLBACK_IMAGE}
      alt={getImageAlt(post, lang)}
      loading={loading}
    />
  );
}

function FeaturedHeroCard({ post, lang, copy }) {
  const title = getPostTitle(post, lang);
  const summary = getPostSummary(post, lang);

  return (
    <article className="featured-hero-card">
      <Link className="featured-hero-media" to={`/news/${post.slug}`} aria-label={title}>
        <NewsImage post={post} lang={lang} loading="eager" />
      </Link>
      <div className="featured-hero-overlay">
        <h2>
          <Link to={`/news/${post.slug}`}>{title}</Link>
        </h2>
        {summary && <p>{summary}</p>}
        <Link
          className="news-primary-link magnetic-control"
          to={`/news/${post.slug}`}
          onPointerMove={handleMagneticPointer}
          onPointerLeave={resetMagneticPointer}
        >
          <span>{copy.readNow}</span>
        </Link>
      </div>
    </article>
  );
}

function FeaturedRailCard({ post, lang }) {
  const title = getPostTitle(post, lang);
  const summary = getPostSummary(post, lang);

  return (
    <article
      className="featured-rail-card interactive-glow-card"
      onPointerMove={handlePointerGlow}
      onPointerLeave={resetPointerGlow}
    >
      <Link className="featured-rail-media" to={`/news/${post.slug}`} aria-label={title}>
        <NewsImage post={post} lang={lang} />
      </Link>
      <div className="featured-rail-body">
        <h3>
          <Link to={`/news/${post.slug}`}>{title}</Link>
        </h3>
        {summary && <p>{summary}</p>}
      </div>
    </article>
  );
}

function CategoryPostCard({ post, lang }) {
  const title = getPostTitle(post, lang);

  return (
    <Link
      className="category-news-card interactive-glow-card"
      to={`/news/${post.slug}`}
      aria-label={title}
      onPointerMove={handlePointerGlow}
      onPointerLeave={resetPointerGlow}
    >
      <div className="category-news-media">
        <NewsImage post={post} lang={lang} />
      </div>
      <div className="category-news-body">
        <h3>{title}</h3>
        <time>{formatDate(getPostDate(post), lang)}</time>
      </div>
    </Link>
  );
}

function NewsListPage({ lang }) {
  const copy = getCopy(lang);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('company');
  const [page, setPage] = useState(1);
  const [featuredOffset, setFeaturedOffset] = useState(0);
  const [featuredDirection, setFeaturedDirection] = useState('next');

  usePageTitle(copy.listTitle);

  useEffect(() => {
    updateMeta('description', copy.heroText);
  }, [copy.heroText]);

  useEffect(() => {
    let alive = true;

    async function loadPosts() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/news?page=1&pageSize=100');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load news.');
        }

        if (alive) {
          setPosts(Array.isArray(data.data) ? data.data : []);
        }
      } catch {
        if (alive) {
          setPosts([]);
          setError('');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadPosts();
    return () => {
      alive = false;
    };
  }, []);

  const sortedPosts = useMemo(() => sortPosts(posts, true), [posts]);
  const heroPost = useMemo(
    () => sortedPosts.find((post) => post.pinned) || sortedPosts[0],
    [sortedPosts],
  );

  const featuredRailPosts = useMemo(() => {
    return sortedPosts
      .filter((post) => post.featured && post.id !== heroPost?.id)
      .slice(0, FEATURED_SLIDE_SIZE);
  }, [heroPost?.id, sortedPosts]);

  const activeCategoryPosts = useMemo(
    () => sortPosts(posts.filter((post) => post.category === activeCategory)),
    [activeCategory, posts],
  );

  const totalPages = Math.max(1, Math.ceil(activeCategoryPosts.length / CATEGORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagePosts = activeCategoryPosts.slice((safePage - 1) * CATEGORY_PAGE_SIZE, safePage * CATEGORY_PAGE_SIZE);
  const railPosts = getCircularWindow(featuredRailPosts, featuredOffset, FEATURED_SLIDE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  useEffect(() => {
    setFeaturedOffset(0);
  }, [featuredRailPosts.length]);

  function moveFeaturedRail(direction) {
    if (featuredRailPosts.length <= 1) return;
    setFeaturedDirection(direction > 0 ? 'next' : 'previous');
    setFeaturedOffset((current) => {
      const next = current + direction;
      if (next < 0) return featuredRailPosts.length - 1;
      if (next >= featuredRailPosts.length) return 0;
      return next;
    });
  }

  return (
    <main className={`news-page lang-${lang}`}>
      <section className="news-featured-section" aria-labelledby="featured-news-heading">
        <h1 id="featured-news-heading" className="sr-only">{copy.featuredTitle}</h1>
        <div className="news-section-inner state-shell">
          {loading && <div className="news-loading">{copy.loading}</div>}
          {error && <div className="news-error">{error}</div>}
        </div>

        {!loading && !error && heroPost && <FeaturedHeroCard post={heroPost} lang={lang} copy={copy} />}

        {!loading && !error && heroPost && railPosts.length > 0 && (
          <div className="news-section-inner">
            <div className="featured-rail-shell">
              <h2 className="featured-rail-heading">{copy.featuredTitle}</h2>
              <button
                className="featured-arrow previous magnetic-control"
                type="button"
                aria-label={copy.carouselPrev}
                disabled={featuredRailPosts.length <= 1}
                onClick={() => moveFeaturedRail(-1)}
                onPointerMove={handleMagneticPointer}
                onPointerLeave={resetMagneticPointer}
              />
              <div
                key={featuredOffset}
                className={`featured-rail is-moving-${featuredDirection}`}
                aria-live="polite"
              >
                {railPosts.map((post) => (
                  <FeaturedRailCard key={post.id} post={post} lang={lang} />
                ))}
              </div>
              <button
                className="featured-arrow next magnetic-control"
                type="button"
                aria-label={copy.carouselNext}
                disabled={featuredRailPosts.length <= 1}
                onClick={() => moveFeaturedRail(1)}
                onPointerMove={handleMagneticPointer}
                onPointerLeave={resetMagneticPointer}
              />
            </div>
          </div>
        )}

        {!loading && !error && !heroPost && (
          <div className="news-section-inner">
            <div className="news-empty">
              <span>{copy.emptyTitle}</span>
              <p>{copy.emptyText}</p>
            </div>
          </div>
        )}
      </section>

      {!loading && !error && posts.length > 0 && (
        <section className="news-category-section" aria-labelledby="category-news-heading">
          <div className="news-section-inner">
            <div className="category-tabs-wrap">
              <h2 id="category-news-heading" className="sr-only">{copy.categoryTitle}</h2>
              <div className="category-tabs" role="tablist" aria-label={copy.category}>
                {CATEGORY_OPTIONS.map((category, index) => (
                  <button
                    key={category.value}
                    type="button"
                    className={activeCategory === category.value ? 'active' : ''}
                    style={{ '--tab-index': index }}
                    onClick={() => setActiveCategory(category.value)}
                    onPointerMove={handleMagneticPointer}
                    onPointerLeave={resetMagneticPointer}
                  >
                    {category[lang === 'zh' ? 'zh' : 'en']}
                  </button>
                ))}
              </div>
            </div>

            {pagePosts.length > 0 ? (
              <>
                <div key={`${activeCategory}-${safePage}`} className="category-news-grid">
                  {pagePosts.map((post) => (
                    <CategoryPostCard key={post.id} post={post} lang={lang} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="news-pagination" aria-label="News pagination">
                    <button
                      type="button"
                      aria-label={copy.previous}
                      disabled={safePage <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      ‹
                    </button>
                    {getPaginationItems(safePage, totalPages).map((item) => (
                      typeof item === 'number' ? (
                        <button
                          key={item}
                          type="button"
                          className={item === safePage ? 'active' : ''}
                          onClick={() => setPage(item)}
                        >
                          {item}
                        </button>
                      ) : (
                        <span key={item}>...</span>
                      )
                    ))}
                    <button
                      type="button"
                      aria-label={copy.next}
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    >
                      ›
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="news-empty compact">
                <span>{copy.categoryEmpty}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function NewsDetailPage({ slug, lang }) {
  const copy = getCopy(lang);
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pageTitle = post
    ? ((lang === 'zh' ? post.seo_title_zh : post.seo_title_en) || getPostTitle(post, lang))
    : copy.listTitle;
  usePageTitle(pageTitle);

  useEffect(() => {
    let alive = true;

    async function loadDetail() {
      setLoading(true);
      setError('');

      try {
        const [detailResponse, listResponse] = await Promise.all([
          fetch(`/api/news?slug=${encodeURIComponent(slug)}`),
          fetch('/api/news?page=1&pageSize=4'),
        ]);

        const detailData = await detailResponse.json();
        if (!detailResponse.ok || !detailData.success) {
          throw new Error(detailData.message || copy.notFound);
        }

        const listData = await listResponse.json();
        if (alive) {
          setPost(detailData.data);
          setRelated((Array.isArray(listData.data) ? listData.data : []).filter((item) => item.slug !== slug).slice(0, 3));
        }
      } catch (err) {
        if (alive) setError(err.message || copy.notFound);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      alive = false;
    };
  }, [copy.notFound, slug]);

  useEffect(() => {
    if (!post) return;
    const title = (lang === 'zh' ? post.seo_title_zh : post.seo_title_en) || getPostTitle(post, lang);
    const description = (lang === 'zh' ? post.seo_description_zh : post.seo_description_en)
      || getPostSummary(post, lang)
      || stripHtml(getPostContent(post, lang)).slice(0, 150);
    const canonical = absoluteUrl(`/news/${post.slug}`);
    const image = absoluteUrl(post.cover_image_url || FALLBACK_IMAGE);
    updateMeta('description', description);
    updateCanonical(canonical);
    updatePropertyMeta('og:type', 'article');
    updatePropertyMeta('og:title', title);
    updatePropertyMeta('og:description', description);
    updatePropertyMeta('og:url', canonical);
    updatePropertyMeta('og:image', image);
    updatePropertyMeta('twitter:card', 'summary_large_image');
    updatePropertyMeta('twitter:title', title);
    updatePropertyMeta('twitter:description', description);
    updatePropertyMeta('twitter:image', image);
    updateJsonLd('news-article-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description,
      image: image ? [image] : undefined,
      datePublished: getPostDate(post) || undefined,
      dateModified: post.updated_at || getPostDate(post) || undefined,
      author: {
        '@type': 'Organization',
        name: 'Yutong Magnet',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Yutong Magnet',
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl('/logo.png'),
        },
      },
      mainEntityOfPage: canonical,
    });
  }, [lang, post]);

  const articleHtml = post ? buildArticleHtml(getPostContent(post, lang)) : '';

  return (
    <main className={`news-page news-detail-page lang-${lang}`}>
      <section className="news-detail-hero">
        <div className="news-detail-hero-inner">
          <Link className="news-back-link" to="/news">← {copy.back}</Link>
          {post && (
            <>
              <span className="news-category-badge static">{getCategoryLabel(post.category, lang)}</span>
              <h1>{getPostTitle(post, lang)}</h1>
              <div className="news-detail-meta">
                <span>{copy.publishedAt}</span>
                <time>{formatDate(getPostDate(post), lang)}</time>
              </div>
              {getPostSummary(post, lang) && <p>{getPostSummary(post, lang)}</p>}
            </>
          )}
          {loading && <div className="news-loading detail">{copy.loading}</div>}
          {error && (
            <div className="news-detail-error">
              <h1>{copy.notFound}</h1>
              <p>{copy.notFoundText}</p>
            </div>
          )}
        </div>
      </section>

      {post && (
        <section className="news-article-shell">
          <article className="news-article">
            <img
              className="news-article-cover"
              src={post.cover_image_url || FALLBACK_IMAGE}
              alt={getImageAlt(post, lang)}
            />
            <div className="news-article-content">
              <div dangerouslySetInnerHTML={{ __html: articleHtml }} />
            </div>
          </article>

          {related.length > 0 && (
            <aside className="news-related">
              <h2>{copy.related}</h2>
              <div className="related-news-grid">
                {related.map((item) => (
                  <CategoryPostCard key={item.id} post={item} lang={lang} />
                ))}
              </div>
            </aside>
          )}
        </section>
      )}
    </main>
  );
}

function NewsPage() {
  const { lang } = useLanguage();
  const { slug } = useParams();

  useEffect(() => {
    document.body.classList.add('news-page-mode');
    return () => document.body.classList.remove('news-page-mode');
  }, []);

  if (slug) {
    return <NewsDetailPage slug={slug} lang={lang} />;
  }

  return <NewsListPage lang={lang} />;
}

export default NewsPage;

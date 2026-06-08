import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SplitTextReveal from '../components/SplitTextReveal';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './NewsPage.css';

const CATEGORY_OPTIONS = [
  { value: 'company', zh: '公司新闻', en: 'Company News' },
  { value: 'industry', zh: '行业资讯', en: 'Industry News' },
  { value: 'faq', zh: '常见问题', en: 'FAQ' },
];
const DEFAULT_CATEGORY = 'company';

const FALLBACK_IMAGE = '/contact-bg.jpg';
const CATEGORY_PAGE_SIZE = 6;
const FEATURED_SLIDE_SIZE = 5;
const RELATED_NEWS_LIMIT = 4;
const ARTICLE_CONTACT_EMAIL = 'wangwu@yutongglobal.com';
const ARTICLE_CONTACT_WHATSAPP = {
  label: '+86 131 0749 7745',
  href: 'https://wa.me/8613107497745',
};
const ARTICLE_SOCIAL_LOGOS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2.4" />
        <path fill="#fff" d="M14.1 8.8V7.55c0-.58.14-.9.93-.9h1.25V4.48a18.4 18.4 0 0 0-1.82-.09c-1.8 0-3.04 1.1-3.04 3.1V8.8H9.45v2.42h1.97v6.15h2.49v-6.15h2.05l.32-2.42h-2.18Z" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21.58 7.18a2.74 2.74 0 0 0-1.93-1.94C17.95 4.8 12 4.8 12 4.8s-5.95 0-7.65.44a2.74 2.74 0 0 0-1.93 1.94A28.3 28.3 0 0 0 2 12a28.3 28.3 0 0 0 .42 4.82 2.74 2.74 0 0 0 1.93 1.94c1.7.44 7.65.44 7.65.44s5.95 0 7.65-.44a2.74 2.74 0 0 0 1.93-1.94A28.3 28.3 0 0 0 22 12a28.3 28.3 0 0 0-.42-4.82Z" />
        <path fill="#fff" d="m10.05 15.18 5.13-3.18-5.13-3.18v6.36Z" />
      </svg>
    ),
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="2" />
        <circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2.4" />
        <path fill="#fff" d="M8.1 10.1H5.8v7.35h2.3V10.1ZM6.95 8.88a1.34 1.34 0 1 0 0-2.68 1.34 1.34 0 0 0 0 2.68Zm10.02 8.57h2.3v-4.04c0-2.16-1.16-3.16-2.7-3.16-1.24 0-1.8.68-2.1 1.16v-1.3h-2.21c.03.68 0 7.34 0 7.34h2.3v-4.1c0-.22.02-.44.08-.6.18-.44.58-.9 1.25-.9.89 0 1.24.68 1.24 1.66v3.94Z" />
      </svg>
    ),
  },
  {
    id: 'wechat',
    name: 'WeChat',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9.6 4.2C5.75 4.2 2.6 6.7 2.6 9.78c0 1.78 1.05 3.34 2.68 4.36l-.58 2.05 2.38-1.24c.8.23 1.67.36 2.58.36.22 0 .44-.01.65-.03a5.28 5.28 0 0 1-.22-1.49c0-3.06 2.95-5.54 6.6-5.54.25 0 .5.01.74.04C16.84 5.78 13.86 4.2 9.6 4.2Zm-2.34 4.9a.82.82 0 1 1 0-1.64.82.82 0 0 1 0 1.64Zm4.8 0a.82.82 0 1 1 0-1.64.82.82 0 0 1 0 1.64Z" />
        <path d="M16.68 9.55c-3.02 0-5.48 1.96-5.48 4.38 0 2.42 2.46 4.38 5.48 4.38.68 0 1.33-.1 1.92-.28l1.86.97-.45-1.6c1.26-.8 2.05-2.01 2.05-3.37 0-2.42-2.46-4.38-5.38-4.38Zm-1.78 3.36a.66.66 0 1 1 0-1.32.66.66 0 0 1 0 1.32Zm3.72 0a.66.66 0 1 1 0-1.32.66.66 0 0 1 0 1.32Z" />
      </svg>
    ),
  },
];
const LOCAL_PREVIEW_RELATED_NEWS = [
  {
    id: 'preview-related-ferrite-shapes',
    slug: '',
    category: 'company',
    title_zh: '铁氧体磁铁常见形状与选型要点',
    title_en: 'Common Ferrite Magnet Shapes and Selection Notes',
    cover_image_url: '/uploads/news/ferrite-neodymium-magnets-cover.png',
    cover_image_alt_zh: '铁氧体磁铁与钕铁硼磁铁产品展示',
    cover_image_alt_en: 'Ferrite and neodymium magnet product display',
    published_at: '2026-06-03T09:30:00+08:00',
    isPreview: true,
  },
  {
    id: 'preview-related-ndfeb-custom',
    slug: '',
    category: 'company',
    title_zh: '钕铁硼磁铁定制中需要关注的尺寸与磁力',
    title_en: 'Dimensions and Magnetic Force in NdFeB Magnet Customization',
    cover_image_url: '/uploads/news/ferrite-neodymium-magnets-cover.png',
    cover_image_alt_zh: '钕铁硼磁铁定制产品展示',
    cover_image_alt_en: 'Custom neodymium magnet product display',
    published_at: '2026-06-01T14:20:00+08:00',
    isPreview: true,
  },
  {
    id: 'preview-related-magnet-packaging',
    slug: '',
    category: 'company',
    title_zh: '磁铁产品包装与批量交付的稳定性要求',
    title_en: 'Packaging and Batch Delivery Requirements for Magnet Products',
    cover_image_url: '/uploads/news/ferrite-neodymium-magnets-cover.png',
    cover_image_alt_zh: '磁铁产品包装与供应展示',
    cover_image_alt_en: 'Magnet product packaging and supply display',
    published_at: '2026-05-28T10:10:00+08:00',
    isPreview: true,
  },
  {
    id: 'preview-related-magnet-applications',
    slug: '',
    category: 'company',
    title_zh: '圆片、方块与圆环磁铁在产品开发中的应用',
    title_en: 'Disc, Block and Ring Magnets in Product Development',
    cover_image_url: '/uploads/news/ferrite-neodymium-magnets-cover.png',
    cover_image_alt_zh: '多种形状磁铁产品展示',
    cover_image_alt_en: 'Multiple magnet shapes product display',
    published_at: '2026-05-22T11:00:00+08:00',
    isPreview: true,
  },
];

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
    recommended: '推荐阅读',
    moreNews: '查看更多',
    contactEmail: '电子邮件',
    contactWhatsApp: 'WhatsApp',
    contactEmailLabel: '发送邮件至',
    contactWhatsAppLabel: '通过 WhatsApp 联系',
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
    recommended: 'Recommended',
    moreNews: 'View More',
    contactEmail: 'Email',
    contactWhatsApp: 'WhatsApp',
    contactEmailLabel: 'Send email to',
    contactWhatsAppLabel: 'Contact on WhatsApp',
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

function normalizeCategory(value) {
  return CATEGORY_OPTIONS.some((category) => category.value === value) ? value : DEFAULT_CATEGORY;
}

function getCategoryFromSearch(search) {
  return normalizeCategory(new URLSearchParams(search).get('category') || DEFAULT_CATEGORY);
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

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const pad = (part) => String(part).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

function getSafeTextColor(value) {
  const color = String(value || '').trim();
  if (!color || /[<>"'`;{}]/.test(color) || /(url|expression|var|calc|@|\\)/i.test(color)) {
    return '';
  }

  const hexPattern = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
  const rgbPattern = /^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*,\s*(?:0?\.\d+|1(?:\.0+)?|0|[1-9]\d?%|100%))?\s*\)$/i;

  if (hexPattern.test(color) || rgbPattern.test(color)) return color;
  if (typeof window !== 'undefined' && window.CSS?.supports?.('color', color)) return color;
  return '';
}

function getSafeColorStyle(style) {
  const colorDeclaration = String(style || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => /^color\s*:/i.test(part));

  if (!colorDeclaration) return '';
  const color = getSafeTextColor(colorDeclaration.replace(/^color\s*:/i, ''));
  return color ? `color: ${color}` : '';
}

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName !== 'style') return;

  const safeStyle = getSafeColorStyle(data.attrValue);
  if (safeStyle) {
    data.attrValue = safeStyle;
    return;
  }

  data.keepAttr = false;
});

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
      'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's',
      'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'loading', 'colspan', 'rowspan', 'id', 'style'],
  });
}

function getTocTitle(lang) {
  return lang === 'zh' ? '文章目录' : 'Article Contents';
}

function getUniqueTocId(base, usedIds) {
  let id = String(base || '').trim().replace(/\s+/g, '-');
  if (!id) id = 'section';

  let uniqueId = id;
  let count = 2;
  while (usedIds.has(uniqueId)) {
    uniqueId = `${id}-${count}`;
    count += 1;
  }

  usedIds.add(uniqueId);
  return uniqueId;
}

function createTocId(text, index, usedIds) {
  const normalized = String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return getUniqueTocId(normalized || `section-${index + 1}`, usedIds);
}

function buildArticleWithToc(html) {
  if (!html || typeof document === 'undefined') {
    return { html, tocItems: [] };
  }

  const container = document.createElement('div');
  container.innerHTML = html;

  const usedIds = new Set();
  const tocItems = [];
  const headings = Array.from(container.querySelectorAll('h2'));

  headings.forEach((heading) => {
    const text = heading.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;

    const id = heading.id
      ? getUniqueTocId(heading.id, usedIds)
      : createTocId(text, tocItems.length, usedIds);

    heading.id = id;
    heading.tabIndex = -1;
    tocItems.push({
      id,
      text,
      level: heading.tagName.toLowerCase(),
    });
  });

  return { html: container.innerHTML, tocItems };
}

function scrollToArticleSection(event, id) {
  event.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.focus({ preventScroll: true });

  if (window.history?.replaceState) {
    window.history.replaceState(null, '', `#${id}`);
  }
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

function uniquePosts(posts) {
  const seen = new Set();
  return posts.filter((post) => {
    const key = post.slug || post.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickRelatedPosts(posts, currentPost, limit = RELATED_NEWS_LIMIT) {
  const candidates = (Array.isArray(posts) ? posts : [])
    .filter((item) => item && item.slug !== currentPost?.slug && item.id !== currentPost?.id);

  const sameCategory = sortPosts(candidates.filter((item) => item.category === currentPost?.category), true);
  const featured = sortPosts(candidates.filter((item) => item.featured), true);
  const latest = sortPosts(candidates, true);

  return uniquePosts([...sameCategory, ...featured, ...latest]).slice(0, limit);
}

function isLocalPreviewHost() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function fillLocalPreviewRelatedPosts(posts, currentPost, limit = RELATED_NEWS_LIMIT) {
  const relatedPosts = Array.isArray(posts) ? posts : [];
  if (!isLocalPreviewHost() || relatedPosts.length >= limit) {
    return relatedPosts.slice(0, limit);
  }

  const previews = LOCAL_PREVIEW_RELATED_NEWS
    .filter((item) => item.slug !== currentPost?.slug && item.id !== currentPost?.id);

  return uniquePosts([...relatedPosts, ...previews]).slice(0, limit);
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
          <SplitTextReveal
            as={Link}
            to={`/news/${post.slug}`}
            text={title}
            className="featured-hero-title-link"
            splitType="chars"
            delay={30}
            startDelay={0.18}
            duration={1.05}
            fromY={58}
          />
        </h2>
        {summary && (
          <p>
            <SplitTextReveal
              text={summary}
              className="featured-hero-summary-text"
              splitType="chars"
              delay={11}
              startDelay={0.72}
              duration={0.85}
              fromY={24}
            />
          </p>
        )}
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

function RecommendedNewsCard({ post, lang }) {
  const title = getPostTitle(post, lang);
  const cardContent = (
    <>
      <span className="news-recommendation-media">
        <NewsImage post={post} lang={lang} />
      </span>
      <span className="news-recommendation-body">
        <span className="news-recommendation-title">{title}</span>
        <time dateTime={getPostDate(post)}>{formatDate(getPostDate(post), lang)}</time>
      </span>
    </>
  );

  if (post.isPreview || !post.slug) {
    return (
      <article className="news-recommendation-card is-preview">
        {cardContent}
      </article>
    );
  }

  return (
    <Link className="news-recommendation-card" to={`/news/${post.slug}`} aria-label={title}>
      {cardContent}
    </Link>
  );
}

function ArticleCoverSocials() {
  return (
    <div className="news-cover-socials" aria-label="Social media">
      {ARTICLE_SOCIAL_LOGOS.map((item) => (
        <span
          key={item.id}
          className={`news-cover-social-logo is-${item.id}`}
          title={item.name}
          aria-label={item.name}
          role="img"
        >
          <span className="news-cover-social-icon is-base">{item.icon}</span>
          <span className="news-cover-social-icon is-hover" aria-hidden="true">
            {item.icon}
          </span>
        </span>
      ))}
    </div>
  );
}

function ArticleContactCard({ lang }) {
  const copy = getCopy(lang);

  return (
    <section className="news-article-contact" aria-label={`${copy.contactEmail} / ${copy.contactWhatsApp}`}>
      <div className="news-article-contact-links">
        <a
          className="news-article-contact-link is-email"
          href={`mailto:${ARTICLE_CONTACT_EMAIL}`}
          aria-label={`${copy.contactEmailLabel} ${ARTICLE_CONTACT_EMAIL}`}
        >
          <span className="news-article-contact-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.75" y="5" width="18.5" height="14" rx="2.5" />
              <path d="m21 7.5-7.95 5.05a2 2 0 0 1-2.1 0L3 7.5" />
            </svg>
          </span>
          <span className="news-article-contact-label">{copy.contactEmail}</span>
          <span className="news-article-contact-value">{ARTICLE_CONTACT_EMAIL}</span>
        </a>

        <a
          className="news-article-contact-link is-whatsapp"
          href={ARTICLE_CONTACT_WHATSAPP.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`${copy.contactWhatsAppLabel} ${ARTICLE_CONTACT_WHATSAPP.label}`}
        >
          <span className="news-article-contact-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </span>
          <span className="news-article-contact-label">{copy.contactWhatsApp}</span>
          <span className="news-article-contact-value">{ARTICLE_CONTACT_WHATSAPP.label}</span>
        </a>
      </div>
    </section>
  );
}

function NewsListPage({ lang }) {
  const copy = getCopy(lang);
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(() => getCategoryFromSearch(location.search));
  const [page, setPage] = useState(1);
  const [featuredOffset, setFeaturedOffset] = useState(0);
  const [featuredDirection, setFeaturedDirection] = useState('next');

  usePageTitle(copy.listTitle);

  useEffect(() => {
    updateMeta('description', copy.heroText);
  }, [copy.heroText]);

  useEffect(() => {
    setActiveCategory(getCategoryFromSearch(location.search));
  }, [location.search]);

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

  function selectCategory(category) {
    const nextCategory = normalizeCategory(category);
    setActiveCategory(nextCategory);
    navigate(`/news?category=${nextCategory}`);
  }

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
                    onClick={() => selectCategory(category.value)}
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
  const [activeTocId, setActiveTocId] = useState('');

  useEffect(() => {
    document.body.classList.add('news-detail-page-mode');
    return () => document.body.classList.remove('news-detail-page-mode');
  }, []);

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
          fetch('/api/news?page=1&pageSize=30'),
        ]);

        const detailData = await detailResponse.json();
        if (!detailResponse.ok || !detailData.success) {
          throw new Error(detailData.message || copy.notFound);
        }

        const listData = await listResponse.json();
        if (alive) {
          const currentPost = detailData.data;
          const relatedPosts = pickRelatedPosts(
            Array.isArray(listData.data) ? listData.data : [],
            currentPost,
          );
          setPost(currentPost);
          setRelated(fillLocalPreviewRelatedPosts(relatedPosts, currentPost));
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

  const articleContent = post ? getPostContent(post, lang) : '';
  const baseArticleHtml = useMemo(() => buildArticleHtml(articleContent), [articleContent]);
  const article = useMemo(() => buildArticleWithToc(baseArticleHtml), [baseArticleHtml]);
  const showToc = article.tocItems.length > 1;
  const detailTitle = post ? getPostTitle(post, lang) : '';
  const detailDate = post ? getPostDate(post) : '';
  const detailDateTime = post ? formatDateTime(detailDate) : '';
  const hasRecommendations = related.length > 0;

  useEffect(() => {
    if (!showToc) {
      setActiveTocId('');
      return undefined;
    }

    setActiveTocId(article.tocItems[0].id);
    const headings = article.tocItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!headings.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];

      if (visibleEntry?.target?.id) {
        setActiveTocId(visibleEntry.target.id);
      }
    }, {
      rootMargin: '-24% 0px -58% 0px',
      threshold: [0, 1],
    });

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [article.tocItems, showToc]);

  return (
    <main className={`news-page news-detail-page lang-${lang}`}>
      {(loading || error) && (
        <section className="news-article-shell news-detail-state-shell">
          {loading && <div className="news-loading">{copy.loading}</div>}
          {error && (
            <div className="news-error">
              <h1>{copy.notFound}</h1>
              <p>{copy.notFoundText}</p>
            </div>
          )}
        </section>
      )}

      {post && (
        <section className="news-article-shell">
          <article className={`news-article${showToc ? ' has-toc' : ''}${hasRecommendations ? ' has-recommendations' : ''}`}>
            {showToc && (
              <nav className="news-article-toc" aria-label={getTocTitle(lang)}>
                <h2>{getTocTitle(lang)}</h2>
                <ol>
                  {article.tocItems.map((item, index) => (
                    <li key={item.id} className={`toc-${item.level}`}>
                      <a
                        className={activeTocId === item.id ? 'active' : ''}
                        href={`#${item.id}`}
                        onClick={(event) => {
                          setActiveTocId(item.id);
                          scrollToArticleSection(event, item.id);
                        }}
                      >
                        <span className="toc-index">{String(index + 1).padStart(2, '0')}</span>
                        <span className="toc-text">{item.text}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="news-article-main">
              <header className="news-article-header">
                <Link className="news-article-back" to="/news">
                  <span aria-hidden="true">←</span>
                  <span>{copy.back}</span>
                </Link>
                <h1>{detailTitle}</h1>
                <time className="news-article-time" dateTime={detailDate}>
                  <span className="news-article-time-icon" aria-hidden="true" />
                  <span>{detailDateTime}</span>
                </time>
              </header>
              <img
                className="news-article-cover"
                src={post.cover_image_url || FALLBACK_IMAGE}
                alt={getImageAlt(post, lang)}
              />
              <ArticleCoverSocials />
              <div className="news-article-body">
                <div className="news-article-content">
                  <div dangerouslySetInnerHTML={{ __html: article.html }} />
                </div>
              </div>
              <ArticleContactCard lang={lang} />
            </div>

            {hasRecommendations && (
              <aside className="news-recommendations" aria-label={copy.recommended}>
                <h2>{copy.recommended}</h2>
                <div className="news-recommendation-list">
                  {related.map((item) => (
                    <RecommendedNewsCard key={item.id} post={item} lang={lang} />
                  ))}
                </div>
                <Link className="news-recommendation-more" to="/news">
                  <span>{copy.moreNews}</span>
                </Link>
              </aside>
            )}
          </article>
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

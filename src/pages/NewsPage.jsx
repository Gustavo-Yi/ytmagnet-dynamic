import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { Link, useParams } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './NewsPage.css';

const CATEGORY_OPTIONS = [
  { value: 'company', zh: '公司动态', en: 'Company News' },
  { value: 'product', zh: '产品知识', en: 'Product Insights' },
  { value: 'industry', zh: '行业资讯', en: 'Industry News' },
];

const FALLBACK_IMAGE = '/contact-bg.jpg';
const CATEGORY_PAGE_SIZE = 6;
const FEATURED_SLIDE_SIZE = 5;

const COPY = {
  zh: {
    listTitle: '新闻中心',
    listSubtitle: '宇通磁业资讯',
    heroText: '了解宇通磁业最新动态、行业趋势与产品知识，掌握磁性应用的前沿信息与解决方案。',
    featuredTitle: '精选新闻',
    featuredEyebrow: '重点推荐',
    categoryTitle: '新闻分类',
    readNow: '立即阅读',
    readMore: '阅读全文',
    loading: '正在加载新闻内容...',
    emptyTitle: '暂无新闻内容',
    emptyText: '后台发布新闻后，这里会自动展示公司动态、产品知识和行业资讯。',
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
    heroText: 'Explore Yutong Magnet updates, industry trends, and practical product insights for magnetic applications.',
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

const DEMO_IMAGES = [
  '/news-center-hero.png',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1200&q=80',
];

const DEMO_NEWS_SOURCE = [
  ['company', '从钕铁硼到铁氧体，双工厂打造全球化磁铁供应能力', 'From NdFeB to ferrite, dual factories build global magnet supply capability', '整合钕铁硼与铁氧体制造资源，持续为全球客户提供高效、稳定、可靠的磁材供应。', 'Integrating NdFeB and ferrite manufacturing resources to provide efficient, stable, and reliable magnetic material supply for global customers.'],
  ['company', '宇通磁业完成海外客户定制磁组件交付', 'Yutong Magnet completes custom magnetic assembly delivery', '项目覆盖结构设计、磁路优化与装配验证，满足客户对吸附力和耐腐蚀性的双重要求。', 'The project covered structural design, magnetic circuit optimization, and assembly validation.'],
  ['company', '质量实验室升级磁性能检测流程', 'Quality lab upgrades magnetic performance testing workflow', '通过更细致的批次追踪和数据复核，进一步保障钕铁硼、铁氧体产品的一致性。', 'Batch tracking and review workflows improve consistency across NdFeB and ferrite products.'],
  ['company', '宇通磁业参加国际工业材料采购交流会', 'Yutong Magnet joins industrial material sourcing event', '团队展示磁性组件、磁力工具与定制磁解决方案，拓展海外采购商沟通渠道。', 'The team presented magnetic assemblies, tools, and custom solutions for overseas sourcing teams.'],
  ['company', '自动化包装线投入试运行', 'Automated packaging line enters trial operation', '新包装线适配多种磁体规格，减少搬运损耗，提高小批量和多批次订单处理效率。', 'The new packaging line supports multiple magnet sizes while reducing handling damage.'],
  ['company', '宇通磁业优化样品订单响应机制', 'Yutong Magnet optimizes sample order response', '针对研发型客户建立快速样品流程，让磁体选型、打样和复测衔接更顺畅。', 'A faster sample workflow helps R&D customers move from selection to testing more smoothly.'],
  ['company', '环保与安全管理体系完成年度复审', 'Environmental and safety management system completes annual review', '复审覆盖生产、仓储和包装环节，推动磁性材料制造流程更加规范。', 'The review covered production, warehousing, and packaging for a more standardized process.'],
  ['product', '钕铁硼磁体与铁氧体磁体如何选择', 'How to choose between NdFeB and ferrite magnets', '从磁力、温度、成本和应用场景四个角度，快速判断项目更适合哪类磁体。', 'Compare magnetic force, temperature tolerance, cost, and applications to choose the right magnet.'],
  ['product', '磁力挂钩的吸附力为什么会变化', 'Why magnetic hook pull force changes', '吸附面厚度、表面涂层、受力方向和测试方式都会影响实际吸附表现。', 'Surface thickness, coating, force direction, and testing method all affect real pull force.'],
  ['product', '耐高温磁体选型需要关注哪些参数', 'Key parameters for high-temperature magnet selection', '除了最高工作温度，还要关注剩磁衰减、涂层稳定性和装配环境。', 'Beyond max working temperature, check magnetic decay, coating stability, and assembly context.'],
  ['product', '磁性分离器在生产线中的应用', 'Applications of magnetic separators in production lines', '磁性分离设备可用于粉料、颗粒和液体管道场景，帮助降低金属杂质风险。', 'Magnetic separators reduce metal contamination risk in powder, particle, and liquid lines.'],
  ['product', '定制磁组件设计中的磁路思路', 'Magnetic circuit ideas for custom assemblies', '通过外壳、导磁件和磁体排布协同设计，可在有限空间内提升有效吸附力。', 'Coordinating shell, yoke, and magnet layout can improve pull force within limited space.'],
  ['product', '如何判断磁体镀层是否适合潮湿环境', 'How to judge if a magnet coating suits humid environments', '镍铜镍、环氧和锌镀层在耐腐蚀性、外观和成本上各有侧重点。', 'NiCuNi, epoxy, and zinc coatings differ in corrosion resistance, appearance, and cost.'],
  ['product', '磁体运输包装为什么要做隔磁处理', 'Why magnet shipments need magnetic shielding', '强磁产品在运输中需要控制外部磁场，降低吸附、碰撞和物流合规风险。', 'Strong magnets need field control during shipment to reduce attraction and logistics risks.'],
  ['industry', '全球稀土磁材市场需求持续增长', 'Global rare-earth magnet demand continues to grow', '新能源、自动化和消费电子领域推动高性能磁材需求保持活跃。', 'New energy, automation, and electronics continue to drive demand for high-performance magnets.'],
  ['industry', '工业自动化带动磁性组件应用升级', 'Industrial automation upgrades magnetic assembly applications', '自动化设备对稳定吸附、快速定位和紧凑结构提出更高要求。', 'Automation equipment demands stable holding force, fast positioning, and compact structures.'],
  ['industry', '磁性材料企业如何应对小批量多品种订单', 'How magnet suppliers handle low-volume high-mix orders', '柔性排产、标准化检测和快速打样成为磁性材料供应链的重要能力。', 'Flexible scheduling, standardized testing, and fast sampling are becoming supply-chain strengths.'],
  ['industry', '绿色制造推动磁材工艺持续改进', 'Green manufacturing drives magnet process improvements', '节能设备、废料管理和涂层工艺优化正在成为行业竞争力的一部分。', 'Energy-saving equipment, waste management, and coating optimization are becoming competitive factors.'],
  ['industry', '海外采购更关注磁体一致性与可追溯性', 'Overseas buyers focus more on magnet consistency and traceability', '批次数据、检测报告和包装规范正在影响国际客户的供应商选择。', 'Batch data, testing reports, and packaging standards increasingly affect supplier selection.'],
  ['industry', '高性能磁材在智能制造中的新机会', 'New opportunities for high-performance magnets in smart manufacturing', '传感器、夹具、分拣和执行机构都在扩大磁性材料的应用边界。', 'Sensors, fixtures, sorting systems, and actuators are expanding magnet applications.'],
  ['industry', '原材料价格波动下的磁体采购策略', 'Magnet sourcing strategies amid raw material price changes', '提前锁定规格、分阶段备货和替代材料评估，有助于降低项目风险。', 'Locking specifications, phased stocking, and alternative material checks help reduce project risk.'],
];

const DEMO_NEWS_POSTS = DEMO_NEWS_SOURCE.map((item, index) => {
  const [category, titleZh, titleEn, summaryZh, summaryEn] = item;
  const date = new Date(Date.UTC(2026, 4, 24 - index, 8, 0, 0)).toISOString();

  return {
    id: `demo-${index + 1}`,
    slug: `demo-news-${index + 1}`,
    category,
    pinned: index === 0 ? 1 : 0,
    featured: index < 8 ? 1 : 0,
    title_zh: titleZh,
    title_en: titleEn,
    summary_zh: summaryZh,
    summary_en: summaryEn,
    content_zh: `${summaryZh}\n\n这是一条用于预览新闻中心版式的示例内容。正式发布后，这里会展示后台填写的新闻正文、产品说明和行业洞察。\n\n页面会保留标题、封面、摘要、分类和日期，方便搜索引擎理解新闻主题，也方便客户快速浏览重点信息。`,
    content_en: `${summaryEn}\n\nThis is demo content used to preview the news center layout. Published articles will display the real article body, product notes, and industry insights from the admin dashboard.\n\nThe page keeps the title, cover image, summary, category, and date structured for readability and SEO.`,
    cover_image_url: DEMO_IMAGES[index % DEMO_IMAGES.length],
    cover_image_alt_zh: titleZh,
    cover_image_alt_en: titleEn,
    published_at: date,
    created_at: date,
  };
});

DEMO_NEWS_POSTS[0] = {
  ...DEMO_NEWS_POSTS[0],
  title_zh: '从钕铁硼到铁氧体，双工厂打造全球化磁铁供应能力',
  title_en: 'From NdFeB to ferrite, dual factories build global magnet supply capability',
  summary_zh: '宇通磁业整合钕铁硼与铁氧体制造资源，围绕交期、质量和定制能力升级海外订单响应体系。',
  summary_en: 'Yutong Magnet is integrating NdFeB and ferrite manufacturing resources to improve lead time, quality control, and custom-order response for overseas customers.',
  content_zh: `近日，宇通磁业围绕海外客户对磁性材料稳定供应的需求，对钕铁硼与铁氧体两类产品线进行了协同升级。通过双工厂资源整合，公司进一步优化了样品评估、批量排产、性能检测和包装出货等关键环节。

在钕铁硼产品方面，团队重点提升了小批量多规格订单的响应效率。针对客户在自动化设备、传感器、吸附组件和磁力工具中的不同应用，公司会在前期沟通阶段同步确认尺寸公差、表面处理、磁性能等级和装配方式，减少反复打样造成的时间损耗。

铁氧体产品线则继续发挥成本稳定、耐温性好、适合大批量应用的优势。对于扬声器、电机、磁选设备以及日常工业配套件，宇通磁业通过标准化模具管理和批次追踪机制，保证不同批次产品在尺寸、外观和磁性能上的一致性。

为了让客户更直观地判断材料选择，公司在技术沟通中会根据使用温度、吸附力要求、耐腐蚀环境、装配空间和目标成本提供对比建议。对于需要定制磁组件的项目，工程团队还会协助完成磁路布局、外壳结构和装配验证方案。

质量控制方面，宇通磁业将来料检验、过程抽检、成品检测和出货复核进行节点化管理。每个批次都会记录关键检测数据，必要时可配合客户提供磁性能、尺寸、镀层和包装相关的检验资料。

此次供应体系优化后，宇通磁业希望为海外采购商提供更清晰的选型路径和更稳定的交付体验。从样品确认到批量交付，公司将继续围绕“可沟通、可追踪、可验证”的服务标准，提升磁性材料项目的整体协作效率。`,
  content_en: `Yutong Magnet has recently upgraded the coordination between its NdFeB and ferrite production lines to support overseas customers with more stable supply, clearer technical communication, and faster order response.

For NdFeB products, the team is focusing on high-mix, low-volume orders that are common in automation equipment, sensors, holding assemblies, and magnetic tools. During early project communication, engineers confirm tolerance, coating, magnetic grade, assembly method, and application conditions to reduce repeated sampling and shorten the validation cycle.

The ferrite product line continues to serve applications that require stable cost, good temperature resistance, and large-volume consistency. Through standardized tooling management and batch traceability, Yutong Magnet keeps product size, appearance, and magnetic performance consistent across repeat orders.

To help customers choose the right material, the company compares working temperature, required holding force, corrosion environment, assembly space, and target cost during technical discussion. For custom magnetic assemblies, the engineering team can also support magnetic circuit layout, housing structure, and assembly validation.

Quality control is managed through incoming inspection, in-process checks, final inspection, and shipment review. Key inspection data is recorded by batch, and related magnetic performance, dimensional, coating, and packaging information can be provided when required.

With this supply-system upgrade, Yutong Magnet aims to provide overseas buyers with a clearer selection path and a more reliable delivery experience. From sample confirmation to batch shipment, the company will continue improving project collaboration around communication, traceability, and verification.`,
  seo_description_zh: '宇通磁业通过整合钕铁硼与铁氧体双工厂资源，提升海外客户样品确认、批量排产、质量追踪和磁组件定制服务效率。',
  seo_description_en: 'Yutong Magnet upgrades its NdFeB and ferrite supply system to improve sampling, production scheduling, quality traceability, and custom magnetic assembly service.',
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
          const loadedPosts = Array.isArray(data.data) ? data.data : [];
          setPosts(loadedPosts.length > 0 ? loadedPosts : DEMO_NEWS_POSTS);
        }
      } catch {
        if (alive) {
          setPosts(DEMO_NEWS_POSTS);
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
        const demoPost = DEMO_NEWS_POSTS.find((item) => item.slug === slug);
        if (alive && demoPost) {
          setPost(demoPost);
          setRelated(DEMO_NEWS_POSTS.filter((item) => item.slug !== slug).slice(0, 3));
          setError('');
        } else if (alive) {
          setError(err.message || copy.notFound);
        }
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

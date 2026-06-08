import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import usePageTitle from '../hooks/usePageTitle';
import './Admin.css';
import './AdminDashboard.css';

const COUNTRY_META = {
    '+1': { name: '美国', flagCode: 'us' },
    '+33': { name: '法国', flagCode: 'fr' },
    '+34': { name: '西班牙', flagCode: 'es' },
    '+39': { name: '意大利', flagCode: 'it' },
    '+44': { name: '英国', flagCode: 'gb' },
    '+49': { name: '德国', flagCode: 'de' },
    '+61': { name: '澳大利亚', flagCode: 'au' },
    '+81': { name: '日本', flagCode: 'jp' },
    '+82': { name: '韩国', flagCode: 'kr' },
    '+86': { name: '中国', flagCode: 'cn' },
    '+91': { name: '印度', flagCode: 'in' },
};

const NEWS_CATEGORIES = [
    { value: 'company', label: '公司新闻' },
    { value: 'industry', label: '行业资讯' },
    { value: 'faq', label: '常见问题' },
];

const NEWS_STATUS = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
];

const MESSAGE_PAGE_SIZE = 7;
const NEWS_PAGE_SIZE = 8;

const EMPTY_NEWS_FORM = {
    slug: '',
    category: 'company',
    status: 'draft',
    pinned: false,
    title_zh: '',
    title_en: '',
    summary_zh: '',
    summary_en: '',
    content_zh: '',
    content_en: '',
    cover_image_key: '',
    cover_image_url: '',
    cover_image_alt_zh: '',
    cover_image_alt_en: '',
    seo_title_zh: '',
    seo_title_en: '',
    seo_description_zh: '',
    seo_description_en: '',
    featured: false,
    published_at: '',
};

const Icon = ({ name }) => {
    const icons = {
        home: <path d="m3 10 9-7 9 7v10h-6v-6H9v6H3V10Z" />,
        message: <path d="M5 6.5h14v9H9l-4 3v-12Z" />,
        document: <path d="M8 3.5h6l4 4V20H8V3.5Zm6 0v4h4M10.5 11h5M10.5 14h5M10.5 17h3" />,
        news: <path d="M4 5h16v14H4V5Zm3 4h5M7 12h5M7 15h3M15 9h2M15 12h2M15 15h2" />,
        clock: <path d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
        search: <path d="m20 20-4.2-4.2M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z" />,
        view: <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
        trash: <path d="M5 7h14M10 11v5M14 11v5M8 7l1-3h6l1 3M7 7l1 13h8l1-13" />,
        close: <path d="M6 6l12 12M18 6 6 18" />,
        logout: <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />,
        plus: <path d="M12 5v14M5 12h14" />,
        edit: <path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />,
        upload: <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v3h16v-3" />,
        image: <path d="M4 5h16v14H4V5Zm3 10 3.5-4 2.5 3 2-2.3 3 3.3M8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
        refresh: <path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6.2 6.4L4 8.5m2 6.5a7 7 0 0 0 11.8 2.6L20 15.5" />,
        filter: <path d="M4 6h16M7 12h10M10 18h4" />,
        save: <path d="M5 4h12l2 2v14H5V4Zm3 0v6h8V4M8 16h8" />,
        star: <path d="m12 3 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9L12 3Z" />,
    };

    return (
        <svg className="admin-icon" viewBox="0 0 24 24" aria-hidden="true">
            {icons[name]}
        </svg>
    );
};

const getCountryMeta = (code) => COUNTRY_META[code] || { name: '其他', flagCode: '' };
const getCategoryLabel = (value) => NEWS_CATEGORIES.find((item) => item.value === value)?.label || value || '-';
const getStatusLabel = (value) => NEWS_STATUS.find((item) => item.value === value)?.label || value || '-';
const flagUrl = (flagCode) => `https://flagcdn.com/24x18/${flagCode}.png`;

const formatDateParts = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: '-', time: '-' };

    return {
        date: date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }),
        time: date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }),
    };
};

const formatDateTime = (value) => {
    const parts = formatDateParts(value);
    return parts.date === '-' ? '-' : `${parts.date} ${parts.time}`;
};

const toDateTimeLocalInput = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const toIsoOrNull = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const stripHtmlText = (value) => String(value || '')
    .replace(/<img\b[^>]*>/gi, ' image ')
    .replace(/<table\b[^>]*>/gi, ' table ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeRichTextForSave = (value) => {
    const html = String(value || '').trim();
    return stripHtmlText(html) ? html : '';
};

const isSameDay = (value, date = new Date()) => {
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) return false;

    return target.getFullYear() === date.getFullYear()
        && target.getMonth() === date.getMonth()
        && target.getDate() === date.getDate();
};

const normalizeNewsForm = (post = {}) => ({
    ...EMPTY_NEWS_FORM,
    ...post,
    category: NEWS_CATEGORIES.some((category) => category.value === post.category)
        ? post.category
        : EMPTY_NEWS_FORM.category,
    pinned: Boolean(post.pinned),
    featured: Boolean(post.featured),
    published_at: post.published_at ? toDateTimeLocalInput(post.published_at) : '',
});

const AdminPage = () => {
    const [activeSection, setActiveSection] = useState('messages');
    usePageTitle(activeSection === 'news' ? '新闻中心管理' : '留言管理');

    const [messages, setMessages] = useState([]);
    const [messageLoading, setMessageLoading] = useState(true);
    const [messageSearch, setMessageSearch] = useState('');
    const [messagePage, setMessagePage] = useState(1);
    const [detailMessage, setDetailMessage] = useState(null);

    const [newsPosts, setNewsPosts] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsLoaded, setNewsLoaded] = useState(false);
    const [newsSearch, setNewsSearch] = useState('');
    const [newsCategoryFilter, setNewsCategoryFilter] = useState('all');
    const [newsStatusFilter, setNewsStatusFilter] = useState('all');
    const [newsPage, setNewsPage] = useState(1);
    const [newsDrawerMode, setNewsDrawerMode] = useState(null);
    const [newsEditingId, setNewsEditingId] = useState(null);
    const [newsForm, setNewsForm] = useState(EMPTY_NEWS_FORM);
    const [newsSaving, setNewsSaving] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [notice, setNotice] = useState(null);

    const navigate = useNavigate();

    const requireToken = useCallback(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
            return null;
        }
        return token;
    }, [navigate]);

    const handleUnauthorized = useCallback(() => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    }, [navigate]);

    const fetchMessages = useCallback(async () => {
        const token = requireToken();
        if (!token) return;

        try {
            const response = await fetch('/api/admin/messages', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();
            if (data.success) {
                setMessages(Array.isArray(data.data) ? data.data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMessageLoading(false);
        }
    }, [handleUnauthorized, requireToken]);

    const fetchNews = useCallback(async () => {
        const token = requireToken();
        if (!token) return;

        setNewsLoading(true);
        try {
            const response = await fetch('/api/admin/news?page=1&pageSize=100', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();
            if (data.success) {
                setNewsPosts(Array.isArray(data.data) ? data.data : []);
                setNewsLoaded(true);
            } else {
                setNotice({ type: 'error', text: data.message || '新闻列表加载失败' });
            }
        } catch (err) {
            console.error(err);
            setNotice({ type: 'error', text: '新闻列表加载失败，请稍后重试' });
        } finally {
            setNewsLoading(false);
        }
    }, [handleUnauthorized, requireToken]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (activeSection === 'news' && !newsLoaded) {
            fetchNews();
        }
    }, [activeSection, fetchNews, newsLoaded]);

    useEffect(() => {
        setMessagePage(1);
    }, [messageSearch]);

    useEffect(() => {
        setNewsPage(1);
    }, [newsSearch, newsCategoryFilter, newsStatusFilter]);

    const filteredMessages = useMemo(() => {
        const keyword = messageSearch.trim().toLowerCase();
        if (!keyword) return messages;

        return messages.filter((msg) => {
            const meta = getCountryMeta(msg.country_code);
            return [
                msg.name,
                msg.email,
                msg.whatsapp,
                msg.country_code,
                meta.name,
                msg.message,
            ].filter(Boolean).join(' ').toLowerCase().includes(keyword);
        });
    }, [messages, messageSearch]);

    const filteredNewsPosts = useMemo(() => {
        const keyword = newsSearch.trim().toLowerCase();

        return newsPosts.filter((post) => {
            if (newsCategoryFilter !== 'all' && post.category !== newsCategoryFilter) return false;
            if (newsStatusFilter !== 'all' && post.status !== newsStatusFilter) return false;
            if (!keyword) return true;

            return [
                post.title_zh,
                post.title_en,
                post.slug,
                post.summary_zh,
                post.summary_en,
                post.content_zh,
                post.content_en,
                post.pinned ? '置顶新闻' : '',
                post.featured ? '精选新闻' : '',
                getCategoryLabel(post.category),
                getStatusLabel(post.status),
            ].filter(Boolean).join(' ').toLowerCase().includes(keyword);
        });
    }, [newsCategoryFilter, newsPosts, newsSearch, newsStatusFilter]);

    const messageTotalPages = Math.max(1, Math.ceil(filteredMessages.length / MESSAGE_PAGE_SIZE));
    const safeMessagePage = Math.min(messagePage, messageTotalPages);
    const visibleMessages = filteredMessages.slice(
        (safeMessagePage - 1) * MESSAGE_PAGE_SIZE,
        safeMessagePage * MESSAGE_PAGE_SIZE
    );

    const newsTotalPages = Math.max(1, Math.ceil(filteredNewsPosts.length / NEWS_PAGE_SIZE));
    const safeNewsPage = Math.min(newsPage, newsTotalPages);
    const visibleNewsPosts = filteredNewsPosts.slice(
        (safeNewsPage - 1) * NEWS_PAGE_SIZE,
        safeNewsPage * NEWS_PAGE_SIZE
    );

    const todayCount = messages.filter((msg) => isSameDay(msg.created_at)).length;
    const latestActivity = messages[0] ? formatDateParts(messages[0].created_at) : null;
    const publishedCount = newsPosts.filter((post) => post.status === 'published').length;
    const draftCount = newsPosts.filter((post) => post.status === 'draft').length;
    const pinnedCount = newsPosts.filter((post) => post.pinned).length;
    const featuredCount = newsPosts.filter((post) => post.featured).length;

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('确定要删除这条留言吗？')) return;

        const token = requireToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/admin/messages?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setDetailMessage(null);
                fetchMessages();
            }
        } catch {
            setNotice({ type: 'error', text: '服务器错误，请稍后再试' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    const updateNewsForm = (field, value) => {
        setNewsForm((current) => {
            const next = { ...current, [field]: value };
            if (field === 'status' && value !== 'published') {
                next.pinned = false;
                next.featured = false;
            }
            return next;
        });
    };

    const openCreateNews = () => {
        setNewsEditingId(null);
        setNewsForm(EMPTY_NEWS_FORM);
        setNewsDrawerMode('create');
        setNotice(null);
    };

    const openEditNews = async (post) => {
        setNewsEditingId(post.id);
        setNewsForm(normalizeNewsForm(post));
        setNewsDrawerMode('edit');
        setNotice(null);

        const token = requireToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/admin/news?id=${post.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();
            if (data.success) {
                setNewsForm(normalizeNewsForm(data.data));
            } else {
                setNotice({ type: 'error', text: data.message || '新闻详情加载失败' });
            }
        } catch (err) {
            console.error(err);
            setNotice({ type: 'error', text: '新闻详情加载失败，请稍后重试' });
        }
    };

    const closeNewsDrawer = () => {
        setNewsDrawerMode(null);
        setNewsEditingId(null);
        setNewsForm(EMPTY_NEWS_FORM);
        setCoverUploading(false);
    };

    const uploadNewsImage = useCallback(async (file, scope = 'cover') => {
        const token = requireToken();
        if (!token) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('scope', scope);

        const response = await fetch('/api/admin/news/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (response.status === 401) {
            handleUnauthorized();
            return null;
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || '图片上传失败');
        }

        return data.data;
    }, [handleUnauthorized, requireToken]);

    const handleCoverUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setCoverUploading(true);
        setNotice(null);

        try {
            const image = await uploadNewsImage(file, 'cover');
            if (!image) return;
            setNewsForm((current) => ({
                ...current,
                cover_image_key: image.key,
                cover_image_url: image.url,
            }));
            setNotice({ type: 'success', text: '封面已上传' });
        } catch (err) {
            console.error(err);
            setNotice({ type: 'error', text: err.message || '封面上传失败，请稍后重试' });
        } finally {
            setCoverUploading(false);
        }
    };

    const handleContentImageUpload = useCallback(async (file) => {
        setNotice(null);
        try {
            const image = await uploadNewsImage(file, 'content');
            if (image) {
                setNotice({ type: 'success', text: '正文图片已插入' });
            }
            return image;
        } catch (err) {
            console.error(err);
            setNotice({ type: 'error', text: err.message || '正文图片上传失败，请稍后重试' });
            return null;
        }
    }, [uploadNewsImage]);

    const buildNewsPayload = () => ({
        ...newsForm,
        title_zh: newsForm.title_zh.trim(),
        content_zh: normalizeRichTextForSave(newsForm.content_zh),
        title_en: newsForm.title_en.trim(),
        summary_zh: newsForm.summary_zh.trim(),
        summary_en: newsForm.summary_en.trim(),
        content_en: normalizeRichTextForSave(newsForm.content_en),
        slug: newsForm.slug.trim(),
        cover_image_key: newsForm.cover_image_key || null,
        cover_image_url: newsForm.cover_image_url || null,
        cover_image_alt_zh: newsForm.cover_image_alt_zh.trim(),
        cover_image_alt_en: newsForm.cover_image_alt_en.trim(),
        seo_title_zh: newsForm.seo_title_zh.trim(),
        seo_title_en: newsForm.seo_title_en.trim(),
        seo_description_zh: newsForm.seo_description_zh.trim(),
        seo_description_en: newsForm.seo_description_en.trim(),
        pinned: newsForm.status === 'published' && Boolean(newsForm.pinned),
        featured: newsForm.status === 'published' && Boolean(newsForm.featured),
        published_at: toIsoOrNull(newsForm.published_at),
    });

    const handleSaveNews = async () => {
        if (!newsForm.title_zh.trim()) {
            setNotice({ type: 'error', text: '请填写中文标题' });
            return;
        }

        if (!normalizeRichTextForSave(newsForm.content_zh)) {
            setNotice({ type: 'error', text: '请填写中文正文' });
            return;
        }

        const token = requireToken();
        if (!token) return;

        const isEdit = newsDrawerMode === 'edit';
        const endpoint = isEdit ? `/api/admin/news?id=${newsEditingId}` : '/api/admin/news';
        const method = isEdit ? 'PUT' : 'POST';

        setNewsSaving(true);
        setNotice(null);

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildNewsPayload()),
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();
            if (!data.success) {
                setNotice({ type: 'error', text: data.message || '新闻保存失败' });
                return;
            }

            setNotice({ type: 'success', text: isEdit ? '新闻已更新' : '新闻已创建' });
            closeNewsDrawer();
            fetchNews();
        } catch (err) {
            console.error(err);
            setNotice({ type: 'error', text: '新闻保存失败，请稍后重试' });
        } finally {
            setNewsSaving(false);
        }
    };

    const handleDeleteNews = async (post) => {
        if (!window.confirm(`确定要永久删除「${post.title_zh}」吗？对应封面图也会同步删除。`)) return;

        const token = requireToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/admin/news?id=${post.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();
            if (!data.success) {
                setNotice({ type: 'error', text: data.message || '删除失败' });
                return;
            }

            setNotice({ type: 'success', text: '新闻已永久删除' });
            fetchNews();
        } catch (err) {
            console.error(err);
            setNotice({ type: 'error', text: '删除失败，请稍后重试' });
        }
    };

    const renderMessageWorkspace = () => (
        <main className="admin-content">
            <section className="admin-stats-grid" aria-label="留言统计">
                <article className="admin-stat-card">
                    <span className="stat-icon blue">
                        <Icon name="message" />
                    </span>
                    <span className="stat-label">全部留言</span>
                    <strong>{messages.length}</strong>
                </article>
                <article className="admin-stat-card">
                    <span className="stat-icon green">
                        <Icon name="document" />
                    </span>
                    <span className="stat-label">今日新增</span>
                    <strong>{todayCount}</strong>
                </article>
                <article className="admin-stat-card">
                    <span className="stat-icon slate">
                        <Icon name="clock" />
                    </span>
                    <span className="stat-label">最新留言</span>
                    <strong className="stat-date-value">{latestActivity ? latestActivity.date : '-'}</strong>
                </article>
            </section>

            <section className="admin-filter-card" aria-label="搜索留言">
                <div className="filter-copy">
                    <span>快速检索</span>
                </div>
                <label className="admin-search-field" htmlFor="admin-message-search">
                    <Icon name="search" />
                    <input
                        id="admin-message-search"
                        value={messageSearch}
                        onChange={(event) => setMessageSearch(event.target.value)}
                        placeholder="搜索客户姓名、邮箱、WhatsApp 或留言内容..."
                    />
                    {messageSearch && (
                        <button className="search-clear-btn" type="button" onClick={() => setMessageSearch('')}>
                            清除
                        </button>
                    )}
                </label>
            </section>

            <section className="admin-table-card">
                <header className="table-card-header">
                    <div>
                        <h2>客户留言</h2>
                    </div>
                    {messageSearch && <span className="search-result-pill">已筛选</span>}
                </header>

                <div className="table-scroll">
                    <table className="admin-message-table">
                        <colgroup>
                            <col className="col-date" />
                            <col className="col-name" />
                            <col className="col-email" />
                            <col className="col-whatsapp" />
                            <col className="col-country" />
                            <col className="col-message" />
                            <col className="col-actions" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>客户姓名</th>
                                <th>电子邮件</th>
                                <th>WhatsApp</th>
                                <th>国家/地区</th>
                                <th>留言内容</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleMessages.length > 0 ? visibleMessages.map((msg) => {
                                const time = formatDateParts(msg.created_at);
                                const meta = getCountryMeta(msg.country_code);
                                return (
                                    <tr key={msg.id}>
                                        <td>
                                            <span className="date-main">{time.date}</span>
                                            <span className="date-sub">{time.time}</span>
                                        </td>
                                        <td><span className="cell-ellipsis strong-cell">{msg.name || '-'}</span></td>
                                        <td><span className="cell-ellipsis muted-cell">{msg.email || '-'}</span></td>
                                        <td><span className="cell-ellipsis">{[msg.country_code, msg.whatsapp].filter(Boolean).join(' ') || '-'}</span></td>
                                        <td>
                                            <span className="country-pill">
                                                {meta.flagCode ? (
                                                    <img
                                                        src={flagUrl(meta.flagCode)}
                                                        alt=""
                                                        className="country-flag"
                                                        width="24"
                                                        height="18"
                                                    />
                                                ) : (
                                                    <span className="country-dot" />
                                                )}
                                                <span className="cell-ellipsis">{meta.name}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <span className="message-preview">{msg.message || '-'}</span>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="icon-action view" onClick={() => setDetailMessage(msg)} aria-label="查看客户详情" title="查看客户详情">
                                                    <Icon name="view" />
                                                </button>
                                                <button className="icon-action delete" onClick={() => handleDeleteMessage(msg.id)} aria-label="删除留言" title="删除留言">
                                                    <Icon name="trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td className="empty-cell" colSpan="7">
                                        没有匹配的留言，请尝试更短的关键词或清除搜索条件。
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <footer className="table-footer">
                    <span>共 {filteredMessages.length} 条记录</span>
                    <div className="pagination" aria-label="分页">
                        <button disabled={safeMessagePage <= 1} onClick={() => setMessagePage((page) => Math.max(1, page - 1))}>‹</button>
                        {Array.from({ length: messageTotalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                className={page === safeMessagePage ? 'active' : ''}
                                onClick={() => setMessagePage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button disabled={safeMessagePage >= messageTotalPages} onClick={() => setMessagePage((page) => Math.min(messageTotalPages, page + 1))}>›</button>
                        <span className="page-size">{MESSAGE_PAGE_SIZE} 条/页</span>
                    </div>
                </footer>
            </section>
        </main>
    );

    const renderNewsWorkspace = () => (
        <main className="admin-content news-content">
            <section className="admin-stats-grid news-stats" aria-label="新闻统计">
                <article className="admin-stat-card news-stat-card">
                    <span className="stat-icon blue">
                        <Icon name="news" />
                    </span>
                    <span className="stat-label">全部新闻</span>
                    <strong>{newsPosts.length}</strong>
                </article>
                <article className="admin-stat-card news-stat-card">
                    <span className="stat-icon green">
                        <Icon name="document" />
                    </span>
                    <span className="stat-label">已发布</span>
                    <strong>{publishedCount}</strong>
                </article>
                <article className="admin-stat-card news-stat-card">
                    <span className="stat-icon slate">
                        <Icon name="clock" />
                    </span>
                    <span className="stat-label">草稿</span>
                    <strong>{draftCount}</strong>
                </article>
                <article className="admin-stat-card news-stat-card">
                    <span className="stat-icon blue">
                        <Icon name="star" />
                    </span>
                    <span className="stat-label">置顶</span>
                    <strong>{pinnedCount}</strong>
                </article>
                <article className="admin-stat-card news-stat-card">
                    <span className="stat-icon gold">
                        <Icon name="star" />
                    </span>
                    <span className="stat-label">精选</span>
                    <strong>{featuredCount}</strong>
                </article>
            </section>

            <section className="news-toolbar-card" aria-label="新闻筛选">
                <div className="news-toolbar-title">
                    <h1>新闻中心</h1>
                </div>

                <label className="admin-search-field news-search-field" htmlFor="admin-news-search">
                    <Icon name="search" />
                    <input
                        id="admin-news-search"
                        value={newsSearch}
                        onChange={(event) => setNewsSearch(event.target.value)}
                        placeholder="搜索标题、摘要、slug、正文..."
                    />
                    {newsSearch && (
                        <button className="search-clear-btn" type="button" onClick={() => setNewsSearch('')}>
                            清除
                        </button>
                    )}
                </label>

                <div className="news-filter-group">
                    <label className="compact-select">
                        <Icon name="filter" />
                        <select value={newsCategoryFilter} onChange={(event) => setNewsCategoryFilter(event.target.value)}>
                            <option value="all">全部分类</option>
                            {NEWS_CATEGORIES.map((category) => (
                                <option key={category.value} value={category.value}>{category.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="compact-select">
                        <Icon name="document" />
                        <select value={newsStatusFilter} onChange={(event) => setNewsStatusFilter(event.target.value)}>
                            <option value="all">全部状态</option>
                            {NEWS_STATUS.map((status) => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </label>
                    <button className="admin-ghost-btn" type="button" onClick={fetchNews} disabled={newsLoading}>
                        <Icon name="refresh" />
                        <span>{newsLoading ? '刷新中' : '刷新'}</span>
                    </button>
                    <button className="admin-primary-btn" type="button" onClick={openCreateNews}>
                        <span>新建新闻</span>
                    </button>
                </div>
            </section>

            {notice && (
                <div className={`admin-notice ${notice.type}`} role="status">
                    {notice.text}
                </div>
            )}

            <section className="admin-table-card news-table-card">
                <header className="table-card-header news-table-header">
                    <div>
                        <h2>新闻列表</h2>
                    </div>
                    <span className="search-result-pill">显示 {filteredNewsPosts.length} 条</span>
                </header>

                <div className="table-scroll news-table-scroll">
                    <table className="admin-message-table admin-news-table">
                        <colgroup>
                            <col className="news-col-cover" />
                            <col className="news-col-title" />
                            <col className="news-col-category" />
                            <col className="news-col-status" />
                            <col className="news-col-date" />
                            <col className="news-col-seo" />
                            <col className="news-col-actions" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>封面</th>
                                <th>新闻标题</th>
                                <th>分类</th>
                                <th>状态</th>
                                <th>发布时间</th>
                                <th>SEO</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newsLoading && !newsPosts.length ? (
                                <tr>
                                    <td className="empty-cell" colSpan="7">正在加载新闻列表...</td>
                                </tr>
                            ) : visibleNewsPosts.length > 0 ? visibleNewsPosts.map((post) => (
                                <tr key={post.id}>
                                    <td>
                                        <div className="news-cover-thumb">
                                            {post.cover_image_url ? (
                                                <img src={post.cover_image_url} alt={post.cover_image_alt_zh || post.title_zh} />
                                            ) : (
                                                <Icon name="image" />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="news-title-cell">
                                            <div>
                                                <strong>{post.title_zh}</strong>
                                                {post.pinned && <span className="pin-dot">置顶</span>}
                                                {post.featured && <span className="feature-dot">精选</span>}
                                            </div>
                                            <span>{post.slug}</span>
                                            {post.summary_zh && <p>{post.summary_zh}</p>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-chip">{getCategoryLabel(post.category)}</span>
                                    </td>
                                    <td>
                                        <span className={`status-chip ${post.status}`}>{getStatusLabel(post.status)}</span>
                                    </td>
                                    <td>
                                        <span className="date-main">{post.published_at ? formatDateParts(post.published_at).date : '-'}</span>
                                        <span className="date-sub">{post.published_at ? formatDateParts(post.published_at).time : '未发布'}</span>
                                    </td>
                                    <td>
                                        <span className={`seo-chip ${post.seo_title_zh && post.seo_description_zh ? 'ready' : 'todo'}`}>
                                            {post.seo_title_zh && post.seo_description_zh ? '已填写' : '待完善'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="icon-action view" onClick={() => openEditNews(post)} aria-label="编辑新闻" title="编辑新闻">
                                                <Icon name="edit" />
                                            </button>
                                            <button className="icon-action delete" onClick={() => handleDeleteNews(post)} aria-label="删除新闻" title="删除新闻">
                                                <Icon name="trash" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td className="empty-cell news-empty-cell" colSpan="7">
                                        <div>
                                            <Icon name="news" />
                                            <strong>还没有新闻内容</strong>
                                            <span>先创建一篇新闻，之后前台新闻中心就可以读取这些数据。</span>
                                            <button className="admin-primary-btn" type="button" onClick={openCreateNews}>
                                                新建新闻
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <footer className="table-footer">
                    <span>共 {filteredNewsPosts.length} 篇新闻</span>
                    <div className="pagination" aria-label="新闻分页">
                        <button disabled={safeNewsPage <= 1} onClick={() => setNewsPage((page) => Math.max(1, page - 1))}>‹</button>
                        {Array.from({ length: newsTotalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                className={page === safeNewsPage ? 'active' : ''}
                                onClick={() => setNewsPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button disabled={safeNewsPage >= newsTotalPages} onClick={() => setNewsPage((page) => Math.min(newsTotalPages, page + 1))}>›</button>
                        <span className="page-size">{NEWS_PAGE_SIZE} 篇/页</span>
                    </div>
                </footer>
            </section>
        </main>
    );

    if (messageLoading) {
        return <div className="admin-loading light-theme">正在加载后台系统...</div>;
    }

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <img src="/logo.png" alt="Yutong Magnet" className="sidebar-logo-img" />
                    <div>
                        <strong>Yutong Magnet</strong>
                        <span>管理后台</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button className="sidebar-link" onClick={() => navigate('/')}>
                        <Icon name="home" />
                        <span>首页</span>
                    </button>
                    <button
                        className={`sidebar-link ${activeSection === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveSection('messages')}
                    >
                        <Icon name="message" />
                        <span>留言管理</span>
                    </button>
                    <button
                        className={`sidebar-link ${activeSection === 'news' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setActiveSection('news')}
                    >
                        <Icon name="news" />
                        <span>新闻中心</span>
                    </button>
                </nav>

                <button className="sidebar-logout" onClick={handleLogout}>
                    <Icon name="logout" />
                    <span>退出登录</span>
                </button>
            </aside>

            <div className="admin-workspace">
                {activeSection === 'news' ? renderNewsWorkspace() : renderMessageWorkspace()}
            </div>

            {detailMessage && (
                <div className="detail-overlay" onClick={() => setDetailMessage(null)}>
                    <article className="message-detail-popover" onClick={(event) => event.stopPropagation()}>
                        <header>
                            <div>
                                <h2>客户详情</h2>
                                <p>完整表单信息</p>
                            </div>
                            <button onClick={() => setDetailMessage(null)} aria-label="关闭详情">
                                <Icon name="close" />
                            </button>
                        </header>
                        <dl>
                            <div>
                                <dt>日期</dt>
                                <dd>{formatDateTime(detailMessage.created_at)}</dd>
                            </div>
                            <div>
                                <dt>客户姓名</dt>
                                <dd>{detailMessage.name || '-'}</dd>
                            </div>
                            <div>
                                <dt>电子邮件</dt>
                                <dd>{detailMessage.email || '-'}</dd>
                            </div>
                            <div>
                                <dt>WhatsApp</dt>
                                <dd>{[detailMessage.country_code, detailMessage.whatsapp].filter(Boolean).join(' ') || '-'}</dd>
                            </div>
                            <div>
                                <dt>国家/地区</dt>
                                <dd>{getCountryMeta(detailMessage.country_code).name}</dd>
                            </div>
                            <div className="detail-message">
                                <dt>留言内容</dt>
                                <dd>{detailMessage.message || '-'}</dd>
                            </div>
                        </dl>
                    </article>
                </div>
            )}

            {newsDrawerMode && (
                <div className="detail-overlay news-editor-overlay" onClick={closeNewsDrawer}>
                    <article className="news-editor-panel" onClick={(event) => event.stopPropagation()}>
                        <header className="news-editor-header">
                            <div>
                                <h2>{newsDrawerMode === 'edit' ? '编辑新闻' : '新建新闻'}</h2>
                            </div>
                            <button onClick={closeNewsDrawer} aria-label="关闭编辑器">
                                <Icon name="close" />
                            </button>
                        </header>

                        <div className="news-editor-body">
                            <section className="editor-section">
                                <h3>基础信息</h3>
                                <div className="editor-grid two">
                                    <label className="admin-field">
                                        <span>中文标题 *</span>
                                        <input value={newsForm.title_zh} onChange={(event) => updateNewsForm('title_zh', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>英文标题</span>
                                        <input value={newsForm.title_en} onChange={(event) => updateNewsForm('title_en', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>链接别名</span>
                                        <input value={newsForm.slug} onChange={(event) => updateNewsForm('slug', event.target.value)} placeholder="留空则自动生成英文链接" />
                                    </label>
                                    <label className="admin-field">
                                        <span>发布时间</span>
                                        <input type="datetime-local" value={newsForm.published_at} onChange={(event) => updateNewsForm('published_at', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>分类</span>
                                        <select value={newsForm.category} onChange={(event) => updateNewsForm('category', event.target.value)}>
                                            {NEWS_CATEGORIES.map((category) => (
                                                <option key={category.value} value={category.value}>{category.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="admin-field">
                                        <span>状态</span>
                                        <select value={newsForm.status} onChange={(event) => updateNewsForm('status', event.target.value)}>
                                            {NEWS_STATUS.map((status) => (
                                                <option key={status.value} value={status.value}>{status.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="admin-check-group">
                                    <label className="admin-check-field">
                                        <input
                                            type="checkbox"
                                            checked={newsForm.pinned}
                                            disabled={newsForm.status !== 'published'}
                                            onChange={(event) => updateNewsForm('pinned', event.target.checked)}
                                        />
                                        <span>置顶新闻中心最上方大图</span>
                                    </label>
                                    <label className="admin-check-field">
                                        <input
                                            type="checkbox"
                                            checked={newsForm.featured}
                                            disabled={newsForm.status !== 'published'}
                                            onChange={(event) => updateNewsForm('featured', event.target.checked)}
                                        />
                                        <span>加入精选新闻横向卡片</span>
                                    </label>
                                </div>
                                {newsForm.status !== 'published' && (
                                    <p className="editor-helper-text">草稿不会在前台展示，也不会进入置顶或精选。</p>
                                )}
                            </section>

                            <section className="editor-section">
                                <h3>封面图片</h3>
                                <div className="cover-uploader">
                                    <div className="cover-preview">
                                        {newsForm.cover_image_url ? (
                                            <img src={newsForm.cover_image_url} alt={newsForm.cover_image_alt_zh || newsForm.title_zh || '新闻封面'} />
                                        ) : (
                                            <div>
                                                <Icon name="image" />
                                                <span>推荐上传横版封面</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="cover-upload-actions">
                                        <label className="admin-ghost-btn file-trigger">
                                            <Icon name="upload" />
                                            <span>{coverUploading ? '上传中' : '上传封面'}</span>
                                            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={coverUploading} />
                                        </label>
                                        {newsForm.cover_image_url && (
                                            <button
                                                className="admin-soft-danger-btn"
                                                type="button"
                                                onClick={() => setNewsForm((current) => ({ ...current, cover_image_key: '', cover_image_url: '' }))}
                                            >
                                                移除封面
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="editor-grid two">
                                    <label className="admin-field">
                                        <span>中文图片说明</span>
                                        <input value={newsForm.cover_image_alt_zh} onChange={(event) => updateNewsForm('cover_image_alt_zh', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>英文图片说明</span>
                                        <input value={newsForm.cover_image_alt_en} onChange={(event) => updateNewsForm('cover_image_alt_en', event.target.value)} />
                                    </label>
                                </div>
                            </section>

                            <section className="editor-section">
                                <h3>摘要</h3>
                                <div className="editor-grid two">
                                    <label className="admin-field">
                                        <span>中文摘要</span>
                                        <textarea rows="3" value={newsForm.summary_zh} onChange={(event) => updateNewsForm('summary_zh', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>英文摘要</span>
                                        <textarea rows="3" value={newsForm.summary_en} onChange={(event) => updateNewsForm('summary_en', event.target.value)} />
                                    </label>
                                </div>
                            </section>

                            <section className="editor-section">
                                <h3>正文内容</h3>
                                <RichTextEditor
                                    label="中文正文 *"
                                    value={newsForm.content_zh}
                                    onChange={(value) => updateNewsForm('content_zh', value)}
                                    onUploadImage={handleContentImageUpload}
                                    placeholder="输入新闻正文，可以插入标题、列表、图片和表格..."
                                    disabled={newsSaving}
                                />
                                <RichTextEditor
                                    label="英文正文"
                                    value={newsForm.content_en}
                                    onChange={(value) => updateNewsForm('content_en', value)}
                                    onUploadImage={handleContentImageUpload}
                                    placeholder="Write the English article body..."
                                    disabled={newsSaving}
                                />
                            </section>

                            <section className="editor-section">
                                <h3>SEO 设置</h3>
                                <div className="editor-grid two">
                                    <label className="admin-field">
                                        <span>中文 SEO 标题</span>
                                        <input value={newsForm.seo_title_zh} onChange={(event) => updateNewsForm('seo_title_zh', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>英文 SEO 标题</span>
                                        <input value={newsForm.seo_title_en} onChange={(event) => updateNewsForm('seo_title_en', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>中文 SEO 描述</span>
                                        <textarea rows="3" value={newsForm.seo_description_zh} onChange={(event) => updateNewsForm('seo_description_zh', event.target.value)} />
                                    </label>
                                    <label className="admin-field">
                                        <span>英文 SEO 描述</span>
                                        <textarea rows="3" value={newsForm.seo_description_en} onChange={(event) => updateNewsForm('seo_description_en', event.target.value)} />
                                    </label>
                                </div>
                            </section>
                        </div>

                        <footer className="news-editor-footer">
                            <button className="admin-ghost-btn" type="button" onClick={closeNewsDrawer}>取消</button>
                            <button className="admin-primary-btn" type="button" onClick={handleSaveNews} disabled={newsSaving || coverUploading}>
                                <Icon name="save" />
                                <span>{newsSaving ? '保存中' : '保存新闻'}</span>
                            </button>
                        </footer>
                    </article>
                </div>
            )}
        </div>
    );
};

export default AdminPage;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PAGE_SIZE = 8;

const Icon = ({ name }) => {
    const icons = {
        home: <path d="m3 10 9-7 9 7v10h-6v-6H9v6H3V10Z" />,
        message: <path d="M5 6.5h14v9H9l-4 3v-12Z" />,
        document: <path d="M8 3.5h6l4 4V20H8V3.5Zm6 0v4h4M10.5 11h5M10.5 14h5M10.5 17h3" />,
        news: <path d="M4 5h16v14H4V5Zm3 4h5M7 12h5M7 15h3M15 9h2M15 12h2M15 15h2" />,
        search: <path d="m20 20-4.2-4.2M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z" />,
        view: <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
        trash: <path d="M5 7h14M10 11v5M14 11v5M8 7l1-3h6l1 3M7 7l1 13h8l1-13" />,
        close: <path d="M6 6l12 12M18 6 6 18" />,
        logout: <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />,
        chevron: <path d="m8 10 4 4 4-4" />,
    };

    return (
        <svg className="admin-icon" viewBox="0 0 24 24" aria-hidden="true">
            {icons[name]}
        </svg>
    );
};

const getCountryMeta = (code) => COUNTRY_META[code] || { name: '其他', flagCode: '' };

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

const isSameDay = (value, date = new Date()) => {
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) return false;

    return target.getFullYear() === date.getFullYear()
        && target.getMonth() === date.getMonth()
        && target.getDate() === date.getDate();
};

const flagUrl = (flagCode) => `https://flagcdn.com/24x18/${flagCode}.png`;

const AdminPage = () => {
    usePageTitle('Admin Dashboard');

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [detailMessage, setDetailMessage] = useState(null);
    const navigate = useNavigate();

    const fetchMessages = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const response = await fetch('/api/admin/messages', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                localStorage.removeItem('admin_token');
                navigate('/admin/login');
                return;
            }

            const data = await response.json();
            if (data.success) {
                setMessages(Array.isArray(data.data) ? data.data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const filteredMessages = useMemo(() => {
        const keyword = search.trim().toLowerCase();
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
    }, [messages, search]);

    const totalPages = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const visibleMessages = filteredMessages.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
    const todayCount = messages.filter((msg) => isSameDay(msg.created_at)).length;

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('确定要删除这条留言吗？')) return;

        const token = localStorage.getItem('admin_token');
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
            alert('服务器错误，请稍后再试。');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    if (loading) {
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
                    <button className="sidebar-link active">
                        <Icon name="message" />
                        <span>留言管理</span>
                    </button>
                    <button className="sidebar-link" type="button">
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
                <main className="admin-content">
                    <section className="admin-stats-grid" aria-label="留言统计">
                        <article className="admin-stat-card">
                            <div className="stat-copy">
                                <span className="stat-label">全部留言</span>
                            </div>
                            <strong>{messages.length}</strong>
                            <span className="stat-icon blue">
                                <Icon name="message" />
                            </span>
                        </article>
                        <article className="admin-stat-card">
                            <div className="stat-copy">
                                <span className="stat-label">今日新增</span>
                            </div>
                            <strong>{todayCount}</strong>
                            <span className="stat-icon green">
                                <Icon name="document" />
                            </span>
                        </article>
                    </section>

                    <section className="admin-filter-card" aria-label="搜索留言">
                        <label className="admin-search-field">
                            <Icon name="search" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="搜索客户姓名、邮箱、WhatsApp 或留言内容..."
                            />
                        </label>
                    </section>

                    <section className="admin-table-card">
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
                                        <td className="empty-cell" colSpan="7">暂无符合条件的留言</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <footer className="table-footer">
                            <span>共 {filteredMessages.length} 条记录</span>
                            <div className="pagination" aria-label="分页">
                                <button disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={page === safeCurrentPage ? 'active' : ''}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>›</button>
                                <span className="page-size">{PAGE_SIZE} 条/页</span>
                            </div>
                        </footer>
                    </section>
                </main>
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
                                <dd>{formatDateParts(detailMessage.created_at).date} {formatDateParts(detailMessage.created_at).time}</dd>
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
        </div>
    );
};

export default AdminPage;

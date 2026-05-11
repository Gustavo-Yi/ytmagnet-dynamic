import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import './Admin.css';

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

const PAGE_SIZE = 10;

const Icon = ({ name }) => {
    const icons = {
        message: <path d="M5 6.5h14v9H9l-4 3v-12Z" />,
        document: <path d="M8 3.5h6l4 4V20H8V3.5Zm6 0v4h4M10.5 11h5M10.5 14h5M10.5 17h3" />,
        view: <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
        copy: <path d="M8 8h10v12H8V8Zm-4 8V4h10" />,
        search: <path d="m20 20-4.2-4.2M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z" />,
        reset: <path d="M4 12a8 8 0 1 0 2.34-5.66M4 4v5h5" />,
        filter: <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />,
        trash: <path d="M5 7h14M10 11v5M14 11v5M8 7l1-3h6l1 3M7 7l1 13h8l1-13" />,
        chevron: <path d="m8 10 4 4 4-4" />,
        close: <path d="M6 6l12 12M18 6 6 18" />,
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
        }).replaceAll('/', '/'),
        time: date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }),
    };
};

const isSameDay = (value, date = new Date()) => {
    const target = new Date(value);
    return target.getFullYear() === date.getFullYear()
        && target.getMonth() === date.getMonth()
        && target.getDate() === date.getDate();
};

const AdminPage = () => {
    usePageTitle('Admin Dashboard');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [detailMessage, setDetailMessage] = useState(null);
    const [countryMenuOpen, setCountryMenuOpen] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const navigate = useNavigate();

    const fetchMessages = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch('/api/admin/messages', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) setMessages(data.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        await fetchMessages();
        setLoading(false);
    }, [fetchMessages, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        let isMounted = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMessages().finally(() => {
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [fetchMessages, navigate]);

    const filteredMessages = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return messages.filter((msg) => {
            const meta = getCountryMeta(msg.country_code);
            const created = new Date(msg.created_at);
            const haystack = [
                msg.name,
                msg.email,
                msg.whatsapp,
                msg.message,
                meta.name,
                msg.country_code,
            ].filter(Boolean).join(' ').toLowerCase();
            const matchesSearch = !keyword || haystack.includes(keyword);
            const matchesCountry = country === 'all' || msg.country_code === country;
            const matchesStart = !startDate || created >= new Date(`${startDate}T00:00:00`);
            const matchesEnd = !endDate || created <= new Date(`${endDate}T23:59:59`);
            return matchesSearch && matchesCountry && matchesStart && matchesEnd;
        });
    }, [country, endDate, messages, search, startDate]);

    const totalPages = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const visibleMessages = filteredMessages.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
    const todayCount = messages.filter((msg) => isSameDay(msg.created_at)).length;
    const countryOptions = useMemo(() => {
        const codes = Array.from(new Set(messages.map((msg) => msg.country_code).filter(Boolean)));
        return codes
            .map((code) => ({ code, ...getCountryMeta(code) }))
            .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    }, [messages]);
    const selectedCountryMeta = country === 'all' ? null : getCountryMeta(country);

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
                fetchData();
            }
        } catch {
            alert('服务器错误');
        }
    };

    const handleCopyWhatsApp = async (msg) => {
        const value = [msg.country_code, msg.whatsapp].filter(Boolean).join(' ').trim();
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        setCopiedMessageId(msg.id);
        window.setTimeout(() => {
            setCopiedMessageId((currentId) => (currentId === msg.id ? null : currentId));
        }, 1400);
    };

    const resetFilters = () => {
        setSearch('');
        setCountry('all');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
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
                        <Icon name="message" />
                        <span>首页</span>
                    </button>
                    <button className="sidebar-link active">
                        <Icon name="message" />
                        <span>留言管理</span>
                    </button>
                </nav>
            </aside>

            <div className="admin-workspace">
                <header className="admin-topbar">
                    <div className="admin-user-card" aria-label="当前管理员">
                        <span className="admin-avatar">易</span>
                        <span className="admin-user-text">
                            <strong>易亿</strong>
                            <span>管理员</span>
                        </span>
                        <Icon name="chevron" />
                    </div>
                </header>

                <main className="admin-content">
                    <section className="admin-page-heading">
                        <h1>留言管理</h1>
                        <p>查看和管理客户留言信息，及时跟进客户需求</p>
                    </section>

                    <section className="admin-stats-grid">
                        <article className="admin-stat-card">
                            <span className="stat-icon blue">
                                <Icon name="message" />
                            </span>
                            <div>
                                <span className="stat-label">全部留言</span>
                                <strong>{messages.length}</strong>
                                <small>本地预览数据</small>
                            </div>
                        </article>
                        <article className="admin-stat-card">
                            <span className="stat-icon purple">
                                <Icon name="document" />
                            </span>
                            <div>
                                <span className="stat-label">今日新增</span>
                                <strong>{todayCount}</strong>
                                <small>按提交日期统计</small>
                            </div>
                        </article>
                    </section>

                    <section className="admin-filter-card">
                        <label className="admin-search-field">
                            <input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="搜索客户姓名、邮箱或留言内容..."
                            />
                            <Icon name="search" />
                        </label>

                        <div
                            className="country-filter"
                            onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) {
                                    setCountryMenuOpen(false);
                                }
                            }}
                        >
                            <button
                                type="button"
                                className="country-filter-trigger"
                                aria-haspopup="listbox"
                                aria-expanded={countryMenuOpen}
                                onClick={() => setCountryMenuOpen((isOpen) => !isOpen)}
                            >
                                {selectedCountryMeta?.flagCode && (
                                    <img
                                        src={`https://flagcdn.com/24x18/${selectedCountryMeta.flagCode}.png`}
                                        alt=""
                                        className="country-flag"
                                        width="24"
                                        height="18"
                                    />
                                )}
                                <span>{selectedCountryMeta ? selectedCountryMeta.name : '全部国家/地区'}</span>
                                <Icon name="chevron" />
                            </button>

                            {countryMenuOpen && (
                                <div className="country-filter-menu" role="listbox">
                                    <button
                                        type="button"
                                        className={`country-filter-option ${country === 'all' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCountry('all');
                                            setCurrentPage(1);
                                            setCountryMenuOpen(false);
                                        }}
                                    >
                                        <span className="country-option-icon">全部</span>
                                        <span>全部国家/地区</span>
                                    </button>
                                    {countryOptions.map((option) => (
                                        <button
                                            key={option.code}
                                            type="button"
                                            className={`country-filter-option ${country === option.code ? 'active' : ''}`}
                                            onClick={() => {
                                                setCountry(option.code);
                                                setCurrentPage(1);
                                                setCountryMenuOpen(false);
                                            }}
                                        >
                                            {option.flagCode ? (
                                                <img
                                                    src={`https://flagcdn.com/24x18/${option.flagCode}.png`}
                                                    alt=""
                                                    className="country-flag"
                                                    width="24"
                                                    height="18"
                                                />
                                            ) : (
                                                <span className="country-fallback">🌐</span>
                                            )}
                                            <span>{option.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="admin-date-range">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) => {
                                    setStartDate(event.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <span>~</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(event) => {
                                    setEndDate(event.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <button className="admin-filter-btn muted" onClick={resetFilters}>
                            <Icon name="reset" />
                            <span>重置</span>
                        </button>
                        <button className="admin-filter-btn primary">
                            <Icon name="filter" />
                            <span>筛选</span>
                        </button>
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
                                {visibleMessages.map((msg) => {
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
                                            <td><span className="cell-ellipsis">{msg.country_code} {msg.whatsapp}</span></td>
                                            <td>
                                                <span className="country-cell">
                                                    {meta.flagCode ? (
                                                        <img
                                                            src={`https://flagcdn.com/24x18/${meta.flagCode}.png`}
                                                            alt=""
                                                            className="country-flag"
                                                            width="24"
                                                            height="18"
                                                        />
                                                    ) : (
                                                        <span className="country-fallback">🌐</span>
                                                    )}
                                                    <span className="cell-ellipsis">{meta.name}</span>
                                                </span>
                                            </td>
                                            <td>
                                                <div className="message-cell">
                                                    <span>{msg.message || '-'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button className="icon-action view" onClick={() => setDetailMessage(msg)} aria-label="查看客户详情" title="查看客户详情">
                                                        <Icon name="view" />
                                                    </button>
                                                    <button className="icon-action copy" onClick={() => handleCopyWhatsApp(msg)} aria-label="复制 WhatsApp" title={copiedMessageId === msg.id ? '已复制' : '复制 WhatsApp'}>
                                                        <Icon name="copy" />
                                                    </button>
                                                    <button className="icon-action delete" onClick={() => handleDeleteMessage(msg.id)} aria-label="删除留言" title="删除留言">
                                                        <Icon name="trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <footer className="table-footer">
                            <span>共 {filteredMessages.length} 条记录</span>
                            <div className="pagination">
                                <button disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => page - 1)}>‹</button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={page === safeCurrentPage ? 'active' : ''}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((page) => page + 1)}>›</button>
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
                                <h2>客户详细信息</h2>
                                <p>完整内容在这里查看，表格行高和列宽保持不变</p>
                            </div>
                            <button onClick={() => setDetailMessage(null)} aria-label="关闭详情">
                                <Icon name="close" />
                            </button>
                        </header>
                        <dl>
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
                                <dd>{detailMessage.country_code} {detailMessage.whatsapp}</dd>
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

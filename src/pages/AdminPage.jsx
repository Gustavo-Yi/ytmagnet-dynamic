import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNewsEditor from './AdminNewsEditor';
import './Admin.css';

const AdminPage = () => {
    const [messages, setMessages] = useState([]);
    const [newsList, setNewsList] = useState([]);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'news'
    const [isEditingNews, setIsEditingNews] = useState(false);
    const [currentNewsId, setCurrentNewsId] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLightTheme, setIsLightTheme] = useState(() => {
        return localStorage.getItem('admin_theme') === 'light';
    });
    const navigate = useNavigate();

    const toggleTheme = () => {
        const newTheme = !isLightTheme;
        setIsLightTheme(newTheme);
        localStorage.setItem('admin_theme', newTheme ? 'light' : 'dark');
    };

    const fetchMessages = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch('/api/admin/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setMessages(data.data);
        } catch (err) { console.error(err); }
    };

    const fetchNews = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch('/api/admin/news', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setNewsList(data.data);
        } catch (err) { console.error(err); }
    };

    const fetchData = async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) { navigate('/admin/login'); return; }
        
        setLoading(true);
        await Promise.all([fetchMessages(), fetchNews()]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('确定要删除这条留言吗？')) return;
        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch(`/api/admin/messages?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) fetchData();
        } catch (err) { alert('服务器错误'); }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm('确定要彻底删除这篇文章吗？')) return;
        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch(`/api/admin/news?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) fetchData();
        } catch (err) { alert('服务器错误'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    if (loading) return <div className={`admin-loading ${isLightTheme ? 'light-theme' : ''}`}>正在加载后台系统...</div>;

    return (
        <div className={`admin-dashboard ${isLightTheme ? 'light-theme' : ''}`}>
            <header className="admin-header">
                <div className="admin-logo">YT MAGNET 管理后台</div>
                <div className="admin-actions">
                    <button onClick={toggleTheme} className="admin-btn">
                        {isLightTheme ? '🌙 深色模式' : '☀️ 浅色模式'}
                    </button>
                    <div className="user-profile">
                        <span className="welcome-text">欢迎您，<strong>易亿</strong></span>
                        <button onClick={handleLogout} className="admin-btn logout">退出登录</button>
                    </div>
                </div>
            </header>

            <main className="admin-main">
                <nav className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('messages'); setIsEditingNews(false); }}
                    >
                        📩 留言管理
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('news'); setIsEditingNews(false); }}
                    >
                        📰 新闻发布
                    </button>
                </nav>

                {activeTab === 'messages' && (
                    <section className="admin-section">
                        <div className="section-header">
                            <h2>留言列表</h2>
                            <span className="count">总计: {messages.length}</span>
                        </div>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>日期</th>
                                        <th>客户姓名</th>
                                        <th>WhatsApp</th>
                                        <th>留言内容</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map(msg => (
                                        <tr key={msg.id}>
                                            <td className="time-td">{new Date(msg.created_at).toLocaleDateString()}</td>
                                            <td>{msg.name}</td>
                                            <td>{msg.country_code} {msg.whatsapp}</td>
                                            <td className="message-td">{msg.message}</td>
                                            <td>
                                                <button onClick={() => handleDeleteMessage(msg.id)} className="delete-btn">删除</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'news' && !isEditingNews && (
                    <section className="admin-section">
                        <div className="section-header">
                            <h2>新闻中心管理</h2>
                            <button className="add-news-btn" onClick={() => { setIsEditingNews(true); setCurrentNewsId(null); }}>
                                + 发布新文章
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>封面</th>
                                        <th>文章标题</th>
                                        <th>分类</th>
                                        <th>发布时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {newsList.map(news => (
                                        <tr key={news.id}>
                                            <td>
                                                <img src={news.cover_image} alt="" style={{ width: '60px', borderRadius: '4px' }} />
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{news.title}</td>
                                            <td>{news.category}</td>
                                            <td className="time-td">{new Date(news.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button onClick={() => handleDeleteNews(news.id)} className="delete-btn">删除</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {isEditingNews && (
                    <AdminNewsEditor 
                        newsId={currentNewsId} 
                        onSave={() => { fetchData(); setIsEditingNews(false); }}
                        onCancel={() => setIsEditingNews(false)}
                    />
                )}
            </main>
        </div>
    );
};

export default AdminPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLightTheme, setIsLightTheme] = useState(false);
    const navigate = useNavigate();

    const fetchMessages = async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const response = await fetch('/api/admin/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('admin_token');
                navigate('/admin/login');
                return;
            }

            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('获取留言失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('确定要删除这条留言吗？')) return;

        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch(`/api/admin/messages?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(messages.filter(msg => msg.id !== id));
            } else {
                alert('删除失败: ' + data.message);
            }
        } catch (err) {
            alert('服务器错误');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    if (loading) return <div className={`admin-loading ${isLightTheme ? 'light-theme' : ''}`}>正在加载数据...</div>;

    return (
        <div className={`admin-dashboard ${isLightTheme ? 'light-theme' : ''}`}>
            <header className="admin-header">
                <div className="admin-logo">YT MAGNET 管理后台</div>
                <div className="admin-user-info">
                    <button 
                        onClick={() => setIsLightTheme(!isLightTheme)} 
                        className="theme-toggle-btn"
                        title={isLightTheme ? "切换到深色模式" : "切换到浅色模式"}
                    >
                        {isLightTheme ? '🌙' : '☀️'} {isLightTheme ? '深色模式' : '浅色模式'}
                    </button>
                    <span>欢迎您，易亿</span>
                    <button onClick={handleLogout} className="logout-btn">退出登录</button>
                </div>
            </header>

            <main className="admin-main">
                <section className="admin-section">
                    <div className="section-header">
                        <h2>留言管理</h2>
                        <span className="count">总计: {messages.length}</span>
                    </div>

                    {error && <div className="error-notice">{error}</div>}

                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>时间</th>
                                    <th>姓名</th>
                                    <th>WhatsApp</th>
                                    <th>留言内容</th>
                                    <th>IP 地址</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map(msg => (
                                    <tr key={msg.id}>
                                        <td className="time-td">{new Date(msg.created_at).toLocaleString()}</td>
                                        <td>{msg.name || '-'}</td>
                                        <td>{msg.country_code} {msg.whatsapp}</td>
                                        <td className="message-td">{msg.message}</td>
                                        <td className="ip-td">{msg.ip}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(msg.id)} 
                                                className="delete-btn"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {messages.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="no-data">暂无留言数据</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminPage;

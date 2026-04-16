import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('admin_token', data.token);
                navigate('/admin');
            } else {
                setError(data.message || '登录失败');
            }
        } catch (err) {
            setError('服务器连接错误');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <h2>后台管理登录</h2>
                <p className="subtitle">YT MAGNET 磁体管理系统</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>用户名</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="输入您的名字"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="输入密码"
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? '正在登录...' : '立即登录'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

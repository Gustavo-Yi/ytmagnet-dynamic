import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import './Admin.css';

const LOGIN_BACKGROUND_VIDEO = 'https://mag.yutongglobal.com/%E7%A3%81%E9%93%81%E7%99%BB%E5%BD%95%E5%90%8E%E5%8F%B0%E8%83%8C%E6%99%AF.mp4';
const LOGIN_LOOP_MS = 5000;
const LOGIN_CROSSFADE_MS = 700;

function LoginBackgroundVideo() {
    const firstVideoRef = useRef(null);
    const secondVideoRef = useRef(null);
    const [activeVideo, setActiveVideo] = useState(0);

    useEffect(() => {
        const videos = [firstVideoRef.current, secondVideoRef.current];
        const timers = [];
        let current = 0;
        let disposed = false;

        const playFromStart = async (video) => {
            if (!video) return;
            try {
                video.currentTime = 0;
                await video.play();
            } catch {
                // Autoplay can be briefly delayed by the browser; muted playback will retry on next cycle.
            }
        };

        const scheduleNext = () => {
            const timer = window.setTimeout(async () => {
                if (disposed) return;
                const previous = current;
                const next = previous === 0 ? 1 : 0;
                await playFromStart(videos[next]);
                setActiveVideo(next);

                const pauseTimer = window.setTimeout(() => {
                    if (disposed) return;
                    videos[previous]?.pause();
                }, LOGIN_CROSSFADE_MS + 120);
                timers.push(pauseTimer);

                current = next;
                scheduleNext();
            }, LOGIN_LOOP_MS - LOGIN_CROSSFADE_MS);
            timers.push(timer);
        };

        playFromStart(videos[0]);
        scheduleNext();

        return () => {
            disposed = true;
            timers.forEach((timer) => window.clearTimeout(timer));
            videos.forEach((video) => video?.pause());
        };
    }, []);

    return (
        <div className="login-bg-video-stack" aria-hidden="true">
            {[0, 1].map((index) => (
                <video
                    key={index}
                    ref={index === 0 ? firstVideoRef : secondVideoRef}
                    className={`login-bg-video ${activeVideo === index ? 'is-active' : ''}`}
                    muted
                    loop
                    playsInline
                    preload="auto"
                >
                    <source src={LOGIN_BACKGROUND_VIDEO} type="video/mp4" />
                </video>
            ))}
        </div>
    );
}

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    usePageTitle('Admin Login');

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

            if (!response.ok) {
                const text = await response.text();
                let msg = '服务器连接错误';
                try {
                    const data = JSON.parse(text);
                    msg = data.message || msg;
                } catch {
                    if (response.status === 404) msg = 'API 接口未找到';
                    else if (response.status === 500) msg = '服务器内部错误';
                }
                setError(msg);
                return;
            }

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('admin_token', data.token);
                navigate('/admin');
            } else {
                setError(data.message || '登录失败');
            }
        } catch {
            setError('网络请求失败，请检查本地服务器状态');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <LoginBackgroundVideo />
            <div className="login-video-overlay" />

            <main className="login-card" aria-label="后台管理登录">
                <div className="login-brand">
                    <img src="/logo.png" alt="Yutong Magnet" className="login-logo" />
                    <span>Yutong Magnet</span>
                </div>

                <h1>欢迎你</h1>

                <form className="login-form" onSubmit={handleLogin}>
                    <label className="login-input-shell">
                        <span className="login-field-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 12c2.76 0 5-2.46 5-5.5S14.76 1 12 1 7 3.46 7 6.5 9.24 12 12 12Zm0 2c-4.42 0-8 2.41-8 5.38V21h16v-1.62C20 16.41 16.42 14 12 14Z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="请输入账户"
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="login-input-shell">
                        <span className="login-field-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="M17 9V7A5 5 0 0 0 7 7v2H5v13h14V9h-2Zm-8 0V7a3 3 0 0 1 6 0v2H9Zm4 7.73V19h-2v-2.27A2 2 0 1 1 13 16.73Z" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            aria-label={showPassword ? '隐藏密码' : '显示密码'}
                            onClick={() => setShowPassword((visible) => !visible)}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 5c5.52 0 9.47 4.43 10.75 6-.92 1.14-4.96 6-10.75 6S2.17 12.14 1.25 11C2.53 9.43 6.48 5 12 5Zm0 2C8.48 7 5.73 9.06 3.94 11 5.73 12.94 8.48 15 12 15s6.27-2.06 8.06-4C18.27 9.06 15.52 7 12 7Zm0 1.5A2.5 2.5 0 1 1 12 13a2.5 2.5 0 0 1 0-5Z" />
                            </svg>
                        </button>
                    </label>

                    {error && <div className="error-message">{error}</div>}

                    <button className="login-submit" type="submit" disabled={loading}>
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default LoginPage;

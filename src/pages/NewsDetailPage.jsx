import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import './News.css';

function NewsDetailPage() {
    const { slug } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(`/api/news?slug=${slug}`);
                const result = await response.json();
                if (result.success) {
                    setNews(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError('获取详情失败');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        // Scroll to top on load
        window.scrollTo(0, 0);
    }, [slug]);

    // Use news title as page title for SEO
    usePageTitle(news ? news.title : '新闻详情');

    // Update Meta Description for SEO
    useEffect(() => {
        if (news && news.meta_description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', news.meta_description);
            } else {
                const meta = document.createElement('meta');
                meta.name = "description";
                meta.content = news.meta_description;
                document.head.appendChild(meta);
            }
        }
    }, [news]);

    if (loading) return <div className="loading-state">载入中...</div>;
    if (error || !news) return <div className="error-state">{error || '文章不存在'}</div>;

    return (
        <article className="news-detail">
            <div className="news-detail-container">
                <header className="news-detail-header">
                    <Link to="/news" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        返回新闻中心
                    </Link>
                    <span className="news-detail-category">{news.category}</span>
                    <h1>{news.title}</h1>
                    <div className="news-detail-meta">
                        <span>作者：{news.author}</span> • <span>发布于 {new Date(news.created_at).toLocaleDateString()}</span>
                    </div>
                </header>

                {news.cover_image && (
                    <img src={news.cover_image} alt={news.title} className="news-detail-cover" />
                )}

                <div className="news-rich-content" dangerouslySetInnerHTML={{ __html: news.content }} />
                
                <footer className="news-detail-footer">
                    <div className="share-hint">觉得有帮助？分享给您的合作伙伴</div>
                </footer>
            </div>
        </article>
    );
}

export default NewsDetailPage;

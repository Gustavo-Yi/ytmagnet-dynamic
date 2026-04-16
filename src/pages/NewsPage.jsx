import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './SubPage.css';
import './News.css';

function NewsPage() {
  const { t } = useLanguage();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  usePageTitle(t('pages.news.title'));

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const result = await response.json();
        if (result.success) {
          setNewsList(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="subpage">
      <div className="subpage-hero">
        <h1 className="subpage-hero-title">{t('pages.news.title')}</h1>
        <p className="subpage-hero-sub">{t('pages.news.sub')}</p>
      </div>
      
      <div className="news-container">
        {loading ? (
          <div className="loading-state">载入中...</div>
        ) : (
          <div className="news-grid">
            {newsList.map((news) => (
              <Link to={`/news/${news.slug}`} key={news.id} className="news-card">
                <div className="news-card-image">
                  <img src={news.cover_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80'} alt={news.title} />
                  <span className="news-category-tag">{news.category}</span>
                </div>
                <div className="news-card-content">
                  <span className="news-date">{new Date(news.published_at).toLocaleDateString()}</span>
                  <h3>{news.title}</h3>
                  <p className="news-excerpt">{news.excerpt}</p>
                  <div className="news-read-more">
                    阅读更多 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
            {newsList.length === 0 && <div className="no-news">暂无新闻动态</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsPage;

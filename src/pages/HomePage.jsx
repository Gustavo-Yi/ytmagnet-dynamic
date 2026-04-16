import React, { useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import '../App.css';

function HomePage() {
  usePageTitle('');
  const { t } = useLanguage();

  // Lock scroll on homepage (full-screen experience), restore when leaving
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="home-page">
      {/* Video Background — homepage only */}
      <div className="video-background">
        <video autoPlay muted loop playsInline className="bg-video">
          <source
            src="https://mag.yutongglobal.com/%E7%BD%91%E7%AB%99%E8%83%8C%E6%99%AF%E6%9C%80%E7%BB%88%E7%89%88.mp4"
            type="video/mp4"
          />
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Scroll hint */}
      <div className="scroll-hint">
        <div className="scroll-hint-icon">
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
            <rect x="1" y="1" width="18" height="28" rx="9" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
            <circle cx="10" cy="9" r="3" fill="rgba(255,255,255,0.7)"/>
          </svg>
        </div>
        <span>{t('home.news.scrollHint')}</span>
      </div>
    </div>
  );
}

export default HomePage;

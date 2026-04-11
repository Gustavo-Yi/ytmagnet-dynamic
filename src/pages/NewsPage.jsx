import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './SubPage.css';

function NewsPage() {
  const { t } = useLanguage();
  usePageTitle(t('pages.news.title'));
  return (
    <div className="subpage">
      <div className="subpage-hero">
        <h1 className="subpage-hero-title">{t('pages.news.title')}</h1>
        <p className="subpage-hero-sub">{t('pages.news.sub')}</p>
      </div>
      <div className="subpage-content"><p>{t('pages.news.wip')}</p></div>
    </div>
  );
}
export default NewsPage;

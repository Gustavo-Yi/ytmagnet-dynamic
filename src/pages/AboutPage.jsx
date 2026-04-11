import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './SubPage.css';

function AboutPage() {
  const { t } = useLanguage();
  usePageTitle(t('pages.about.title'));
  return (
    <div className="subpage">
      <div className="subpage-hero">
        <h1 className="subpage-hero-title">{t('pages.about.title')}</h1>
        <p className="subpage-hero-sub">{t('pages.about.sub')}</p>
      </div>
      <div className="subpage-content"><p>{t('pages.about.wip')}</p></div>
    </div>
  );
}
export default AboutPage;

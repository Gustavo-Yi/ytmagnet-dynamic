import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './SubPage.css';

function JoinPage() {
  const { t } = useLanguage();
  usePageTitle(t('pages.join.title'));
  return (
    <div className="subpage">
      <div className="subpage-hero">
        <h1 className="subpage-hero-title">{t('pages.join.title')}</h1>
        <p className="subpage-hero-sub">{t('pages.join.sub')}</p>
      </div>
      <div className="subpage-content"><p>{t('pages.join.wip')}</p></div>
    </div>
  );
}
export default JoinPage;

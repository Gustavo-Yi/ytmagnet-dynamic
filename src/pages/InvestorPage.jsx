import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './SubPage.css';

function InvestorPage() {
  const { t } = useLanguage();
  usePageTitle(t('pages.investor.title'));
  return (
    <div className="subpage">
      <div className="subpage-hero">
        <h1 className="subpage-hero-title">{t('pages.investor.title')}</h1>
        <p className="subpage-hero-sub">{t('pages.investor.sub')}</p>
      </div>
      <div className="subpage-content"><p>{t('pages.investor.wip')}</p></div>
    </div>
  );
}
export default InvestorPage;

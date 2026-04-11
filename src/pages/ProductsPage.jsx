import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './SubPage.css';

function ProductsPage() {
  const { t } = useLanguage();
  usePageTitle(t('pages.products.title'));
  return (
    <div className="subpage">
      <div className="subpage-hero">
        <h1 className="subpage-hero-title">{t('pages.products.title')}</h1>
        <p className="subpage-hero-sub">{t('pages.products.sub')}</p>
      </div>
      <div className="subpage-content"><p>{t('pages.products.wip')}</p></div>
    </div>
  );
}
export default ProductsPage;

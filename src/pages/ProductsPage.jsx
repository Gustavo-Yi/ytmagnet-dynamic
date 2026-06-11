import React, { useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import ShoeGrid from '../components/productCenter/grid/ShoeGrid';
import './ProductsPage.css';

function ProductsPage() {
  const { t } = useLanguage();
  usePageTitle(t('pages.products.title'));

  useEffect(() => {
    document.body.classList.add('product-center-active');
    return () => document.body.classList.remove('product-center-active');
  }, []);

  return (
    <div className="products-center-page">
      <ShoeGrid />
    </div>
  );
}
export default ProductsPage;

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import ShoeGrid from '../components/productCenter/grid/ShoeGrid';
import './ProductsPage.css';

function ProductsPage() {
  const { t } = useLanguage();
  const { category } = useParams();
  usePageTitle(t('pages.products.title'));

  useEffect(() => {
    document.body.classList.add('product-center-active');
    return () => document.body.classList.remove('product-center-active');
  }, []);

  return (
    <div className="products-center-page">
      <ShoeGrid initialCategory={category} />
    </div>
  );
}
export default ProductsPage;

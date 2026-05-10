import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

const FLAGS = {
  zh: { src: 'https://flagcdn.com/20x15/cn.png', label: '中文' },
  en: { src: 'https://flagcdn.com/20x15/us.png', label: 'English' },
};

const Header = () => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const switchLang = (newLang) => {
    setLang(newLang);
    setShowLangMenu(false);
  };

  const currentFlag = FLAGS[lang];
  const brandText = lang === 'zh' ? '宁波钰彤新材料科技有限公司' : 'Yutong Magnet';

  return (
    <header className={`main-header ${!isHome ? 'header-subpage' : ''}`}>
      {/* Logo */}
      <div className="header-logo">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="YT Magnet Logo" className="logo-img" />
          <span className={`logo-text ${lang === 'zh' ? 'logo-text-zh' : ''}`}>{brandText}</span>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="main-nav">
        <ul>
          <li className="nav-item-box">
            <Link to="/">{t('nav.home')}</Link>
          </li>
          <li className="nav-item-box">
            <Link to="/about">{t('nav.about')}</Link>
          </li>
          <li className="nav-item-box has-dropdown">
            <Link to="/products">{t('nav.products')}</Link>
            <ul className="dropdown">
              <li><Link to="/products/ferrite">{t('nav.products_sub.ferrite')}</Link></li>
              <li><Link to="/products/ndfeb">{t('nav.products_sub.ndfeb')}</Link></li>
            </ul>
          </li>
          <li className="nav-item-box">
            <Link to="/news">{t('nav.news')}</Link>
          </li>
          <li className="nav-item-box">
            <Link to="/contact">{t('nav.contact')}</Link>
          </li>
        </ul>
      </nav>

      {/* Language selector */}
      <div className="lang-selector-container">
        <div
          className="lang-trigger-box"
          onClick={() => setShowLangMenu(!showLangMenu)}
        >
          <img src={currentFlag.src} alt={lang} className="flag-img" width="20" height="15" />
          <span className="lang-text">{currentFlag.label}</span>
          <span className={`arrow-small ${showLangMenu ? 'up' : ''}`}>∨</span>
        </div>

        {showLangMenu && (
          <div className="lang-dropdown-box">
            {Object.entries(FLAGS).map(([code, flag]) => (
              <div
                key={code}
                className={`lang-option ${lang === code ? 'active' : ''}`}
                onClick={() => switchLang(code)}
              >
                <img src={flag.src} alt={code} className="flag-img" width="20" height="15" />
                <span className="option-text">{flag.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './CookieConsent.css';

const COOKIE_KEY = 'ytmagnet_cookie_consent';

function CookieConsent() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so it doesn't flash immediately on load
    const timer = setTimeout(() => {
      const saved = localStorage.getItem(COOKIE_KEY);
      if (!saved) setVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_KEY, 'all');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_KEY, 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-bar">
      <div className="cookie-bar-inner">
        {/* Icon */}
        <div className="cookie-icon">🍪</div>

        {/* Text */}
        <div className="cookie-text">
          <p className="cookie-title">{t('cookie.title')}</p>
          <p className="cookie-desc">{t('cookie.desc')}</p>
        </div>

        {/* Actions */}
        <div className="cookie-actions">
          <button className="cookie-btn cookie-btn-essential" onClick={handleEssentialOnly}>
            {t('cookie.essential')}
          </button>
          <button className="cookie-btn cookie-btn-accept" onClick={handleAcceptAll}>
            {t('cookie.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;

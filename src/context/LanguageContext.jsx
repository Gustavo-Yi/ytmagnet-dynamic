import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import zh from '../locales/zh.json';
import en from '../locales/en.json';

const locales = { zh, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Detect saved language or browser preference
  const getInitialLang = () => {
    const saved = localStorage.getItem('ytmagnet_lang');
    if (saved && locales[saved]) return saved;
    return 'en'; // Default to English for international visitors
  };

  const [lang, setLang] = useState(getInitialLang);

  // When language changes: persist, update <html lang>, update meta hreflang
  useEffect(() => {
    localStorage.setItem('ytmagnet_lang', lang);

    // Update HTML lang attribute for screen readers and SEO crawlers
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // Update/create hreflang alternate links
    const updateHreflang = (hreflang, href) => {
      let link = document.querySelector(`link[hreflang="${hreflang}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hreflang;
        document.head.appendChild(link);
      }
      link.href = href;
    };
    const base = window.location.origin;
    updateHreflang('zh', `${base}/`);
    updateHreflang('en', `${base}/en`);
    updateHreflang('x-default', `${base}/`);

    // Update meta description for SEO
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = locales[lang].site.description;
  }, [lang]);

  /**
   * t('nav.about') → reads nested key from current locale JSON
   * Supports deep dot-notation: t('home.slides.magnetic.title')
   */
  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = locales[lang];
    for (const k of keys) {
      if (val == null) return key;
      val = val[k];
    }
    return val ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Easy hook: const { t, lang, setLang } = useLanguage();
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

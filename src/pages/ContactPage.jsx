import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './ContactPage.css';

const WHATSAPP_NUMBER = '8613107497745';
const EMAIL = 'yiyi@yutongglobal.com';

function ContactPage() {
  const { t } = useLanguage();
  usePageTitle(t('pages.contact.title'));

  const cards = [
    {
      key: 'address',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
      label: t('pages.contact.address.label'),
      value: t('pages.contact.address.value'),
      href: null,
      accent: 'rgba(255, 60, 60, 0.7)',   /* Red for location pin */
    },
    {
      key: 'whatsapp',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      label: t('pages.contact.whatsapp.label'),
      value: t('pages.contact.whatsapp.value'),
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
      accent: 'rgba(37, 211, 102, 0.6)',
    },
    {
      key: 'email',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      ),
      label: t('pages.contact.email.label'),
      value: t('pages.contact.email.value'),
      href: `mailto:${EMAIL}`,
      accent: 'rgba(120, 160, 255, 0.6)',
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <h1 className="contact-hero-title">{t('pages.contact.title')}</h1>
        <p className="contact-hero-sub">{t('pages.contact.sub')}</p>
      </div>

      {/* Three Contact Cards */}
      <div className="contact-cards">
        {cards.map((card) => {
          const inner = (
            <>
              <div className="contact-card-icon" style={{ '--accent': card.accent }}>
                {card.icon}
              </div>
              <p className="contact-card-label">{card.label}</p>
              <p className="contact-card-value">{card.value}</p>
              {card.href && (
                <span className="contact-card-cta">
                  {card.key === 'whatsapp' ? '→ Chat Now' : '→ Send Email'}
                </span>
              )}
            </>
          );

          return card.href ? (
            <a
              key={card.key}
              href={card.href}
              target={card.key === 'whatsapp' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="contact-card contact-card-link"
            >
              {inner}
            </a>
          ) : (
            <div key={card.key} className="contact-card">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContactPage;

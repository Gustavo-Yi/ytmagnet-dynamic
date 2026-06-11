import React, { useState } from 'react';
import './FloatingContact.css';

const WHATSAPP_CONTACTS = [
  { label: '+86 131 0749 7745', href: 'https://wa.me/8613107497745' },
  { label: '+86 158 0261 1192', href: 'https://wa.me/8615802611192' },
  { label: '+86 138 5789 4197', href: 'https://wa.me/8613857894197' },
];

const EMAIL_CONTACTS = [
  'yutong@yutongglobal.com',
  'yiyi@yutongglobal.com',
  'wangwu@yutongglobal.com',
  'hudie@yutongglobal.com',
];

function FloatingContact() {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const closeTooltipOnBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setActiveTooltip(null);
    }
  };

  return (
    <div className="floating-contact">

      {/* WhatsApp */}
      <div
        className={`fc-btn fc-whatsapp ${activeTooltip === 'whatsapp' ? 'is-open' : ''}`}
        onMouseEnter={() => setActiveTooltip('whatsapp')}
        onMouseLeave={() => setActiveTooltip(null)}
        onFocus={() => setActiveTooltip('whatsapp')}
        onBlur={closeTooltipOnBlur}
      >
        <button
          type="button"
          className="fc-trigger"
          aria-label="Show WhatsApp contacts"
          aria-expanded={activeTooltip === 'whatsapp'}
          aria-controls="fc-whatsapp-list"
          onClick={() => setActiveTooltip('whatsapp')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>
        {activeTooltip === 'whatsapp' && (
          <div id="fc-whatsapp-list" className="fc-tooltip" role="menu" aria-label="WhatsApp contacts">
            <p className="fc-tooltip-label">WhatsApp</p>
            <div className="fc-contact-list">
              {WHATSAPP_CONTACTS.map((contact) => (
                <a
                  key={contact.href}
                  className="fc-contact-link"
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                >
                  <span className="fc-tooltip-value">{contact.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email */}
      <div
        className={`fc-btn fc-email ${activeTooltip === 'email' ? 'is-open' : ''}`}
        onMouseEnter={() => setActiveTooltip('email')}
        onMouseLeave={() => setActiveTooltip(null)}
        onFocus={() => setActiveTooltip('email')}
        onBlur={closeTooltipOnBlur}
      >
        <button
          type="button"
          className="fc-trigger"
          aria-label="Show email contacts"
          aria-expanded={activeTooltip === 'email'}
          aria-controls="fc-email-list"
          onClick={() => setActiveTooltip('email')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </button>
        {activeTooltip === 'email' && (
          <div id="fc-email-list" className="fc-tooltip" role="menu" aria-label="Email contacts">
            <p className="fc-tooltip-label">Email</p>
            <div className="fc-contact-list">
              {EMAIL_CONTACTS.map((email) => (
                <a key={email} className="fc-contact-link" href={`mailto:${email}`} role="menuitem">
                  <span className="fc-tooltip-value">{email}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top */}
      <button className="fc-btn fc-top" type="button" onClick={scrollToTop} aria-label="Scroll to top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>

    </div>
  );
}

export default FloatingContact;

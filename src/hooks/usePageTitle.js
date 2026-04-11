import { useEffect } from 'react';

const SITE_NAME = 'YT Magnet - 钰彤磁业';

/**
 * Sets the browser tab title for the current page.
 * If a pageTitle is given, format: "页面名称 | YT Magnet - 钰彤磁业"
 * If no pageTitle (home), just show the site name.
 */
const usePageTitle = (pageTitle = '') => {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME;
  }, [pageTitle]);
};

export default usePageTitle;

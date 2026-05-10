import { useEffect } from 'react';

const SITE_NAME = 'Yutong Magnet';

/**
 * Sets the browser tab title for the current page.
 * If a pageTitle is given, format: "Page Title | Yutong Magnet"
 * If no pageTitle (home), just show the site name.
 */
const usePageTitle = (pageTitle = '') => {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME;
  }, [pageTitle]);
};

export default usePageTitle;

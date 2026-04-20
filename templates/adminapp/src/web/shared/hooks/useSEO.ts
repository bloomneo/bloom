/**
 * Custom SEO Hook
 * Manages page title, meta description, and other SEO tags using native document API.
 *
 * Title formatting is centralized in `shared/config/site.ts` — pass
 * just the page-specific part (e.g. `"Dashboard"`) and the hook
 * renders `"Dashboard — MyApp"` in the tab. Pages that want a bare
 * title without the brand suffix can pass `titleFormat="exact"`.
 */

import { useEffect } from 'react';
import { siteConfig } from '../config/site';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  /**
   * 'template' (default) — feeds `title` through
   *   `siteConfig.formatTitle()` so the tab reads "X — MyApp".
   * 'exact' — use `title` verbatim. Rare; mostly for legal pages
   *   that want to match the printed document title.
   */
  titleFormat?: 'template' | 'exact';
}

export const useSEO = ({
  title,
  description = siteConfig.description,
  keywords = 'react, fbca, uikit, components, typescript',
  ogTitle,
  ogDescription,
  ogImage = '/favicon.ico',
  canonical,
  titleFormat = 'template',
}: SEOOptions = {}) => {
  useEffect(() => {
    // Compose final title using central site config unless caller opts out.
    const finalTitle =
      titleFormat === 'exact' && title
        ? title
        : siteConfig.formatTitle(title);

    // Set page title
    document.title = finalTitle;

    // Helper function to set or update meta tags
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', content);
    };

    // Set meta description
    setMetaTag('description', description);

    // Set keywords
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Set Open Graph tags — fall back to the formatted title so
    // link-preview cards read "Dashboard — MyApp" even if the
    // caller didn't set an explicit ogTitle.
    setMetaTag('og:title', ogTitle || finalTitle, true);
    setMetaTag('og:description', ogDescription || description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', 'website', true);

    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', ogTitle || finalTitle);
    setMetaTag('twitter:description', ogDescription || description);
    setMetaTag('twitter:image', ogImage);

    // Set canonical URL if provided
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // Set viewport if not already present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(viewport);
    }

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, titleFormat]);
};
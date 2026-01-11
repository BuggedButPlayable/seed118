import { translations } from '../i18n/translation';

export const PATHS = {
   HOME: {
      paths: '/',
      getHref: (lang?: string) => href('HOME', lang),
   },
   NOT_FOUND: {
      paths: '/not-found',
      getHref: (lang?: string) => href('NOT_FOUND', lang),
   },
   PRIVACY: {
      paths: '/legal/privacy-policy',
      getHref: (lang?: string) => href('PRIVACY', lang),
      crumbs: (lang?: string) => [
         { label: translations.nav.home, href: PATHS.HOME.getHref(lang) },
         {
            label: translations.nav.privacy,
            current: true,
         },
      ],
   },
   TERMS: {
      paths: '/legal/terms-of-service',
      getHref: (lang?: string) => href('TERMS', lang),
      crumbs: (lang?: string) => [
         { label: translations.nav.home, href: PATHS.HOME.getHref(lang) },
         {
            label: translations.nav.terms,
            current: true,
         },
      ],
   },
   IMPRINT: {
      paths: '/legal/imprint',
      getHref: (lang?: string) => href('IMPRINT', lang),
      crumbs: (lang?: string) => [
         { label: translations.nav.home, href: PATHS.HOME.getHref(lang) },
         {
            label: translations.nav.imprint,
            current: true,
         },
      ],
   },
   BLOG: {
      paths: '/blog',
      getHref: (lang?: string) => href('BLOG', lang),
      crumbs: (lang?: string) => [
         { label: translations.nav.home, href: PATHS.HOME.getHref(lang) },
         {
            label: translations.nav.blog,
            current: true,
         },
      ],
   },
   BLOG_POST: {
      paths: '/blog',
      getHref: (lang?: string, slug?: string) => {
         const s = (slug || '').replace(/^\/+|\/+$/g, '');
         return href('BLOG', lang) + (s ? `/${s}` : '');
      },
      crumbs: (lang?: string) => [
         { label: translations.nav.home, href: PATHS.HOME.getHref(lang) },
         {
            label: translations.nav.blog,
            current: true,
         },
      ],
   },
   GITHUB: {
      href: () => "https://github.com/BuggedButPlayable/seed118",
   },
   CONTACT: {
      href: () => "mailto:contact@seed118.com"
   }
} as const;

export type PathKey = keyof typeof PATHS;

export function href(key: PathKey, lang?: string) {
   if (lang != 'de' && lang != 'en') {
      lang = 'en';
   }
   const base = PATHS[key];
   return lang ? `/${lang}${base.paths}` : base.paths;
}

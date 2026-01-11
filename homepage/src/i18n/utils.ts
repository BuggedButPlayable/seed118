import { translations } from "./translation";

export type Lang = 'en';
export const defaultLang: Lang = 'en';
const SUPPORTED_LANGS = new Set<Lang>(['en']);

export function getLangFromUrl(url: URL) {
   const [, lang] = url.pathname.split('/');
   if (SUPPORTED_LANGS.has(lang as Lang)) return lang as Lang;
   return defaultLang;
}

export function useTranslations(lang: Lang) {
   return function t(key: string) {
      const keys = key.split('.');
      let value: any = translations;

      for (const k of keys) {
         value = value?.[k];
         if (value === undefined) return key;
      }

      return value?.[lang] || value?.[defaultLang] || key;
   };
}

export function switchLangInUrl(url: string, newLang: Lang) {
   const segments = url.split('/').filter(Boolean);
   if (segments.length > 0 && SUPPORTED_LANGS.has(segments[0] as Lang)) {
      segments[0] = newLang;
   } else {
      segments.unshift(newLang);
   }
   return `/${segments.join('/')}`;
}

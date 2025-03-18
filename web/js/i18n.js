import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    backend: {
      loadPath: '/locales/{{lng}}.json'
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18next; 
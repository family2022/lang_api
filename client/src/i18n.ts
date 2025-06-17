import i18n from 'i18next';
import { initReactI18next } from 'preact-i18next';
import enTranslation from './locales/en.json';
import amTranslation from './locales/am.json';
import omTranslation from './locales/om.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    am: { translation: amTranslation },
    om: { translation: omTranslation },
  },
  lng: 'om',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

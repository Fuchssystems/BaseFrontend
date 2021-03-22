import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from 'src/i18n';
import { Quasar } from 'quasar';

// get default locale
const appLanguages = {
  de: 'de-de',
  en: 'en-us',
  es: 'es-es',
};
const makeDefaultLocale = () => {
  let returnValue = 'de-de';
  const browserLocaleCountryCode = Quasar.lang.getLocale().substr(0, 2);
  if (appLanguages[browserLocaleCountryCode]) {
    returnValue = appLanguages[browserLocaleCountryCode];
  }
  return returnValue;
};
const defaultLocale = makeDefaultLocale();

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: defaultLocale,
  fallbackLocale: 'en-us',
  messages,
});

export default ({ app, store }) => {
  // use locale from store if it was set from browser localStore in store/index.js
  if (store.getters.getUserLanguageLocale) i18n.locale = store.getters.getUserLanguageLocale;
  // Set i18n instance on app
  app.i18n = i18n;
};

export { i18n, defaultLocale };

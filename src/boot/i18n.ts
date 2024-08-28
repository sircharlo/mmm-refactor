import * as dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import localeData from 'dayjs/plugin/localeData';
import { Lang } from 'quasar';
import { boot } from 'quasar/wrappers';
import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['en-US'];

/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

const refreshDateLocale = async (locale: string) => {
  const langList = import.meta.glob('../../node_modules/quasar/lang/*.js');
  dayjs.extend(localeData);
  dayjs.locale(locale);
  dayjs.localeData();

  const loadLang = async (locale: string) => {
    try {
      await langList[`../../node_modules/quasar/lang/${locale}.js`]().then(
        (lang) => {
          Lang.set(lang.default);
        },
      );
      console.log(`Loaded language pack for locale ${locale}`);
      return true; // Successfully loaded the language pack
    } catch (err) {
      console.error(`Failed to load language pack for locale ${locale}:`, err);
      return false; // Failed to load the language pack
    }
  };

  // Try loading the specific locale
  const loaded = await loadLang(locale);
  if (!loaded) {
    // Fallback to a more general locale if specific one doesn't exist
    const generalLocale = locale.split('-')[0];
    if (generalLocale !== locale) {
      await loadLang(generalLocale);
    }
  }
};
let i18n: ReturnType<typeof createI18n> = createI18n({});

export default boot(({ app }) => {
  i18n = createI18n({
    fallbackLocale: 'en-US',
    legacy: false,
    locale: 'en-US',
    messages,
  });
  app.use(i18n);
});

export { i18n, refreshDateLocale };

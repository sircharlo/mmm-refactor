import * as dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import localeData from 'dayjs/plugin/localeData';
import { Lang } from 'quasar';
import { boot } from 'quasar/wrappers';
import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['en'];

/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

const refreshDateLocale = (locale: string) => {
  const langList = import.meta.glob('../../node_modules/quasar/lang/*.js');
  console.log('refreshDateLocale', locale);
  dayjs.extend(localeData);
  dayjs.locale(locale);
  dayjs.localeData();
  console.log(dayjs.weekdays());
  try {
    langList[`../../node_modules/quasar/lang/${locale}.js`]().then((lang) => {
      Lang.set(lang.default);
    });
  } catch (err) {
    console.error(err);
    // Requested Quasar Language Pack does not exist,
    // let's not break the app, so catching error
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

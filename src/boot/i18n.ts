import * as dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import 'dayjs/locale/af';
import 'dayjs/locale/am';
import 'dayjs/locale/zh'; // Should be mapped to cmnHans
import 'dayjs/locale/de';
import 'dayjs/locale/el';
import 'dayjs/locale/es';
import 'dayjs/locale/et';
import 'dayjs/locale/fi';
import 'dayjs/locale/hu';
// import 'dayjs/locale/ilo'; // Doesn't exist yet
import 'dayjs/locale/it';
// import 'dayjs/locale/mg'; // Doesn't exist yet
import 'dayjs/locale/nl';
// import 'dayjs/locale/pag'; // Doesn't exist yet
import 'dayjs/locale/pt'; // Should be mapped to ptPt
import 'dayjs/locale/pt-br'; // Should be mapped to pt
// import 'dayjs/locale/rmn-x-rmg'; // Doesn't exist yet
import 'dayjs/locale/ro';
import 'dayjs/locale/ru';
import 'dayjs/locale/sk';
import 'dayjs/locale/sl';
import 'dayjs/locale/sv';
import 'dayjs/locale/sw';
import 'dayjs/locale/ta';
import 'dayjs/locale/tl-ph'; // Should be mapped to tl
import 'dayjs/locale/uk';
// import 'dayjs/locale/wes-x-pgw'; // Doesn't exist yet
import localeData from 'dayjs/plugin/localeData';
import { Lang } from 'quasar';
import { boot } from 'quasar/wrappers';
import { errorCatcher } from 'src/helpers/error-catcher';
import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['en'];

const refreshDateLocale = async (locale: string) => {
  const langList = import.meta.glob('../../node_modules/quasar/lang/*.js');
  dayjs.extend(localeData);

  let dayjsLocale = locale;
  if (locale === 'cmnHans') {
    dayjsLocale = 'zh';
  } else if (locale === 'pt') {
    dayjsLocale = 'pt-pt';
  } else if (locale === 'ptPt') {
    dayjsLocale = 'pt';
  } else if (locale === 'tl') {
    dayjsLocale = 'tl-ph';
  } else if (locale === 'en') {
    dayjsLocale = 'en-US';
  }
  dayjs.locale(dayjsLocale);
  dayjs.localeData();

  let quasarLocale = locale;
  if (locale === 'cmnHans') {
    quasarLocale = 'zh-CN';
  } else if (locale === 'pt') {
    quasarLocale = 'pt-BR';
  } else if (locale === 'ptPt') {
    quasarLocale = 'pt';
  } else if (locale === 'en') {
    quasarLocale = 'en-US';
  } else if (locale === 'fr-CA') {
    quasarLocale = 'fr';
  }

  const loadLang = async (locale: string) => {
    try {
      await langList[`../../node_modules/quasar/lang/${locale}.js`]().then(
        (lang) => {
          Lang.set(lang.default);
        },
      );
      return true; // Successfully loaded the language pack
    } catch (err) {
      // errorCatcher(err);
      errorCatcher(`Failed to load language pack for locale ${locale}: ${err}`);
      // console.log(err, `Failed to load language pack for locale ${locale}`);
      return false; // Failed to load the language pack
    }
  };

  // Try loading the specific locale
  let loaded = await loadLang(quasarLocale);
  if (!loaded) {
    // Fallback to a more general locale if specific one doesn't exist
    loaded = await loadLang('en');
  }
};
let i18n: ReturnType<typeof createI18n> = createI18n({});

export default boot(({ app }) => {
  i18n = createI18n({
    fallbackLocale: 'en',
    legacy: false,
    locale: 'en',
    messages,
  });
  app.use(i18n);
});

export { i18n, refreshDateLocale };

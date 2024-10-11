import type { DateLocale } from 'quasar';
import type { MessageLanguages } from 'src/boot/i18n';

import { computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

export function useLocale() {
  const i18n = useI18n();
  const { availableLocales, locale, setLocaleMessage, t } = i18n;

  const dateLocale = computed((): Required<DateLocale> => {
    return {
      days: t('days-long').split('_'),
      daysShort: t('days-short').split('_'),
      months: t('months-long').split('_'),
      monthsShort: t('months-short').split('_'),
    };
  });

  async function loadI18nMessages(lang: MessageLanguages) {
    if (!availableLocales.includes(lang)) {
      const messages = await import(`./../i18n/${lang}.json`);
      setLocaleMessage(lang, messages.default);
      await nextTick();
    }
  }

  async function switchLocale(newLocale: MessageLanguages) {
    console.log('Switching locale to:', newLocale);
    if (!availableLocales.includes(newLocale)) {
      await loadI18nMessages(newLocale);
    }

    locale.value = newLocale;
    document.querySelector('html')?.setAttribute('lang', newLocale);
  }

  return { dateLocale, locale, switchLocale, t };
}

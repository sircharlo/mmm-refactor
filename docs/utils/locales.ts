import type { DefaultTheme, LocaleConfig } from 'vitepress';
import type { LocalSearchTranslations } from 'vitepress/types/local-search';

import pkg from './../../package.json';
import messages, { localeOptions } from './../locales';
import { GH_REPO_URL } from './constants';
import { camelToKebabCase } from './general';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['en'];

export const mapLocales = (): LocaleConfig<DefaultTheme.Config> => {
  const locales: LocaleConfig<DefaultTheme.Config> = {
    root: {
      description: messages.en.description,
      label: 'English',
      lang: 'en',
      themeConfig: mapThemeConfig('', messages.en),
      title: messages.en.title,
    },
  };

  localeOptions
    .filter((l) => l.value !== 'en')
    .forEach((locale) => {
      const lang = camelToKebabCase(locale.value);
      const msg = messages[locale.value as MessageLanguages];
      locales[lang] = {
        description: msg.description,
        label: locale.label,
        lang,
        themeConfig: mapThemeConfig(lang, msg),
        title: msg.title,
      };
    });

  return locales;
};

const mapSearchTranslations = (
  msg: MessageSchema,
): LocalSearchTranslations => ({
  button: { buttonAriaLabel: msg.search, buttonText: msg.search },
  modal: {
    backButtonTitle: msg.backButtonTitle,
    displayDetails: msg.displayDetails,
    footer: {
      closeText: msg.closeText,
      navigateText: msg.navigateText,
      selectText: msg.selectText,
    },
    noResultsText: msg.noResultsText,
    resetButtonTitle: msg.resetButtonTitle,
  },
});

export const mapSearch = (): {
  options: DefaultTheme.LocalSearchOptions;
  provider: 'local';
} => {
  const locales: Record<
    string,
    Partial<Omit<DefaultTheme.LocalSearchOptions, 'locales'>>
  > = {};

  localeOptions
    .filter((l) => l.value !== 'en')
    .forEach((locale) => {
      const lang = camelToKebabCase(locale.value);
      const msg = messages[locale.value as MessageLanguages];
      locales[lang] = {
        translations: mapSearchTranslations(msg),
      };
    });

  return {
    options: {
      detailedView: true,
      locales,
      translations: mapSearchTranslations(messages.en),
    },
    provider: 'local',
  };
};

const link = (locale: string, url: string) =>
  `${locale ? `/${locale}` : ''}/${url}`;

export const mapThemeConfig = (
  locale: string,
  msg: MessageSchema,
): DefaultTheme.Config => ({
  darkModeSwitchLabel: msg.darkModeSwitchLabel,
  darkModeSwitchTitle: msg.darkModeSwitchTitle,
  docFooter: { next: msg.docFooterNext, prev: msg.docFooterPrev },
  editLink: {
    pattern: 'https://crowdin.com/project/meeting-media-manager',
    text: msg.editLink,
  },
  lastUpdated: { text: msg.lastUpdated },
  lightModeSwitchTitle: msg.lightModeSwitchTitle,
  nav: [
    { link: link(locale, 'about'), text: msg.about },
    {
      items: [
        {
          link: GH_REPO_URL + '/blob/main/CHANGELOG.md',
          text: 'Changelog',
        },
        {
          link: GH_REPO_URL + '/issues/new',
          text: msg.reportIssue,
        },
      ],
      text: pkg.version,
    },
  ],
  outline: { label: msg.outline },
  returnToTopLabel: msg.returnToTopLabel,
  sidebar: [
    { link: link(locale, 'about'), text: msg.about },
    { link: link(locale, 'faq'), text: msg.faq },
  ],
});

import { defineConfig } from 'vitepress';
import { mapLocales, mapSearch } from './../utils/locales';
import { GH_REPO, GH_REPO_URL } from './../utils/constants';

const base = `/${GH_REPO}/`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base,
  srcDir: './src',
  cleanUrls: true,
  lastUpdated: true,
  markdown: { image: { lazyLoading: true } },
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '128x128',
        href: `${base}icons/favicon-128x128.png`,
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: `${base}icons/favicon-96x96.png`,
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: `${base}icons/favicon-32x32.png`,
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: `${base}icons/favicon-16x16.png`,
      },
    ],
    ['link', { rel: 'icon', type: 'image/ico', href: `${base}favicon.ico` }],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${base}logo-no-background.svg`,
      },
    ],
  ],
  locales: mapLocales(),
  themeConfig: {
    externalLinkIcon: true,
    logo: '/icon.png',
    outline: { level: 'deep' },
    search: mapSearch(),
    lastUpdated: { formatOptions: { dateStyle: 'full', forceLocale: true } },
    socialLinks: [{ icon: 'github', link: GH_REPO_URL, ariaLabel: 'GitHub' }],
  },
});

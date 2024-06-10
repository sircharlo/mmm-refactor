import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CongregationSelectorPage.vue'),
      },
    ],
    meta: { title: 'titles.congregationSelector' },
  },

  {
    path: '/congregation-selector',
    meta: { title: 'titles.congregationSelector' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CongregationSelectorPage.vue'),
      },
    ],
  },

  {
    path: '/media-calendar',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MediaCalendarPage.vue') },
    ],
    meta: { title: 'titles.mediaCalendar' },
  },

  {
    path: '/media-player',
    component: () => import('layouts/MediaPlayerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MediaPlayerPage.vue') },
    ],
    meta: { title: 'titles.mediaPlayer' },
  },
  {
    path: '/setup-wizard',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SetupWizard.vue') }],
    meta: { title: 'Setup Wizard' },
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SettingsPage.vue') }],
    meta: { title: 'titles.settings' },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('layouts/RouteHelper.vue'),
    path: '/',
  },
  {
    alias: ['/initial-congregation-selector'],
    children: [
      {
        component: () => import('pages/CongregationSelectorPage.vue'),
        path: '',
      },
    ],
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: 'titles.profileSelection' },
    path: '/congregation-selector',
  },
  {
    children: [
      { component: () => import('pages/MediaCalendarPage.vue'), path: '' },
    ],
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: 'titles.mediaCalendar' },
    path: '/media-calendar',
  },
  {
    children: [
      { component: () => import('pages/MediaPlayerPage.vue'), path: '' },
    ],
    component: () => import('layouts/MediaPlayerLayout.vue'),
    meta: { title: 'titles.mediaPlayer' },
    path: '/media-player',
  },
  {
    children: [{ component: () => import('pages/SetupWizard.vue'), path: '' }],
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: 'setup-wizard' },
    path: '/setup-wizard',
  },
  {
    children: [{ component: () => import('pages/SettingsPage.vue'), path: '' }],
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: 'titles.settings' },
    path: '/settings',
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    component: () => import('pages/ErrorNotFound.vue'),
    path: '/:catchAll(.*)*',
  },
];

export default routes;

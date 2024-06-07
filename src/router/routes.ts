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
    meta: { title: 'Home' },
  },

  {
    path: '/congregation-selector',
    meta: { title: 'Congregation selection' },
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
    meta: { title: 'Media calendar' },
  },

  {
    path: '/media-player',
    component: () => import('layouts/MediaPlayerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MediaPlayerPage.vue') },
    ],
    meta: { title: 'Media player' },
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
    meta: { title: 'Settings' },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

/* eslint-disable perfectionist/sort-objects */

import {
  SettingsGroups,
  SettingsItems,
  SettingsValues,
} from 'src/types/settings';

export const settingsGroups: SettingsGroups = {
  app: {
    description: 'applicationConfigurationDescription',
    name: 'applicationConfiguration',
    icon: 'mmm-configuration',
  },
  congregationMeetings: {
    description: 'congregationMeetingsDescription',
    name: 'congregationMeetings',
    icon: 'mmm-lectern',
  },
  mediaRetrievalPlayback: {
    description: 'mediaRetrievalAndPlaybackDescription',
    name: 'mediaRetrievalAndPlayback',
    icon: 'mmm-media-settings',
  },
  integrations: {
    description: 'integrationsDescription',
    name: 'integrations',
    icon: 'mmm-integrations',
  },
  advanced: {
    name: 'advanced',
    description: 'advancedDescription',
    icon: 'mmm-advanced-settings',
  },
};

export const settingsDefinitions: SettingsItems = {
  // App
  localAppLang: {
    group: 'app',
    list: 'appLanguages',
    type: 'list',
  },
  darkMode: {
    group: 'app',
    list: 'darkModes',
    type: 'list',
  },
  autoStartAtLogin: {
    group: 'app',
    type: 'toggle',
  },
  // Congregation Meetings
  congregationName: {
    group: 'congregationMeetings',
    rules: ['notEmpty'],
    type: 'text',
  },
  lang: {
    group: 'congregationMeetings',
    list: 'jwLanguages',
    type: 'list',
  },
  langFallback: {
    group: 'congregationMeetings',
    list: 'jwLanguages',
    type: 'list',
  },
  mwDay: {
    group: 'congregationMeetings',
    list: 'days',
    rules: ['notEmpty'],
    type: 'list',
  },
  mwStartTime: {
    group: 'congregationMeetings',
    options: ['meetingTime'],
    rules: ['notEmpty'],
    type: 'time',
  },
  weDay: {
    group: 'congregationMeetings',
    list: 'days',
    rules: ['notEmpty'],
    type: 'list',
  },
  weStartTime: {
    group: 'congregationMeetings',
    options: ['meetingTime'],
    rules: ['notEmpty'],
    type: 'time',
  },
  coWeek: {
    group: 'congregationMeetings',
    options: ['coTuesdays'],
    type: 'date',
  },
  // Media Retrieval and Playback
  enableMediaDisplayButton: {
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  enableMusicButton: {
    group: 'mediaRetrievalPlayback',
    subgroup: 'setupWizard.backgroundMusic',
    type: 'toggle',
  },
  autoStartMusic: {
    depends: 'enableMusicButton',
    group: 'mediaRetrievalPlayback',
    subgroup: 'setupWizard.backgroundMusic',
    type: 'toggle',
  },

  // excludeLffImages: {
  //   type: 'toggle',
  //   group: 'mediaRetrievalPlayback',
  //   depends: 'enableMediaDisplayButton',
  // },

  // Integrations
  obsEnable: {
    actions: ['obsConnect'],
    group: 'integrations',
    subgroup: 'obsStudio',
    type: 'toggle',
    // icon: 'img:data:image/svg+xml;charset=utf8,<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M43.765,34.373 c1.267-3.719-0.131-8.03-3.567-10.23c-4.024-2.576-9.374-1.401-11.95,2.623h0c-1.854,2.896-1.756,6.474-0.061,9.215 c-1.009,1.556-2.369,2.917-4.07,3.931c-5.4,3.22-12.356,1.952-16.225-2.779c-0.186-0.262-0.367-0.527-0.541-0.797 c2.62,3.273,7.404,4.213,11.166,2.09c4.161-2.348,5.631-7.625,3.283-11.786v0c-1.618-2.867-4.627-4.456-7.703-4.399 c-0.994-1.792-1.563-3.852-1.563-6.047c0-5.482,3.537-10.119,8.448-11.8c0.36-0.07,0.728-0.116,1.094-0.168 c-3.321,1.208-5.698,4.384-5.698,8.123c0,4.778,3.873,8.651,8.651,8.651c3.179,0,5.949-1.719,7.453-4.274 c2.197,0.015,4.417,0.594,6.427,1.825c5.056,3.094,7.173,9.294,5.39,14.713C44.137,33.643,43.948,34.007,43.765,34.373z" /></svg>',
  },
  obsPassword: {
    actions: ['obsConnect'],
    depends: 'obsEnable',
    group: 'integrations',
    subgroup: 'obsStudio',
    type: 'text',
  },
  obsPort: {
    actions: ['obsConnect'],
    depends: 'obsEnable',
    group: 'integrations',
    subgroup: 'obsStudio',
    type: 'text',
  },
  obsCameraScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsAllScenes',
    subgroup: 'obsStudio',
    type: 'list',
  },
  obsMediaScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsAllScenes',
    subgroup: 'obsStudio',
    type: 'list',
  },
  obsImageScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsAllScenes',
    subgroup: 'obsStudio',
    type: 'list',
  },

  // Advanced

  enableKeyboardShortcuts: {
    group: 'advanced',
    subgroup: 'keyboardShortcuts',
    type: 'toggle',
  },
  shortcutMediaWindow: {
    depends: 'enableKeyboardShortcuts',
    group: 'advanced',
    subgroup: 'keyboardShortcuts',
    type: 'shortcut',
  },
  // shortcutMediaPrevious: {
  //   depends: 'enableKeyboardShortcuts',
  //   group: 'advanced',
  //   subgroup: 'keyboardShortcuts',
  //   type: 'shortcut',
  // },
  // shortcutMediaNext: {
  //   depends: 'enableKeyboardShortcuts',
  //   group: 'advanced',
  //   subgroup: 'keyboardShortcuts',
  //   type: 'shortcut',
  // },
  shortcutMusic: {
    depends: 'enableKeyboardShortcuts',
    group: 'advanced',
    subgroup: 'keyboardShortcuts',
    type: 'shortcut',
  },
  hideMediaLogo: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    subgroup: 'media-display',
    type: 'toggle',
  },
  maxRes: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    list: 'resolutions',
    subgroup: 'media-display',
    type: 'list',
  },
  includePrinted: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    subgroup: 'media-display',
    type: 'toggle',
  },
  excludeFootnotes: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    subgroup: 'media-display',
    type: 'toggle',
  },
  excludeTh: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    subgroup: 'media-display',
    type: 'toggle',
  },
  enableSubtitles: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    subgroup: 'subtitles',
    type: 'toggle',
  },
  langSubtitles: {
    depends: 'enableSubtitles',
    group: 'advanced',
    list: 'jwLanguages',
    subgroup: 'subtitles',
    type: 'list',
  },
  enableExtraCache: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    type: 'toggle',
  },
  musicVolume: {
    depends: 'enableMusicButton',
    group: 'advanced',
    max: 100,
    min: 0,
    step: 1,
    subgroup: 'setupWizard.backgroundMusic',
    type: 'slider',
  },
  disableMediaFetching: {
    group: 'advanced',
    subgroup: 'dangerZone',
    type: 'toggle',
  },
};

export const defaultSettings: SettingsValues = {
  autoStartAtLogin: false,
  autoStartMusic: true,
  coWeek: '',
  congregationName: '',
  darkMode: 'auto',
  disableMediaFetching: false,
  enableExtraCache: false,
  enableKeyboardShortcuts: false,
  enableMediaDisplayButton: false,
  enableMusicButton: true,
  enableSubtitles: false,
  excludeFootnotes: false,
  excludeTh: true,
  hideMediaLogo: false,
  includePrinted: true,
  // shortcutMediaNext: '',
  // shortcutMediaPrevious: '',
  shortcutMediaWindow: '',
  shortcutMusic: '',
  lang: 'E',
  langFallback: '',
  langSubtitles: '',
  localAppLang: 'en-US',
  maxRes: '720p',
  musicVolume: 100,
  mwDay: '',
  mwStartTime: '',
  obsCameraScene: '',
  obsEnable: false,
  obsImageScene: '',
  obsMediaScene: '',
  obsPassword: '',
  obsPort: '',
  weDay: '',
  weStartTime: '',
};

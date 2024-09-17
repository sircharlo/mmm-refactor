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
    rules: ['portNumber'],
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
    subgroup: 'cache',
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
  localAppLang: 'en',
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

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
  },
  congregationMeetings: {
    description: 'congregationMeetingsDescription',
    name: 'congregationMeetings',
  },
  mediaRetrievalPlayback: {
    description: 'mediaRetrievalAndPlaybackDescription',
    name: 'mediaRetrievalAndPlayback',
  },
  integrations: {
    description: 'integrationsDescription',
    name: 'integrations',
  },
  advanced: {
    name: 'advanced',
    description: 'advancedDescription',
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
    type: 'toggle',
  },
  autoStartMusic: {
    depends: 'enableMusicButton',
    group: 'mediaRetrievalPlayback',
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
    type: 'toggle',
    icon: 'img:data:image/svg+xml;charset=utf8,<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M43.765,34.373 c1.267-3.719-0.131-8.03-3.567-10.23c-4.024-2.576-9.374-1.401-11.95,2.623h0c-1.854,2.896-1.756,6.474-0.061,9.215 c-1.009,1.556-2.369,2.917-4.07,3.931c-5.4,3.22-12.356,1.952-16.225-2.779c-0.186-0.262-0.367-0.527-0.541-0.797 c2.62,3.273,7.404,4.213,11.166,2.09c4.161-2.348,5.631-7.625,3.283-11.786v0c-1.618-2.867-4.627-4.456-7.703-4.399 c-0.994-1.792-1.563-3.852-1.563-6.047c0-5.482,3.537-10.119,8.448-11.8c0.36-0.07,0.728-0.116,1.094-0.168 c-3.321,1.208-5.698,4.384-5.698,8.123c0,4.778,3.873,8.651,8.651,8.651c3.179,0,5.949-1.719,7.453-4.274 c2.197,0.015,4.417,0.594,6.427,1.825c5.056,3.094,7.173,9.294,5.39,14.713C44.137,33.643,43.948,34.007,43.765,34.373z" /></svg>',
  },
  obsPassword: {
    actions: ['obsConnect'],
    depends: 'obsEnable',
    group: 'integrations',
    type: 'text',
  },
  obsPort: {
    actions: ['obsConnect'],
    depends: 'obsEnable',
    group: 'integrations',
    type: 'text',
  },
  obsCameraScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsAllScenes',
    type: 'list',
  },
  obsMediaScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsAllScenes',
    type: 'list',
  },
  obsImageScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsNonStageScenes',
    type: 'list',
  },

  // Advanced

  // todo: implement preferredOutput
  // preferredOutput: {
  //   depends: 'enableMediaDisplayButton',
  //   group: 'advanced',
  //   list: 'screens',
  //   type: 'list',
  // },
  enableKeyboardShortcuts: {
    group: 'advanced',
    type: 'toggle',
  },
  shortcutMediaWindow: {
    depends: 'enableKeyboardShortcuts',
    group: 'advanced',
    type: 'shortcut',
  },
  shortcutMediaPrevious: {
    depends: 'enableKeyboardShortcuts',
    group: 'advanced',
    type: 'shortcut',
  },
  shortcutMediaNext: {
    depends: 'enableKeyboardShortcuts',
    group: 'advanced',
    type: 'shortcut',
  },
  shortcutMusic: {
    depends: 'enableKeyboardShortcuts',
    group: 'advanced',
    type: 'shortcut',
  },
  maxRes: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    list: 'resolutions',
    type: 'list',
  },
  jwlCompanionMode: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    type: 'toggle',
  },
  hideMediaLogo: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    type: 'toggle',
  },
  includePrinted: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    type: 'toggle',
  },
  // todo: test implementation of excludeFootnotes
  excludeFootnotes: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    type: 'toggle',
  },
  excludeTh: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    type: 'toggle',
  },
  enableSubtitles: {
    depends: 'enableMediaDisplayButton',
    group: 'advanced',
    type: 'toggle',
  },
  langSubtitles: {
    depends: 'enableSubtitles',
    group: 'advanced',
    list: 'jwLanguages',
    type: 'list',
  },
  musicVolume: {
    depends: 'enableMusicButton',
    group: 'advanced',
    max: 100,
    min: 0,
    step: 1,
    type: 'slider',
  },
  // enableMusicFadeOut: {
  //   depends: 'enableMusicButton',
  //   group: 'advanced',
  //   type: 'toggle',
  // },
  // enableMp4Conversion: {
  //   type: 'toggle',
  //   depends: 'advanced',
  //   name: 'enable Mp4 Conversion',
  //   group: 'mediaRetrievalPlayback',
  // },

  // musicFadeOutType: {
  //   type: 'text',
  //   depends: 'enableMusicButton',
  //   name: 'music Fade Out Type',
  //   group: 'mediaRetrievalPlayback',
  // },
  // enablePp: {
  //   // depends: 'media',
  //   type: 'toggle',
  //   group: 'mediaRetrievalPlayback',
  // },

  // enableVlcPlaylistCreation: {
  //   type: 'toggle',
  //   // depends: 'advanced',
  //   group: 'mediaRetrievalPlayback',
  //   name: 'enable Vlc Playlist Creation',
  // },

  // musicFadeOutTime: {
  //   type: 'slider',
  //   depends: 'enableMusicButton',
  //   group: 'mediaRetrievalPlayback',
  //   max: 120,
  //   min: 5,
  //   step: 5,
  // },

  // keepOriginalsAfterConversion: {
  //   type: 'toggle',
  //   depends: 'advanced',
  //   group: 'mediaRetrievalPlayback',
  //   name: 'keep Originals After Conversion',
  // },

  // autoOpenFolderWhenDone: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'auto Open Folder When Done',
  // },
  // autoPlayFirst: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'auto Play First',
  // },
  // autoPlayFirstTime: {
  //   type: 'slider',
  //   group: 'advanced',
  //   name: 'auto Play First Time',
  //   max: 60,
  //   min: 5,
  //   step: 1,
  // },
  // autoQuitWhenDone: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'auto Quit When Done',
  // },
  // autoStartSync: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'auto Start Sync',
  // },
  // betaUpdates: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'beta Updates',
  // },
  // customCachePath: {
  //   type: 'path',
  //   group: 'advanced',
  //   name: 'custom Cache Path',
  // },
  // disableAutoUpdate: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'disable Auto Update',
  // },
  // disableHardwareAcceleration: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'disable Hardware Acceleration',
  // },
  // mediaWinShortcut: {
  //   type: 'text',
  //   group: 'advanced',
  //   depends: 'shortcuts',
  //   name: 'media Win Shortcut',
  // },
  // outputFolderDateFormat: {
  //   type: 'text',
  //   group: 'advanced',
  //   name: 'output Folder Date Format',
  // },
  // ppBackward: {
  //   type: 'text',
  //   group: 'advanced',
  //   name: 'pp Backward',
  // },
  // ppForward: {
  //   type: 'text',
  //   group: 'advanced',
  //   name: 'pp Forward',
  // },
  // presentShortcut: {
  //   type: 'text',
  //   group: 'advanced',
  //   depends: 'shortcuts',
  //   name: 'present Shortcut',
  // },
  // shuffleShortcut: {
  //   type: 'text',
  //   group: 'advanced',
  //   depends: 'shortcuts',
  //   name: 'shuffle Shortcut',
  // },
  // specialCong: {
  //   type: 'toggle',
  //   group: 'advanced',
  //   name: 'special Cong',
  // },
  // localOutputPath: {
  //   rules: ['notEmpty'],
  //   group: 'app',
  //   type: 'path',
  //   name: 'local Output Path',
  // },
};

export const defaultSettings: SettingsValues = {
  // autoOpenFolderWhenDone: false,
  // autoPlayFirst: false,
  // autoPlayFirstTime: 5,
  // autoQuitWhenDone: false,
  autoStartAtLogin: false,
  autoStartMusic: true,
  // autoStartSync: false,
  coWeek: '',
  // betaUpdates: false,
  congregationName: '',
  // disableAutoUpdate: false,
  darkMode: 'auto',
  enableKeyboardShortcuts: false,
  // disableHardwareAcceleration: false,
  enableMediaDisplayButton: false,
  // enableMp4Conversion: false,
  enableMusicButton: true,
  // enableMusicFadeOut: true,
  // enablePp: false,
  enableSubtitles: false,
  // enableVlcPlaylistCreation: false,
  excludeFootnotes: false,
  // excludeLffImages: false,
  excludeTh: true,
  hideMediaLogo: false,
  includePrinted: true,
  jwlCompanionMode: false,
  shortcutMediaNext: '',
  shortcutMediaPrevious: '',
  shortcutMediaWindow: '',
  shortcutMusic: '',
  // keepOriginalsAfterConversion: false,
  lang: 'E',
  langFallback: '',
  // mediaWinShortcut: 'Alt+Z',
  // musicFadeOutTime: 60,
  langSubtitles: '',
  localAppLang: 'en-US',
  maxRes: '720p',
  // musicFadeOutType: 'smart',
  musicVolume: 100,
  mwDay: '',
  // outputFolderDateFormat: 'YYYY-MM-DD',
  // presentShortcut: 'Alt+D',
  // shuffleShortcut: 'Alt+K',
  mwStartTime: '',
  obsCameraScene: '',
  obsEnable: false,
  obsImageScene: '',
  obsMediaScene: '',
  obsPassword: '',
  obsPort: '',
  // preferredOutput: '',
  // specialCong: false,
  weDay: '',
  weStartTime: '',
};

/* eslint-disable perfectionist/sort-objects */

import {
  SettingsGroups,
  SettingsItems,
  SettingsValues,
} from '../types/settings';

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
  // advanced: {
  //   name: 'advanced',
  //   description: 'advancedDescription',
  //   order: 5,
  // },
};

export const settingsDefinitions: SettingsItems = {
  autoRunAtBoot: {
    group: 'app',
    type: 'toggle',
  },
  autoStartMusic: {
    depends: 'enableMusicButton',
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  coWeek: {
    group: 'congregationMeetings',
    options: ['coTuesdays'],
    type: 'date',
  },
  // Congregation Meetings
  congregationName: {
    group: 'congregationMeetings',
    rules: ['notEmpty'],
    type: 'text',
  },
  darkMode: {
    group: 'app',
    list: 'darkModes',
    type: 'list',
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

  enableMusicFadeOut: {
    depends: 'enableMusicButton',
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  enableSubtitles: {
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  excludeFootnotes: {
    depends: 'enableMediaDisplayButton',
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  // },
  excludeTh: {
    depends: 'enableMediaDisplayButton',
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  hideMediaLogo: {
    depends: 'enableMediaDisplayButton',
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  // excludeLffImages: {
  //   type: 'toggle',
  //   group: 'mediaRetrievalPlayback',
  //   depends: 'enableMediaDisplayButton',
  includePrinted: {
    depends: 'enableMediaDisplayButton',
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  jwlCompanionMode: {
    group: 'mediaRetrievalPlayback',
    type: 'toggle',
  },
  lang: {
    group: 'mediaRetrievalPlayback',
    list: 'jwLanguages',
    type: 'list',
  },
  langFallback: {
    group: 'mediaRetrievalPlayback',
    list: 'jwLanguages',
    type: 'list',
  },
  langSubs: {
    depends: 'enableSubtitles',
    group: 'mediaRetrievalPlayback',
    list: 'jwLanguages',
    type: 'list',
  },
  // App
  localAppLang: {
    group: 'app',
    list: 'appLanguages',
    type: 'list',
  },
  maxRes: {
    depends: 'enableMediaDisplayButton',
    group: 'mediaRetrievalPlayback',
    list: 'resolutions',
    type: 'list',
  },
  musicVolume: {
    depends: 'enableMusicButton',
    group: 'mediaRetrievalPlayback',
    max: 100,
    min: 0,
    step: 1,
    type: 'slider',
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

  obsCameraScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsAllScenes',
    type: 'list',
  },
  // Integrations
  obsEnable: {
    actions: ['obsConnect'],
    group: 'integrations',
    type: 'toggle',
  },
  obsImageScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsNonStageScenes',
    type: 'list',
  },

  obsMediaScene: {
    depends: 'obsEnable',
    group: 'integrations',
    list: 'obsAllScenes',
    type: 'list',
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
  preferredOutput: {
    depends: 'enableMediaDisplayButton',
    group: 'mediaRetrievalPlayback',
    list: 'screens',
    type: 'list',
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
  // Advanced


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
  autoRunAtBoot: false,
  autoStartMusic: true,
  // autoStartSync: false,
  coWeek: '',
  // betaUpdates: false,
  congregationName: '',
  // disableAutoUpdate: false,
  darkMode: 'auto',
  // disableHardwareAcceleration: false,
  enableMediaDisplayButton: false,
  // enableMp4Conversion: false,
  enableMusicButton: true,
  enableMusicFadeOut: true,
  // enablePp: false,
  enableSubtitles: false,
  // enableVlcPlaylistCreation: false,
  excludeFootnotes: false,
  // excludeLffImages: false,
  excludeTh: true,
  hideMediaLogo: false,
  includePrinted: true,
  jwlCompanionMode: false,
  // keepOriginalsAfterConversion: false,
  lang: 'E',
  langFallback: '',
  // mediaWinShortcut: 'Alt+Z',
  // musicFadeOutTime: 60,
  langSubs: '',
  localAppLang: 'en-US',
  maxRes: '720p',
  // musicFadeOutType: 'smart',
  musicVolume: 100,
  mwDay: '0',
  // outputFolderDateFormat: 'YYYY-MM-DD',
  // presentShortcut: 'Alt+D',
  // shuffleShortcut: 'Alt+K',
  mwStartTime: '19:30',
  obsCameraScene: '',
  obsEnable: false,
  obsImageScene: '',
  obsMediaScene: '',
  obsPassword: '',
  obsPort: '4455',
  preferredOutput: '',
  // specialCong: false,
  weDay: '0',
  weStartTime: '10:00'
};

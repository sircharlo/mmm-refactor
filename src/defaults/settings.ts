import {
  SettingsItems,
  SettingsGroups,
  SettingsValues,
} from '../types/settings';

export const settingsGroups: SettingsGroups = {
  app: {
    name: 'applicationConfiguration',
    description: 'applicationConfigurationDescription',
  },
  congregationMeetings: {
    name: 'congregationMeetings',
    description: 'congregationMeetingsDescription',
  },
  mediaRetrievalPlayback: {
    name: 'mediaRetrievalAndPlayback',
    description: 'mediaRetrievalAndPlaybackDescription',
  },
  integrations: {
    name: 'integrations',
    description: 'integrationsDescription',
  },
  // advanced: {
  //   name: 'advanced',
  //   description: 'advancedDescription',
  //   order: 5,
  // },
};

export const settingsDefinitions: SettingsItems = {
  // Congregation Meetings
  congregationName: {
    rules: ['notEmpty'],
    type: 'text',
    group: 'congregationMeetings',
  },
  lang: {
    type: 'list',
    list: 'jwLanguages',
    group: 'mediaRetrievalPlayback',
  },
  mwDay: {
    rules: ['notEmpty'],
    type: 'list',
    list: 'days',
    group: 'congregationMeetings',
  },
  mwStartTime: {
    options: ['meetingTime'],
    rules: ['notEmpty'],
    type: 'time',
    group: 'congregationMeetings',
  },
  weDay: {
    rules: ['notEmpty'],
    type: 'list',
    list: 'days',
    group: 'congregationMeetings',
  },
  weStartTime: {
    options: ['meetingTime'],
    rules: ['notEmpty'],
    type: 'time',
    group: 'congregationMeetings',
  },
  coWeek: {
    options: ['coTuesdays'],
    type: 'date',
    group: 'congregationMeetings',
  },

  // Media Retrieval and Playback
  enableMediaDisplayButton: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
  },
  preferredOutput: {
    depends: 'enableMediaDisplayButton',
    type: 'list',
    list: 'screens',
    group: 'mediaRetrievalPlayback',
  },
  hideMediaLogo: {
    type: 'toggle',
    depends: 'enableMediaDisplayButton',
    group: 'mediaRetrievalPlayback',
  },
  maxRes: {
    type: 'list',
    list: 'resolutions',
    group: 'mediaRetrievalPlayback',
    depends: 'enableMediaDisplayButton',
  },
  excludeFootnotes: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
    depends: 'enableMediaDisplayButton',
  },
  excludeLffImages: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
    depends: 'enableMediaDisplayButton',
  },
  excludeTh: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
    depends: 'enableMediaDisplayButton',
  },
  includePrinted: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
    depends: 'enableMediaDisplayButton',
  },
  enableMusicButton: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
  },
  autoStartMusic: {
    depends: 'enableMusicButton',
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
  },
  enableMusicFadeOut: {
    depends: 'enableMusicButton',
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
  },
  musicVolume: {
    type: 'slider',
    depends: 'enableMusicButton',
    group: 'mediaRetrievalPlayback',
    max: 100,
    min: 0,
    step: 1,
  },
  enableSubtitles: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
  },
  langSubs: {
    type: 'list',
    depends: 'enableSubtitles',
    list: 'jwLanguages',
    group: 'mediaRetrievalPlayback',
  },
  jwlCompanionMode: {
    type: 'toggle',
    group: 'mediaRetrievalPlayback',
  },
  langFallback: {
    type: 'list',
    list: 'jwLanguages',
    group: 'mediaRetrievalPlayback',
  },

  // App
  localAppLang: {
    group: 'app',
    type: 'list',
    list: 'appLanguages',
  },
  darkMode: {
    group: 'app',
    type: 'list',
    list: 'darkModes',
  },
  autoRunAtBoot: {
    type: 'toggle',
    group: 'app',
  },

  // Integrations
  obsEnable: {
    type: 'toggle',
    group: 'integrations',
    actions: ['obsConnect'],
  },
  obsPort: {
    depends: 'obsEnable',
    type: 'text',
    group: 'integrations',
    actions: ['obsConnect'],
  },
  obsPassword: {
    depends: 'obsEnable',
    type: 'text',
    group: 'integrations',
    actions: ['obsConnect'],
  },
  obsCameraScene: {
    depends: 'obsEnable',
    type: 'list',
    list: 'obsAllScenes',
    group: 'integrations',
  },
  obsMediaScene: {
    depends: 'obsEnable',
    type: 'list',
    list: 'obsAllScenes',
    group: 'integrations',
  },
  obsImageScene: {
    depends: 'obsEnable',
    type: 'list',
    list: 'obsNonStageScenes',
    group: 'integrations',
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
  autoOpenFolderWhenDone: false,
  // autoPlayFirst: false,
  // autoPlayFirstTime: 5,
  // autoQuitWhenDone: false,
  autoRunAtBoot: false,
  autoStartMusic: true,
  // autoStartSync: false,
  // betaUpdates: false,
  congregationName: '',
  darkMode: 'auto',
  // disableAutoUpdate: false,
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
  jwlCompanionMode: false,
  includePrinted: true,
  // keepOriginalsAfterConversion: false,
  lang: 'E',
  localAppLang: 'en-US',
  maxRes: '720p',
  mediaWinShortcut: 'Alt+Z',
  // musicFadeOutTime: 60,
  // musicFadeOutType: 'smart',
  musicVolume: 100,
  obsEnable: false,
  obsPort: 4455,
  obsPassword: '',
  // outputFolderDateFormat: 'YYYY-MM-DD',
  // presentShortcut: 'Alt+D',
  // shuffleShortcut: 'Alt+K',
  // specialCong: false,
};

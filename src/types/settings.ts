export interface SettingsValues {
  // autoOpenFolderWhenDone: boolean;
  // autoPlayFirst: boolean;
  // autoPlayFirstTime: number;
  // autoQuitWhenDone: boolean;
  autoStartAtLogin: boolean;
  autoStartMusic: boolean;
  // autoStartSync: boolean;
  coWeek: string;
  // betaUpdates: boolean;
  congregationName: string;
  // disableAutoUpdate: boolean;
  darkMode: string;
  disableMediaFetching: boolean;
  // enablePp: boolean;
  enableExtraCache: boolean;
  enableKeyboardShortcuts: boolean;
  // disableHardwareAcceleration: boolean;
  enableMediaDisplayButton: boolean;
  // enableMp4Conversion: boolean;
  enableMusicButton: boolean;
  // enableMusicFadeOut: boolean;
  enableSubtitles: boolean;
  // enableVlcPlaylistCreation: boolean;
  excludeFootnotes: boolean;
  // excludeLffImages: boolean;
  excludeTh: boolean;
  hideMediaLogo: boolean;
  includePrinted: boolean;
  // keepOriginalsAfterConversion: boolean;
  lang: string;
  langFallback: string;
  // musicFadeOutTime: number;
  langSubtitles: string;
  localAppLang: string;
  maxRes: string;
  // musicFadeOutType: string;
  musicVolume: number;
  // mediaWinShortcut: string;
  mwDay: string;
  // specialCong: boolean;
  mwStartTime: string;
  obsCameraScene: string;
  obsEnable: boolean;
  obsImageScene: string;
  // outputFolderDateFormat: string;
  // presentShortcut: string;
  // shuffleShortcut: string;
  obsMediaScene: string;
  obsPassword: string;
  obsPort: string;
  shortcutMediaNext: string;
  shortcutMediaPrevious: string;
  shortcutMediaWindow: string;
  shortcutMusic: string;
  // [key: string]: unknown;
  weDay: string;
  weStartTime: string;
}

export interface SettingsItem {
  actions?: string[];
  depends?: string;
  group: string;
  icon?: string;
  list?: string;
  max?: number;
  min?: number;
  options?: string[];
  order?: number;
  rules?: string[];
  step?: number;
  type: string;
}

export type SettingsItems = {
  [key in keyof SettingsValues]: SettingsItem;
};

export interface SettingsGroups {
  [id: string]: SettingsGroup;
}

export interface ScreenPreferences {
  preferWindowed: boolean;
  preferredScreenNumber: number;
}

export interface SettingsGroup {
  description: string;
  hidden?: boolean;
  name: string;
  order?: number;
}

export type OldAppConfig = {
  __internal__: {
    migrations: {
      version: string;
    };
  };
  app: {
    autoOpenFolderWhenDone: boolean;
    autoQuitWhenDone: boolean;
    autoRunAtBoot: boolean;
    autoStartSync: boolean;
    betaUpdates: boolean;
    congregationName: string;
    customCachePath: null | string;
    disableAutoUpdate: boolean;
    disableHardwareAcceleration: boolean;
    localAppLang: string;
    localOutputPath: string;
    obs: {
      cameraScene: null | string;
      enable: boolean;
      imageScene: null | string;
      mediaScene: null | string;
      password: null | string;
      port: null | number;
      useV4: boolean;
      zoomScene: null | string;
    };
    offline: boolean;
    outputFolderDateFormat: string;
    theme: string;
    zoom: {
      autoRename: string[];
      autoStartMeeting: boolean;
      autoStartTime: number;
      enable: boolean;
      hideComponent: boolean;
      id: null | string;
      name: null | string;
      password: null | string;
      spotlight: boolean;
    };
  };
  cong: {
    dir: null | string;
    password: null | string;
    port: null | number;
    server: null | string;
    user: null | string;
  };
  media: {
    autoPlayFirst: boolean;
    autoPlayFirstTime: number;
    enableMediaDisplayButton: boolean;
    enableMp4Conversion: boolean;
    enablePp: boolean;
    enableSubtitles: boolean;
    enableVlcPlaylistCreation: boolean;
    excludeFootnotes: boolean;
    excludeLffImages: boolean;
    excludeTh: boolean;
    hideMediaLogo: boolean;
    hideWinAfterMedia: boolean;
    includePrinted: boolean;
    keepOriginalsAfterConversion: boolean;
    lang: string;
    langFallback: null | string;
    langSubs: null | string;
    langUpdatedLast: string;
    maxRes: string;
    mediaWinShortcut: string;
    ppBackward: null | string;
    ppForward: null | string;
    preferredOutput: string;
    presentShortcut: string;
  };
  meeting: {
    autoStartMusic: boolean;
    coWeek: null | string;
    enableMusicButton: boolean;
    enableMusicFadeOut: boolean;
    musicFadeOutTime: number;
    musicFadeOutType: string;
    musicVolume: number;
    mwDay: number;
    mwStartTime: string;
    shuffleShortcut: string;
    specialCong: boolean;
    weDay: number;
    weStartTime: string;
  };
};

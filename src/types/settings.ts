export interface SettingsValues {
  // autoOpenFolderWhenDone: boolean;
  // autoPlayFirst: boolean;
  // autoPlayFirstTime: number;
  // autoQuitWhenDone: boolean;
  autoRunAtBoot: boolean;
  autoStartMusic: boolean;
  // autoStartSync: boolean;
  coWeek: string;
  // betaUpdates: boolean;
  congregationName: string;
  // disableAutoUpdate: boolean;
  darkMode: string;
  // disableHardwareAcceleration: boolean;
  enableMediaDisplayButton: boolean;
  // enableMp4Conversion: boolean;
  enableMusicButton: boolean;
  enableMusicFadeOut: boolean;
  // enablePp: boolean;
  enableSubtitles: boolean;
  // enableVlcPlaylistCreation: boolean;
  excludeFootnotes: boolean;
  // excludeLffImages: boolean;
  excludeTh: boolean;
  hideMediaLogo: boolean;
  includePrinted: boolean;
  jwlCompanionMode: boolean;
  // keepOriginalsAfterConversion: boolean;
  lang: string;
  langFallback: string;
  // mediaWinShortcut: string;
  // musicFadeOutTime: number;
  langSubtitles: string;
  localAppLang: string;
  maxRes: string;
  // musicFadeOutType: string;
  musicVolume: number;
  mwDay: string;
  // outputFolderDateFormat: string;
  // presentShortcut: string;
  // shuffleShortcut: string;
  // specialCong: boolean;
  mwStartTime: string;
  obsCameraScene: string;
  obsEnable: boolean;
  obsImageScene: string;
  obsMediaScene: string;
  obsPassword: string;
  obsPort: string;
  preferredOutput: string;
  // [key: string]: unknown;
  weDay: string;
  weStartTime: string;
}

export interface SettingsItem {
  actions?: string[];
  depends?: string;
  group: string;
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

export interface SettingsGroup {
  description: string;
  hidden?: boolean;
  name: string;
  order?: number;
}

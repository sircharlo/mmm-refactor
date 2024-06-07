export interface SettingsValues {
  autoOpenFolderWhenDone: boolean;
  autoPlayFirst: boolean;
  autoPlayFirstTime: number;
  autoQuitWhenDone: boolean;
  autoRunAtBoot: boolean;
  autoStartMusic: boolean;
  autoStartSync: boolean;
  betaUpdates: boolean;
  congregationName?: string;
  darkMode: string;
  disableAutoUpdate: boolean;
  disableHardwareAcceleration: boolean;
  enableMediaDisplayButton: boolean;
  enableMp4Conversion: boolean;
  enableMusicButton: boolean;
  enableMusicFadeOut: boolean;
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
  localAppLang: string;
  maxRes: string;
  mediaWinShortcut: string;
  musicFadeOutTime: number;
  musicFadeOutType: string;
  musicVolume: number;
  obsEnable: boolean;
  obsPort: number;
  obsPassword: string;
  outputFolderDateFormat: string;
  presentShortcut: string;
  shuffleShortcut: string;
  specialCong: boolean;
  [key: string]: unknown;
}

export interface SettingsItem {
  group: string;
  subgroup?: string;
  name: string;
  type: string;
  list?: string;
  rules?: string[];
  options?: string[];
  order?: number;
  max?: number;
  min?: number;
  step?: number;
  actions?: string[];
}

export interface SettingsItems {
  [key: string]: SettingsItem;
}

export interface SettingsGroups {
  [id: string]: SettingsGroup;
}

export interface SettingsGroup {
  name: string;
  description?: string;
  order?: number;
  hidden?: boolean;
}

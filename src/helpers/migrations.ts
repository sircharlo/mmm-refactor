import { defaultSettings } from 'src/defaults/settings';
import { electronApi } from 'src/helpers/electron-api';
import { OldAppConfig, SettingsValues } from 'src/types/settings';
const { fs, getAppDataPath, klawSync, path } = electronApi;

const getOldVersionPath = () => {
  try {
    const oldVersionPath = path.join(getAppDataPath(), 'meeting-media-manager');
    return fs.existsSync(oldVersionPath) ? oldVersionPath : false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const oldPrefsFilterFn = (item: { path: string }) => {
  try {
    if (!item?.path) return false;
    const oldPrefsFilterFnBasename = path.basename(item.path);
    return (
      oldPrefsFilterFnBasename.startsWith('prefs') &&
      oldPrefsFilterFnBasename.endsWith('.json')
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};

const getOldPrefsPaths = (oldPath: string) => {
  try {
    if (!oldPath) return [];
    return klawSync(oldPath, { filter: oldPrefsFilterFn });
  } catch (error) {
    console.error(error);
    return [];
  }
};

const parsePrefsFile = (path: string) => {
  try {
    const content = fs.readFileSync(path, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(error);
    return {};
  }
};

const buildNewPrefsObject = (oldPrefs: OldAppConfig) => {
  try {
    const newPrefsObject: SettingsValues = {
      autoStartAtLogin: oldPrefs.app.autoRunAtBoot || false,
      autoStartMusic: oldPrefs.meeting.autoStartMusic || true,
      congregationName: oldPrefs.app.congregationName || '',
      coWeek: oldPrefs.meeting.coWeek || '',
      darkMode: 'auto',
      disableMediaFetching: oldPrefs.meeting.specialCong || false,
      enableExtraCache: true,
      enableKeyboardShortcuts:
        oldPrefs.media.mediaWinShortcut ||
        oldPrefs.media.ppBackward ||
        oldPrefs.media.ppForward ||
        // oldPrefs.media.presentShortcut ||
        oldPrefs.meeting.shuffleShortcut
          ? true
          : false,
      enableMediaDisplayButton: oldPrefs.media.enableMediaDisplayButton || true,
      enableMusicButton: oldPrefs.meeting.enableMusicButton || true,
      // enableMusicFadeOut: oldPrefs.meeting.enableMusicFadeOut || true,
      enableSubtitles: oldPrefs.media.enableSubtitles || false,
      excludeFootnotes: oldPrefs.media.excludeFootnotes || false,
      excludeTh: oldPrefs.media.excludeTh || true,
      hideMediaLogo: oldPrefs.media.hideMediaLogo || false,
      includePrinted: oldPrefs.media.includePrinted || true,
      lang: oldPrefs.media.lang || '',
      langFallback: oldPrefs.media.langFallback || '',
      langSubtitles: oldPrefs.media.langSubs || '',
      localAppLang: oldPrefs.app.localAppLang || 'en-US',
      maxRes: oldPrefs.media.maxRes || '720p',
      musicVolume: oldPrefs.meeting.musicVolume || 100,
      mwDay: oldPrefs.meeting.mwDay?.toString() || '',
      mwStartTime: oldPrefs.meeting.mwStartTime?.toString() || '',
      obsCameraScene: oldPrefs.app.obs.cameraScene || '',
      obsEnable: oldPrefs.app.obs.enable || false,
      obsImageScene: oldPrefs.app.obs.imageScene || '',
      obsMediaScene: oldPrefs.app.obs.mediaScene || '',
      obsPassword: oldPrefs.app.obs.password || '',
      obsPort: oldPrefs.app.obs.port?.toString() || '',
      // shortcutMediaNext: oldPrefs.media.ppForward || '',
      // shortcutMediaPrevious: oldPrefs.media.ppBackward || '',
      shortcutMediaWindow: oldPrefs.media.mediaWinShortcut || '',
      shortcutMusic: oldPrefs.meeting.shuffleShortcut || '',
      weDay: oldPrefs.meeting.weDay?.toString() || '',
      weStartTime: oldPrefs.meeting.weStartTime?.toString() || '',
    };
    return newPrefsObject;
  } catch (error) {
    console.error(error);
    return defaultSettings;
  }
};

export {
  buildNewPrefsObject,
  getOldPrefsPaths,
  getOldVersionPath,
  parsePrefsFile,
};

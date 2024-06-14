import { electronApi } from 'src/helpers/electron-api';
import { OldAppConfig, SettingsValues } from 'src/types/settings';
const { fs, getAppDataPath, klawSync, path } = electronApi;

const getOldVersionPath = () => {
  const oldVersionPath = path.join(getAppDataPath(), 'meeting-media-manager');
  return fs.existsSync(oldVersionPath) ? oldVersionPath : false;
};

const oldPrefsFilterFn = (item: { path: string }) => {
  const basename = path.basename(item.path);
  return basename.startsWith('prefs') && basename.endsWith('.json');
};

const getOldPrefsPaths = (oldPath: string) => {
  if (!oldPath) return [];
  return klawSync(oldPath, { filter: oldPrefsFilterFn });
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
  const newPrefsObject: SettingsValues = {
    autoRunAtBoot: oldPrefs.app.autoRunAtBoot || false,
    autoStartMusic: oldPrefs.meeting.autoStartMusic || true,
    coWeek: oldPrefs.meeting.coWeek || '',
    congregationName: oldPrefs.app.congregationName || '',
    darkMode: 'auto',
    enableMediaDisplayButton: oldPrefs.media.enableMediaDisplayButton || true,
    enableMusicButton: oldPrefs.meeting.enableMusicButton || true,
    enableMusicFadeOut: oldPrefs.meeting.enableMusicFadeOut || true,
    enableSubtitles: oldPrefs.media.enableSubtitles || false,
    excludeFootnotes: oldPrefs.media.excludeFootnotes || false,
    excludeTh: oldPrefs.media.excludeTh || true,
    hideMediaLogo: oldPrefs.media.hideMediaLogo || false,
    includePrinted: oldPrefs.media.includePrinted || true,
    jwlCompanionMode: false,
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
    preferredOutput: oldPrefs.media.preferredOutput || '',
    weDay: oldPrefs.meeting.weDay?.toString() || '',
    weStartTime: oldPrefs.meeting.weStartTime?.toString() || '',
  };
  return newPrefsObject;
};

export {
  buildNewPrefsObject,
  getOldPrefsPaths,
  getOldVersionPath,
  parsePrefsFile,
};

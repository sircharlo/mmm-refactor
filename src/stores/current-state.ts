import { defineStore, storeToRefs } from 'pinia';
import { useCongregationSettingsStore } from 'stores/congregation-settings';
import { settingsDefinitions } from '../defaults/settings';
import { date } from 'quasar';
import { electronApi } from '../helpers/electron-api';
const { path, getUserDataPath } = electronApi;

import { DateInfo } from 'src/types/dates';
import { SettingsValues } from 'src/types/settings';
import { DownloadedFile } from 'src/types/media';
import { useJwStore } from 'src/stores/jw';


export const useCurrentStateStore = defineStore('current-state', {
  state: () => {
    return {
      currentCongregation: '' as string,
      selectedDate: date.formatDate(new Date(), 'YYYY/MM/DD') as string,
      lookupPeriod: [] as DateInfo[],
      mediaPlayer: {
        action: '',
        // duration: 0,
        currentPosition: 0,
        seekTo: 0,
        url: '',
        uniqueId: '',
        scale: 1,
        x: 0,
        y: 0,
        windowVisible: true,
      },
      downloads: new Map<string, Promise<DownloadedFile>>(),
      downloadProgress: {} as {
        [key: string]: {
          loaded: number,
          total: number,
          complete: boolean,
        }
      },
    };
  },

  getters: {
    getDatedAdditionalMediaDirectory(state) {
      if (!state.selectedDate) return '';
      const dateString = date.formatDate(new Date(state.selectedDate), 'YYYYMMDD');
      return path.join(getUserDataPath(), 'Additional Media', state.currentCongregation, dateString);
    },
    selectedDateObject(state) {
      if (state.lookupPeriod.length === 0) return {} as DateInfo
      return state.lookupPeriod.find(day => date.getDateDiff(day.date, state.selectedDate, 'days') === 0) || state.lookupPeriod[0]
    },
    nonCompleteItems(state) {
      return Object.fromEntries(Object.entries(state.downloadProgress).filter(([, value]) => !value.complete));
    },
    totalDownloadProgress(state) {
      const downloadProgressArray = Object.values(state.downloadProgress);
      const totals = downloadProgressArray.reduce(
        (acc, { loaded, total }) => {
          acc.totalLoaded += loaded;
          acc.totalTotal += total;
          return acc;
        },
        { totalLoaded: 0, totalTotal: 0 }
      );
      const percentage = totals.totalTotal !== 0 ? (totals.totalLoaded / totals.totalTotal) * 100 : 0;
      return {
        totalFirst: totals.totalLoaded,
        totalSecond: totals.totalTotal,
        percentage,
      };
    },
    congregationIsSelected(state) {
      return state.currentCongregation;
    },
    currentSettings(state) {
      const { congregations } = storeToRefs(useCongregationSettingsStore());
      return Object.keys(congregations).length > 0
        ? congregations.value[state.currentCongregation]
        : ({} as SettingsValues);
    },
    currentSongss(state) {
      const { congregations } = storeToRefs(useCongregationSettingsStore());
      return Object.keys(congregations).length > 0
        ? congregations.value[state.currentCongregation]
        : ({} as SettingsValues);
    },
    mediaPlaying(state) {
      return state.mediaPlayer.url !== '';
    },
    currentSongbook() {
      const notSignLanguageSongbook = { signLanguage: false, pub: 'sjjm', fileformat: 'mp3' }
      const signLanguageSongbook = { signLanguage: true, pub: 'sjj', fileformat: 'mp4' }
      const jwStore = useJwStore();
      const { jwLanguages } = storeToRefs(jwStore);
      const currentLanguage = this.currentSettings?.lang as string;
      if (!currentLanguage || !jwLanguages.value) return notSignLanguageSongbook;
      const currentLanguageIsSignLanguage = !!jwLanguages.value.list.find(
        (l) => l.langcode === currentLanguage
      )?.isSignLanguage;
      return currentLanguageIsSignLanguage ? signLanguageSongbook : notSignLanguageSongbook
    },
    currentSongs() {
      const jwStore = useJwStore();
      const { jwSongs } = storeToRefs(jwStore);
      const currentLanguage = this.currentSettings?.lang as string;
      if (!currentLanguage) return [];
      return jwSongs.value[currentLanguage]?.list || [];
    },
  },

  actions: {
    removeCompletedDownloadProgress() {
      this.downloadProgress = Object.fromEntries(
        Object.entries(this.downloadProgress).filter(([, value]) => !value.complete)
      );
    },
    setCongregation(value: string | number) {
      this.currentCongregation = value.toString();
      return this.getInvalidSettings(this.currentCongregation).length > 0;
    },
    getInvalidSettings(congregation?: string | number) {
      if (!congregation) congregation = this.currentCongregation;
      if (!congregation) return [];
      this.currentCongregation;
      const invalidSettings = [];
      for (const [settingsDefinitionId, settingsDefinition] of Object.entries(
        settingsDefinitions
      )) {
        if (settingsDefinition.rules?.includes('notEmpty')) {
          if (!this.getSettingValue(settingsDefinitionId, congregation)) {
            invalidSettings.push(settingsDefinitionId);
          }
        }
      }
      return invalidSettings;
    },
    invalidSettings(congregation?: string | number) {
      if (!congregation) congregation = this.currentCongregation;
      return this.getInvalidSettings(congregation).length > 0;
    },
    getSettingValue(id: string, congregation?: string | number) {
      const { congregations } = storeToRefs(useCongregationSettingsStore());
      if (!congregation) congregation = this.currentCongregation;
      if (!congregation) return null;
      return congregations.value[congregation][id];
    },
  },
});

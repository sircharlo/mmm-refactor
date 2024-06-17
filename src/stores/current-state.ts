import { defineStore, storeToRefs } from 'pinia';
import { date } from 'quasar';
import { settingsDefinitions } from 'src/defaults/settings';
import { electronApi } from 'src/helpers/electron-api';
import { useCongregationSettingsStore } from 'src/stores/congregation-settings';
import { useJwStore } from 'src/stores/jw';
import { DateInfo } from 'src/types/dates';
import { DownloadProgressItems, DownloadedFile } from 'src/types/media';
import { SettingsValues } from 'src/types/settings';

const { getUserDataPath, path } = electronApi;

export const useCurrentStateStore = defineStore('current-state', {
  actions: {
    getInvalidSettings(congregation?: number | string) {
      if (!congregation) congregation = this.currentCongregation;
      if (!congregation) return [];
      this.currentCongregation;
      const invalidSettings = [];
      for (const [settingsDefinitionId, settingsDefinition] of Object.entries(
        settingsDefinitions,
      )) {
        if (settingsDefinition.rules?.includes('notEmpty')) {
          if (
            !this.getSettingValue(
              settingsDefinitionId as keyof SettingsValues,
              congregation,
            )
          ) {
            invalidSettings.push(settingsDefinitionId);
          }
        }
      }
      return invalidSettings as (keyof SettingsValues)[];
    },
    getSettingValue(id: keyof SettingsValues, congregation?: number | string) {
      const congregationSettingsStore = useCongregationSettingsStore();
      const congregations = congregationSettingsStore.congregations;
      if (!congregation) congregation = this.currentCongregation;
      if (!congregation) return null;
      return congregations[congregation][id];
    },
    invalidSettings(congregation?: number | string) {
      if (!congregation) congregation = this.currentCongregation;
      return this.getInvalidSettings(congregation).length > 0;
    },
    removeCompletedDownloadProgress() {
      this.downloadProgress = Object.fromEntries(
        Object.entries(this.downloadProgress).filter(
          ([, value]) => !value.complete,
        ),
      );
    },
    setCongregation(value: number | string) {
      this.currentCongregation = value.toString();
      return this.getInvalidSettings(this.currentCongregation).length > 0;
    },
  },

  getters: {
    congregationIsSelected(state) {
      return state.currentCongregation;
    },
    currentSettings(state) {
      const congregationSettingsStore = useCongregationSettingsStore();
      const congregations = congregationSettingsStore.congregations;
      return Object.keys(congregations).length > 0
        ? congregations[state.currentCongregation]
        : ({} as SettingsValues);
    },
    currentSongbook() {
      const notSignLanguageSongbook = {
        fileformat: 'mp3',
        pub: 'sjjm',
        signLanguage: false,
      };
      const signLanguageSongbook = {
        fileformat: 'mp4',
        pub: 'sjj',
        signLanguage: true,
      };
      const jwStore = useJwStore();
      const { jwLanguages } = storeToRefs(jwStore);
      const currentLanguage = this.currentSettings?.lang as string;
      if (!currentLanguage || !jwLanguages.value)
        return notSignLanguageSongbook;
      const currentLanguageIsSignLanguage = !!jwLanguages.value.list.find(
        (l) => l.langcode === currentLanguage,
      )?.isSignLanguage;
      return currentLanguageIsSignLanguage
        ? signLanguageSongbook
        : notSignLanguageSongbook;
    },
    currentSongs() {
      const jwStore = useJwStore();
      const { jwSongs } = storeToRefs(jwStore);
      const currentLanguage = this.currentSettings?.lang as string;
      if (!currentLanguage) return [];
      return jwSongs.value[currentLanguage]?.list || [];
    },
    getDatedAdditionalMediaDirectory(state) {
      if (!state.selectedDate) return '';
      const dateString = date.formatDate(
        new Date(state.selectedDate),
        'YYYYMMDD',
      );
      return path.join(
        getUserDataPath(),
        'Additional Media',
        state.currentCongregation,
        dateString,
      );
    },
    mediaPaused(state) {
      return (
        state.mediaPlayer.url !== '' && state.mediaPlayer.action === 'pause'
      );
    },
    mediaPlaying(state) {
      return state.mediaPlayer.url !== '';
    },
    selectedDateObject(state) {
      if (state.lookupPeriod.length === 0) return {} as DateInfo;
      return (
        state.lookupPeriod.find(
          (day) => date.getDateDiff(day.date, state.selectedDate, 'days') === 0,
        ) || state.lookupPeriod[0]
      );
    },
  },

  state: () => {
    return {
      currentCongregation: '' as string,
      downloadProgress: {} as DownloadProgressItems,
      downloads: {} as {
        [key: string]: DownloadedFile | Promise<DownloadedFile>;
      },
      lookupPeriod: [] as DateInfo[],
      mediaPlayer: {
        action: '',
        // duration: 0,
        currentPosition: 0,
        scale: 1,
        seekTo: 0,
        subtitlesUrl: '',
        subtitlesVisible: false,
        uniqueId: '',
        url: '',
        windowVisible: true,
        x: 0,
        y: 0,
      },
      onlyShowInvalid: false,
      selectedDate: date.formatDate(new Date(), 'YYYY/MM/DD') as string,
    };
  },
});

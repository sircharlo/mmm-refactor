import { defineStore, storeToRefs } from 'pinia';
import { date } from 'quasar';
import { settingsDefinitions } from 'src/defaults/settings';
import { electronApi } from 'src/helpers/electron-api';
import { getAdditionalMediaPath } from 'src/helpers/fs';
import { useCongregationSettingsStore } from 'src/stores/congregation-settings';
import { useJwStore } from 'src/stores/jw';
import { DateInfo } from 'src/types/dates';
import { DownloadedFile, DownloadProgressItems } from 'src/types/media';
import { SettingsValues } from 'src/types/settings';

const { fs, path } = electronApi;

export const useCurrentStateStore = defineStore('current-state', {
  actions: {
    getInvalidSettings(congregation?: number | string) {
      try {
        if (!congregation) congregation = this.currentCongregation;
        if (!congregation) return [];
        this.currentCongregation;
        const invalidSettings = [];
        for (const [settingsDefinitionId, settingsDefinition] of Object.entries(
          settingsDefinitions,
        )) {
          if (settingsDefinition.rules?.includes('notEmpty')) {
            const congregationSettingsStore = useCongregationSettingsStore();
            const { congregations } = storeToRefs(congregationSettingsStore);
            if (
              !congregations.value[congregation][
                settingsDefinitionId as keyof SettingsValues
              ]
            ) {
              invalidSettings.push(settingsDefinitionId);
            }
          }
        }
        return invalidSettings as (keyof SettingsValues)[];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    invalidSettings(congregation?: number | string) {
      if (!congregation) congregation = this.currentCongregation;
      if (!congregation) return false;
      return this.getInvalidSettings(congregation).length > 0;
    },
    setCongregation(value: number | string) {
      if (!value) return false;
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
      const { congregations } = storeToRefs(congregationSettingsStore);
      return Object.keys(congregations).length > 0
        ? congregations.value[state.currentCongregation]
        : ({} as SettingsValues);
    },
    currentSongbook() {
      const notSignLanguageSongbook = {
        fileformat: 'mp3',
        pub: 'sjjm',
        signLanguage: false,
      };
      try {
        const signLanguageSongbook = {
          fileformat: 'mp4',
          pub: 'sjj',
          signLanguage: true,
        };
        const jwStore = useJwStore();
        const { jwLanguages } = storeToRefs(jwStore);
        const currentLanguage = this.currentSettings?.lang as string;
        if (!currentLanguage || !jwLanguages.value)
          throw new Error('No language');
        const currentLanguageIsSignLanguage = !!jwLanguages.value.list.find(
          (l) => l.langcode === currentLanguage,
        )?.isSignLanguage;
        return currentLanguageIsSignLanguage
          ? signLanguageSongbook
          : notSignLanguageSongbook;
      } catch (error) {
        console.error(error);
        return notSignLanguageSongbook;
      }
    },
    currentSongs() {
      const jwStore = useJwStore();
      const { jwSongs } = storeToRefs(jwStore);
      const currentLanguage = this.currentSettings?.lang as string;
      console.log(currentLanguage, jwSongs.value[currentLanguage]);
      if (!currentLanguage) return [];
      return jwSongs.value[currentLanguage]?.list || [];
    },
    getDatedAdditionalMediaDirectory(state) {
      try {
        if (!state.selectedDate) return '';
        const additionalMediaPath = getAdditionalMediaPath();
        const dateString = date.formatDate(
          new Date(state.selectedDate),
          'YYYYMMDD',
        );
        const datedAdditionalMediaDirectory = path.join(
          additionalMediaPath,
          state.currentCongregation,
          dateString,
        );
        fs.ensureDirSync(datedAdditionalMediaDirectory);
        return datedAdditionalMediaDirectory;
      } catch (error) {
        console.error(error);
        return '';
      }
    },
    mediaPaused(state) {
      return (
        state.mediaPlayingUrl !== '' && state.mediaPlayingAction === 'pause'
      );
    },
    mediaPlaying(state) {
      return state.mediaPlayingUrl !== '';
    },
    selectedDateObject(state) {
      const jwStore = useJwStore();
      const { lookupPeriod } = storeToRefs(jwStore);
      if (!lookupPeriod.value?.[state.currentCongregation]?.length)
        return {} as DateInfo;
      return (lookupPeriod.value?.[state.currentCongregation]?.find(
        (day) => date.getDateDiff(day.date, state.selectedDate, 'days') === 0,
      ) || lookupPeriod.value[0]) as DateInfo;
    },
  },
  state: () => {
    return {
      currentCongregation: '' as string,
      downloadedFiles: {} as {
        [key: string]: DownloadedFile | Promise<DownloadedFile>;
      },
      downloadProgress: {} as DownloadProgressItems,
      extractedFiles: {} as {
        [key: string]: Promise<string>;
      },
      mediaPlayingAction: '',
      mediaPlayingCurrentPosition: 0,
      mediaPlayingPanzoom: { scale: 1, x: 0, y: 0 },
      mediaPlayingSeekTo: 0,
      mediaPlayingSubtitlesUrl: '',
      mediaPlayingSubtitlesVisible: false,
      mediaPlayingUniqueId: '',
      mediaPlayingUrl: '',
      mediaWindowCustomBackground: '',
      mediaWindowVisible: true,
      online: true,
      onlyShowInvalidSettings: false,
      selectedDate: date.formatDate(new Date(), 'YYYY/MM/DD') as string,
    };
  },
});

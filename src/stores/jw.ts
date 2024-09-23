import { getLanguages, getYeartext } from 'boot/axios';
import { defineStore, storeToRefs } from 'pinia';
import { LocalStorage } from 'quasar';
import { date } from 'quasar';
import { errorCatcher } from 'src/helpers/error-catcher';
import { findBestResolution, getPubMediaLinks } from 'src/helpers/jw-media';
import { useCurrentStateStore } from 'src/stores/current-state';
import { DateInfo } from 'src/types/dates';
import { jwLanguage } from 'src/types/languages';
import { DynamicMediaObject } from 'src/types/media';
import { MediaLink, PublicationFetcher } from 'src/types/publications';

export const MAX_SONGS = 500;

export function uniqueById<T extends { uniqueId: string }>(array: T[]): T[] {
  return array.reduce((unique: T[], o: T) => {
    if (!unique.some((obj) => obj.uniqueId === o.uniqueId)) {
      unique.push(o);
    }
    return unique;
  }, []);
}

const oldDate = new Date(0);

export const useJwStore = defineStore('jw-store', {
  actions: {
    addToAdditionMediaMap(mediaArray: DynamicMediaObject[]) {
      try {
        if (!mediaArray.length) return;
        const currentState = useCurrentStateStore();
        if (!this.additionalMediaMaps[currentState.currentCongregation])
          this.additionalMediaMaps[currentState.currentCongregation] = {};
        if (
          !this.additionalMediaMaps[currentState.currentCongregation][
            currentState.selectedDate
          ]
        )
          this.additionalMediaMaps[currentState.currentCongregation][
            currentState.selectedDate
          ] = [];
        const currentArray =
          this.additionalMediaMaps[currentState.currentCongregation][
            currentState.selectedDate
          ];
        this.additionalMediaMaps[currentState.currentCongregation][
          currentState.selectedDate
        ] = uniqueById([...currentArray, ...mediaArray]);
      } catch (e) {
        errorCatcher(e);
      }
    },
    removeFromAdditionMediaMap(uniqueId: string) {
      try {
        const currentState = useCurrentStateStore();
        if (
          uniqueId &&
          currentState.currentCongregation &&
          currentState.selectedDate &&
          this.additionalMediaMaps[currentState.currentCongregation] &&
          this.additionalMediaMaps[currentState.currentCongregation][
            currentState.selectedDate
          ]
        ) {
          const currentArray =
            this.additionalMediaMaps[currentState.currentCongregation][
              currentState.selectedDate
            ];
          this.additionalMediaMaps[currentState.currentCongregation][
            currentState.selectedDate
          ] = uniqueById(
            currentArray.filter((media) => media.uniqueId !== uniqueId),
          );
        }
      } catch (e) {
        errorCatcher(e);
      }
    },
    resetSort() {
      try {
        const currentState = useCurrentStateStore();
        const { currentCongregation, selectedDate, selectedDateObject } =
          storeToRefs(currentState);
        if (
          currentCongregation.value &&
          selectedDate.value &&
          this.mediaSort[currentCongregation.value]
        ) {
          this.mediaSort[currentCongregation.value][selectedDate.value] = [];
        }
        (selectedDateObject.value?.dynamicMedia ?? [])
          .filter((item) => item.sectionOriginal)
          .filter((item) => item.section !== item.sectionOriginal)
          .forEach((item) => {
            item.section = item.sectionOriginal;
          });
      } catch (e) {
        errorCatcher(e);
      }
    },
    async updateJwLanguages() {
      try {
        const now = new Date();
        const monthsSinceUpdated = date.getDateDiff(
          now,
          this.jwLanguages.updated,
          'months',
        );
        if (monthsSinceUpdated > 3 || !this.jwLanguages?.list?.length) {
          this.jwLanguages = {
            list: await getLanguages(),
            updated: now,
          };
        }
      } catch (e) {
        errorCatcher(e);
      }
    },
    async updateJwSongs() {
      try {
        const currentState = useCurrentStateStore();
        if (
          !currentState.currentSettings?.lang ||
          !currentState.currentSongbook?.pub
        ) {
          errorCatcher('No current settings or songbook defined');
          return [];
        }
        const langwritten = currentState.currentSettings.lang as string;
        const songbook = {
          langwritten,
          pub: currentState.currentSongbook.pub,
        } as PublicationFetcher;
        const pubMediaLinks = await getPubMediaLinks(songbook);
        if (!pubMediaLinks) {
          return [];
        }
        songbook.fileformat = Object.keys(
          pubMediaLinks.files[songbook.langwritten],
        )
          .sort()
          .pop();
        if (!songbook.fileformat) {
          errorCatcher('No fileformat defined');
          return [];
        }
        const now = new Date();
        if (!this.jwSongs[langwritten]) {
          this.jwSongs[langwritten] = {
            list: [],
            updated: oldDate,
          };
        }
        const monthsSinceUpdated = date.getDateDiff(
          now,
          this.jwSongs[langwritten].updated,
          'months',
        );
        if (monthsSinceUpdated > 1) {
          const mediaItemLinks = (
            pubMediaLinks.files[songbook.langwritten][
              songbook.fileformat
            ] as MediaLink[]
          ).filter((mediaLink: MediaLink) => mediaLink.track < MAX_SONGS);
          const filteredMediaItemLinks = [] as MediaLink[];
          for (const mediaItemLink of mediaItemLinks) {
            const currentTrack = mediaItemLink.track;
            if (!filteredMediaItemLinks.some((m) => m.track === currentTrack)) {
              const bestItem = findBestResolution(
                mediaItemLinks.filter((m) => m.track === currentTrack),
              ) as MediaLink;
              if (bestItem) filteredMediaItemLinks.push(bestItem);
            }
          }
          this.jwSongs[langwritten] = {
            list: filteredMediaItemLinks,
            updated: now,
          };
        }
      } catch (error) {
        errorCatcher(error);
      }
    },
    async updateYeartext(lang?: string) {
      try {
        const currentState = useCurrentStateStore();
        const currentLang =
          (currentState.currentSettings.lang as string) || (lang as string);
        if (!currentLang) return;
        const currentYear = new Date().getFullYear();
        if (!this.yeartexts[currentYear]) {
          this.yeartexts[currentYear] = {};
        }
        if (currentLang && !this.yeartexts[currentYear][currentLang]) {
          const yeartextRequest = await getYeartext(currentLang, currentYear);
          if (yeartextRequest?.content) {
            this.yeartexts[currentYear][currentLang] = yeartextRequest.content;
          }
        }
      } catch (error) {
        errorCatcher(error);
      }
    },
  },
  state: () => {
    return {
      additionalMediaMaps: (LocalStorage.getItem('additionalMediaMaps') ||
        {}) as Record<string, Record<string, DynamicMediaObject[]>>,
      customDurations: (LocalStorage.getItem('customDurations') || {}) as {
        [key: string]: {
          [key: string]: {
            [key: string]: { max: number; min: number };
          };
        };
      },
      jwLanguages: (LocalStorage.getItem('jwLanguages') || {
        list: [],
        updated: oldDate,
      }) as { list: jwLanguage[]; updated: Date },
      jwSongs: (LocalStorage.getItem('jwSongs') || {}) as {
        [lang: string]: {
          list: MediaLink[];
          updated: Date;
        };
      },
      lookupPeriod: (LocalStorage.getItem('lookupPeriod') || {}) as Record<
        string,
        DateInfo[]
      >,
      mediaSort: (LocalStorage.getItem('mediaSort') || {}) as {
        [key: string]: {
          [key: string]: string[];
        };
      },
      yeartexts: (LocalStorage.getItem('yeartexts') || {}) as {
        [year: number]: { [langcode: string]: string };
      },
    };
  },
});

import { getLanguages, getYeartext } from 'boot/axios';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { date } from 'quasar';
import { findBestResolution, getPubMediaLinks } from 'src/helpers/jw-media';
import { useCurrentStateStore } from 'src/stores/current-state';
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
    },
    removeFromAdditionMediaMap(uniqueId: string) {
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
    },
    resetSort() {
      const currentState = useCurrentStateStore();
      if (
        currentState.currentCongregation &&
        currentState.selectedDate &&
        this.mediaSort[currentState.currentCongregation]
      ) {
        this.mediaSort[currentState.currentCongregation][
          currentState.selectedDate
        ] = [];
      }
    },
    async updateJwLanguages() {
      const now = new Date();
      const monthsSinceUpdated = date.getDateDiff(
        now,
        this.jwLanguages.updated,
        'months',
      );
      if (monthsSinceUpdated > 3) {
        this.jwLanguages = {
          list: await getLanguages(),
          updated: now,
        };
      }
    },
    async updateJwSongs() {
      try {
        const currentState = useCurrentStateStore();
        if (
          !currentState.currentSettings?.lang ||
          !currentState.currentSongbook?.pub
        ) {
          console.error('No current settings or songbook defined');
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
          console.error('No fileformat defined');
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
          const mediaItemLinks: MediaLink[] = pubMediaLinks.files[
            songbook.langwritten
          ][songbook.fileformat].filter(
            (mediaLink: MediaLink) => mediaLink.track < MAX_SONGS,
          );
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
        console.error(error);
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
        console.error(error);
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

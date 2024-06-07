import { defineStore, storeToRefs } from 'pinia';
import { jwLanguage } from '../types/languages';
import { LocalStorage } from 'quasar';
import { getLanguages, getYeartext } from 'boot/axios';
import { date } from 'quasar';
import { useCurrentStateStore } from 'src/stores/current-state';
import { findBestResolution, getPubMediaLinks } from 'src/helpers/jw-media';
import { MediaLink, PublicationFetcher } from 'src/types/publications';
import { DynamicMediaObject } from 'src/types/media';
const currentState = useCurrentStateStore();
const { currentSettings, currentSongbook, currentCongregation, selectedDate } = storeToRefs(currentState);

export const MAX_SONGS = 500;

export function uniqueById<T extends { uniqueId: string }>(array: T[]): T[] {
  return array.reduce((unique: T[], o: T) => {
    if (!unique.some(obj => obj.uniqueId === o.uniqueId)) {
      unique.push(o);
    }
    return unique;
  }, []);
}

const oldDate = new Date(0);

export const useJwStore = defineStore('jw-store', {
  state: () => {
    return {
      jwLanguages: (LocalStorage.getItem('jwLanguages') || {
        updated: oldDate,
        list: [],
      }) as { updated: Date; list: jwLanguage[] },
      jwSongs: (LocalStorage.getItem('jwSongs') || {
      }) as {
        [lang: string]: {
          updated: Date,
          list: MediaLink[],
        }
      },
      yeartexts: (LocalStorage.getItem('yeartexts') || {}) as {
        [year: number]: { [langcode: string]: string };
      },
      mediaSort: (LocalStorage.getItem('mediaSort') || {}) as {
        [key: string]: {
          [key: string]: string[];
        },
      },
      customDurations: (LocalStorage.getItem('customDurations') || {}) as {
        [key: string]: {
          [key: string]: {
            [key: string]: { max: number, min: number }
          };
        },
      },
      additionalMediaMaps: (LocalStorage.getItem('additionalMediaMaps') || {}) as Record<string, Record<string, DynamicMediaObject[]>>,
    };
  },
  actions: {
    addToAdditionMediaMap(mediaArray: DynamicMediaObject[]) {
      if (!this.additionalMediaMaps[currentCongregation.value]) this.additionalMediaMaps[currentCongregation.value] = {}
      if (!this.additionalMediaMaps[currentCongregation.value][selectedDate.value]) this.additionalMediaMaps[currentCongregation.value][selectedDate.value] = []
      const currentArray = this.additionalMediaMaps[currentCongregation.value][selectedDate.value]
      this.additionalMediaMaps[currentCongregation.value][selectedDate.value] = uniqueById([...currentArray, ...mediaArray])
    },
    removeFromAdditionMediaMap(uniqueId: string) {
      if (currentCongregation.value && selectedDate.value && this.additionalMediaMaps[currentCongregation.value] && this.additionalMediaMaps[currentCongregation.value][selectedDate.value]) {
        const currentArray = this.additionalMediaMaps[currentCongregation.value][selectedDate.value]
        this.additionalMediaMaps[currentCongregation.value][selectedDate.value] = uniqueById(currentArray.filter((media) => media.uniqueId !== uniqueId))
      }
    },
    resetSort() {
      if (currentCongregation.value && selectedDate.value && this.mediaSort[currentCongregation.value]) {
        this.mediaSort[currentCongregation.value][selectedDate.value] = []
      }
    },
    async updateJwLanguages() {
      const now = new Date();
      const monthsSinceUpdated = date.getDateDiff(
        now,
        this.jwLanguages.updated,
        'months'
      );
      if (monthsSinceUpdated > 3) {
        this.jwLanguages = {
          updated: now,
          list: await getLanguages(),
        };
      }
    },
    async updateJwSongs() {
      try {
        if (!currentSettings.value?.lang || !currentSongbook.value?.pub) {
          console.error('No current settings or songbook defined');
          return []
        }
        const langwritten = currentSettings.value.lang as string
        const songbook = {
          pub: currentSongbook.value.pub,
          langwritten,
        } as PublicationFetcher
        const pubMediaLinks = await getPubMediaLinks(songbook)
        songbook.fileformat = Object.keys(pubMediaLinks.files[songbook.langwritten])
          .sort()
          .pop();
        if (!songbook.fileformat) {
          console.error('No fileformat defined');
          return []
        }
        const now = new Date();
        if (!this.jwSongs[langwritten]) {
          this.jwSongs[langwritten] = {
            updated: oldDate,
            list: [],
          }
        }
        const monthsSinceUpdated = date.getDateDiff(
          now,
          this.jwSongs[langwritten].updated,
          'months'
        );
        if (monthsSinceUpdated > 1) {
          const mediaItemLinks: MediaLink[] =
            (pubMediaLinks.files[songbook.langwritten][songbook.fileformat]).filter(
              (mediaLink: MediaLink) =>
                mediaLink.track < MAX_SONGS
            );
          const filteredMediaItemLinks = [] as MediaLink[]
          for (const mediaItemLink of mediaItemLinks) {
            const currentTrack = mediaItemLink.track
            if (!filteredMediaItemLinks.some(m => m.track === currentTrack)) {
              const bestItem = findBestResolution(mediaItemLinks.filter(m => m.track === currentTrack));
              if (bestItem) filteredMediaItemLinks.push(bestItem)
            }
          }
          this.jwSongs[langwritten] = {
            updated: now,
            list: filteredMediaItemLinks,
          };
        }
      } catch (error) {
        console.error(error)
      }
    },
    async updateYeartext(lang?: string) {
      if (!(currentSettings.value?.lang || lang)) {
        return;
      }
      const currentLang = currentSettings.value.lang as string || lang as string;
      const currentYear = new Date().getFullYear();
      if (!this.yeartexts[currentYear]) {
        this.yeartexts[currentYear] = {}
      }
      if (currentLang && !this.yeartexts[currentYear][currentLang]) {
        const yeartextRequest = await getYeartext(currentLang, currentYear);
        if (yeartextRequest?.content) {
          this.yeartexts[currentYear][currentLang] = yeartextRequest.content
        }
      }
    },
  },
});

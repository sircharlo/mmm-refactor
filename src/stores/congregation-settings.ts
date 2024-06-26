import { defineStore } from 'pinia';
import { LocalStorage, uid } from 'quasar';
import { defaultSettings } from 'src/defaults/settings';
import { SettingsValues } from 'src/types/settings';

export const useCongregationSettingsStore = defineStore(
  'congregation-settings',
  {
    actions: {
      createCongregation() {
        const newId = uid();
        this.congregations[newId] = defaultSettings;
        return newId;
      },
      deleteCongregation(id: number | string) {
        if (!id) return;
        delete this.congregations[id];
      },
    },
    getters: {
      congregationCount(state) {
        return Object.keys(state.congregations)?.length;
      },
    },

    state: () => {
      return {
        congregations: (LocalStorage.getItem('congregations') || {}) as {
          [key: string]: SettingsValues;
        },
      };
    },
  },
);

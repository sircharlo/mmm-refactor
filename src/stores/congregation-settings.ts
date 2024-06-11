import { defineStore } from 'pinia';
import { LocalStorage, uid } from 'quasar';

import { defaultSettings } from '../defaults/settings';
import { SettingsValues } from '../types/settings';

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
        delete this.congregations[id];
      },
    },
    getters: {
      congregationCount(state) {
        return Object.keys(state.congregations).length;
      },
    },

    state: () => {
      return {
        congregations: (LocalStorage.getItem('congregations') || {}) as { [key: string]: SettingsValues },
      };
    },
  }
);

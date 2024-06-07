import { defineStore } from 'pinia';
import { SettingsValues } from '../types/settings';
import { defaultSettings } from '../defaults/settings';
import { LocalStorage, uid } from 'quasar';

export const useCongregationSettingsStore = defineStore(
  'congregation-settings',
  {
    state: () => {
      return {
        congregations: (LocalStorage.getItem('congregations') || {}) as { [key: string]: SettingsValues },
      };
    },
    getters: {
      congregationCount(state) {
        return Object.keys(state.congregations).length;
      },
    },

    actions: {
      createCongregation() {
        const newId = uid();
        this.congregations[newId] = defaultSettings;
        return newId;
      },
      deleteCongregation(id: string | number) {
        delete this.congregations[id];
      },
    },
  }
);

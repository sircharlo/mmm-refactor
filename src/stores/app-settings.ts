import { defineStore, storeToRefs } from 'pinia';
import { LocalStorage, uid } from 'quasar';
import {
  buildNewPrefsObject,
  getOldPrefsPaths,
  getOldVersionPath,
  parsePrefsFile,
} from 'src/helpers/migrations';
import { useCongregationSettingsStore } from 'src/stores/congregation-settings';
import { OldAppConfig, ScreenPreferences } from 'src/types/settings';

export const useAppSettingsStore = defineStore('app-settings', {
  actions: {
    runMigration(type?: string) {
      try {
        const { congregations } = storeToRefs(useCongregationSettingsStore());
        if (!type) return false;
        if (type === 'firstRun') {
          const oldVersionPath = getOldVersionPath();
          if (!oldVersionPath) return false;
          const oldPrefsPaths = getOldPrefsPaths(oldVersionPath);
          for (const oldPrefsPath of oldPrefsPaths) {
            try {
              const oldPrefs: OldAppConfig = parsePrefsFile(oldPrefsPath.path);
              const newPrefsObject = buildNewPrefsObject(oldPrefs);
              const newCongId = uid();
              congregations.value[newCongId] = newPrefsObject;
            } catch (error) {
              console.error(error);
            }
          }
        } else {
          // future migrations will go here
        }
        this.migrations.push(type);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  getters: {},

  state: () => {
    return {
      migrations: (LocalStorage.getItem('migrations') || []) as string[],
      screenPreferences: (LocalStorage.getItem('screenPreferences') ||
        {}) as ScreenPreferences,
    };
  },
});

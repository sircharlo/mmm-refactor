import { defineStore } from 'pinia';
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
        if (!type) return [];
        if (type === 'firstRun') {
          const oldVersionPath = getOldVersionPath();
          if (oldVersionPath) {
            const oldPrefsPaths = getOldPrefsPaths(oldVersionPath);
            for (const oldPrefsPath of oldPrefsPaths) {
              const oldPrefs: OldAppConfig = parsePrefsFile(oldPrefsPath.path);
              const newPrefsObject = buildNewPrefsObject(oldPrefs);
              const newCongId = uid();
              useCongregationSettingsStore().congregations[newCongId] =
                newPrefsObject;
            }
          }
        } else {
          // future migrations will go here
        }
        this.migrations.push(type);
        return [type];
      } catch (error) {
        console.error(error);
        return [];
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

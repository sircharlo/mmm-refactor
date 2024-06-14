import { defineStore } from 'pinia';
import { LocalStorage, uid } from 'quasar';
import { OldAppConfig } from 'src/types/settings';

import {
  buildNewPrefsObject,
  getOldPrefsPaths,
  getOldVersionPath,
  parsePrefsFile,
} from '../helpers/migrations';
import { useCongregationSettingsStore } from '../stores/congregation-settings';

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
    };
  },
});

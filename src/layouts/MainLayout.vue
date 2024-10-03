<template>
  <q-layout class="non-selectable column no-wrap" view="hHh LpR lFr">
    <!-- Topbar -->
    <HeaderBase />

    <!-- Side navigation -->
    <NavDrawer v-model="miniState" />

    <!-- Main content -->
    <q-scroll-area
      :bar-style="barStyle()"
      :thumb-style="thumbStyle()"
      style="flex: 1 1 1px"
    >
      <q-page-container class="main-bg">
        <router-view />
      </q-page-container>
    </q-scroll-area>

    <!-- Footer -->
    <q-footer
      v-if="
        currentSettings?.enableMediaDisplayButton ||
        currentSettings?.enableMusicButton
      "
      :style="
        'left: calc(50% + ' + (miniState ? '28' : '150') + 'px) !important'
      "
      class="q-pb-sm"
    >
      <ActionIsland />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
// Packages
import { storeToRefs } from 'pinia';
import { Dark, LocalStorage, useQuasar } from 'quasar';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

// Globals
import { barStyle, queues, thumbStyle } from 'src/boot/globals';
import { refreshDateLocale } from 'src/boot/i18n';

// Components
import HeaderBase from 'src/components/header/HeaderBase.vue';
import ActionIsland from 'src/components/ui/ActionIsland.vue';
import NavDrawer from 'src/components/ui/NavDrawer.vue';

// Helpers
import {
  cleanAdditionalMediaFolder,
  cleanLocalStorage,
} from 'src/helpers/cleanup';
import { updateLookupPeriod } from 'src/helpers/date';
import { electronApi } from 'src/helpers/electron-api';
import { errorCatcher } from 'src/helpers/error-catcher';
import { downloadSongbookVideos } from 'src/helpers/jw-media';
import {
  registerAllCustomShortcuts,
  unregisterAllCustomShortcuts,
} from 'src/helpers/keyboardShortcuts';
import { showMediaWindow } from 'src/helpers/mediaPlayback';
import { createTemporaryNotification } from 'src/helpers/notifications';

// Stores
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useCongregationSettingsStore } from 'src/stores/congregation-settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';

// Local state
const miniState = ref(true);

// Icon mapping
const $q = useQuasar();

$q.iconMapFn = (iconName) => {
  if (iconName.startsWith('chevron_')) {
    iconName = iconName.replace('chevron_', 'mmm-');
  } else if (iconName.startsWith('keyboard_arrow_')) {
    iconName = iconName.replace('keyboard_arrow_', 'mmm-');
  } else if (iconName.startsWith('arrow_drop_')) {
    iconName = 'mmm-dropdown-arrow';
  } else if (iconName === 'cancel' || iconName === 'close') {
    iconName = 'clear';
  }
  if (!iconName.startsWith('mmm-')) {
    iconName = 'mmm-' + iconName;
  }
  return {
    cls: iconName,
  };
};

// Routes and translations
const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n({ useScope: 'global' });

// Store initializations
const appSettings = useAppSettingsStore();
const { migrations } = storeToRefs(appSettings);
const { runMigration } = appSettings;

if (!migrations.value?.includes('firstRun')) {
  const migrationResult = runMigration('firstRun');
  if (migrationResult) {
    createTemporaryNotification({
      caption: t('successfully-migrated-from-the-previous-version'),
      icon: 'mmm-info',
      message: t('welcome-to-mmm'),
      timeout: 15000,
      type: 'positive',
    });
  }
}

appSettings.$subscribe((_, state) => {
  LocalStorage.set('migrations', state.migrations);
  LocalStorage.set('screenPreferences', state.screenPreferences);
});

const congregationSettings = useCongregationSettingsStore();
congregationSettings.$subscribe((_, state) => {
  LocalStorage.set('congregations', state.congregations);
});

const jwStore = useJwStore();
jwStore.$subscribe((_, state) => {
  LocalStorage.set('jwLanguages', state.jwLanguages);
  LocalStorage.set('jwSongs', state.jwSongs);
  LocalStorage.set('yeartexts', state.yeartexts);
  LocalStorage.set('mediaSort', state.mediaSort);
  LocalStorage.set('customDurations', state.customDurations);
  LocalStorage.set('additionalMediaMaps', state.additionalMediaMaps);
  LocalStorage.set('lookupPeriod', state.lookupPeriod);
});

const { updateJwLanguages } = jwStore;
updateJwLanguages();

const currentState = useCurrentStateStore();
const {
  currentCongregation,
  currentSettings,
  downloadProgress,
  online,
  selectedDate,
} = storeToRefs(currentState);

watch(currentCongregation, (newCongregation, oldCongregation) => {
  try {
    if (oldCongregation && queues.meetings[oldCongregation]) {
      queues.meetings[oldCongregation].pause();
    }
    if (!newCongregation) {
      showMediaWindow(false);
      navigateToCongregationSelector();
    } else {
      downloadProgress.value = {};
      updateLookupPeriod();
      registerAllCustomShortcuts();
      downloadSongbookVideos();
      if (queues.meetings[newCongregation]) {
        queues.meetings[newCongregation].start();
      }
    }
  } catch (error) {
    errorCatcher(error);
  }
});

watch(online, (isNowOnline) => {
  try {
    const congregation = currentCongregation.value;
    if (!congregation) return;

    const { downloads, meetings } = queues;
    const downloadQueue = downloads[congregation];
    const meetingQueue = meetings[congregation];

    if (isNowOnline) {
      downloadQueue?.start();
      meetingQueue?.start();
    } else {
      downloadQueue?.pause();
      meetingQueue?.pause();
    }
  } catch (error) {
    errorCatcher(error);
  }
});

const navigateToCongregationSelector = () => {
  try {
    if (route.fullPath !== '/congregation-selector') {
      router.push({ path: '/congregation-selector' });
      selectedDate.value = '';
    }
  } catch (error) {
    errorCatcher(error);
  }
};

watch(currentSettings, (newSettings) => {
  if (!newSettings) navigateToCongregationSelector();
});

watch(
  () => currentSettings.value?.darkMode,
  (newDarkMode) => {
    Dark.set(newDarkMode as 'auto' | boolean);
  },
  { immediate: true },
);

watch(
  () => [currentSettings.value?.localAppLang],
  ([newAppLang]) => {
    if (newAppLang) {
      if (newAppLang.includes('-')) newAppLang = newAppLang.split('-')[0];
      locale.value = newAppLang;
      refreshDateLocale(newAppLang);
    }
  },
);

watch(
  () => [
    currentCongregation.value,
    currentSettings.value?.lang,
    currentSettings.value?.langFallback,
    currentSettings.value?.langSubtitles,
    currentSettings.value?.enableSubtitles,
    currentSettings.value?.mwDay,
    currentSettings.value?.weDay,
    currentSettings.value?.coWeek,
    currentSettings.value?.disableMediaFetching,
  ],
  (
    [newCurrentCongregation, , , , , , ,],
    [oldCurrentCongregation, , , , , , ,],
  ) => {
    if (newCurrentCongregation === oldCurrentCongregation)
      updateLookupPeriod(true);
  },
);

const {
  fs,
  getAppDataPath,
  getUserDataPath,
  getUserDesktopPath,
  path,
  readShortcutLink,
  setAutoStartAtLogin,
  writeShortcutLink,
} = electronApi;

watch(
  () => currentSettings.value?.autoStartAtLogin,
  (newAutoStartAtLogin) => {
    setAutoStartAtLogin(!!newAutoStartAtLogin);
  },
);

watch(
  () => currentSettings.value?.enableExtraCache,
  (newEnableExtraCache) => {
    try {
      if (newEnableExtraCache) downloadSongbookVideos();
    } catch (error) {
      errorCatcher(error);
    }
  },
);

watch(
  () => currentSettings.value?.enableKeyboardShortcuts,
  (newEnableKeyboardShortcuts) => {
    if (newEnableKeyboardShortcuts) {
      registerAllCustomShortcuts();
    } else {
      unregisterAllCustomShortcuts();
    }
  },
);

// Hack for Windows shortcut glitch, possibly related to https://github.com/electron-userland/electron-builder/issues/2435
try {
  if ($q.platform.is.platform === 'win') {
    for (const parentDir of [
      path.join(
        getAppDataPath(),
        'Microsoft',
        'Windows',
        'Start Menu',
        'Programs',
      ),
      getUserDesktopPath(),
    ]) {
      try {
        const shortcutPath = path.join(parentDir, 'Meeting Media Manager.lnk');
        if (fs.existsSync(shortcutPath)) {
          fs.copySync(
            shortcutPath,
            path.join(
              getUserDataPath(),
              'Meeting Media Manager - ' + path.basename(parentDir) + '.lnk',
            ),
          );
          const shortcut = readShortcutLink(shortcutPath);
          if (
            shortcut.target &&
            (shortcut.icon !== shortcut.target ||
              shortcut.cwd !== path.resolve(path.basename(shortcut.target)))
          ) {
            shortcut.cwd = path.resolve(path.basename(shortcut.target));
            shortcut.icon = shortcut.target;
            writeShortcutLink(shortcutPath, shortcut);
          }
        }
      } catch (error) {
        errorCatcher(error);
      }
    }
  }
} catch (error) {
  errorCatcher(error);
}

cleanLocalStorage();
cleanAdditionalMediaFolder();

const bcClose = new BroadcastChannel('closeAttempts');
const attemptedClose = ref(false);
bcClose.onmessage = (event) => {
  attemptedClose.value = event?.data?.attemptedClose;
};

watch(
  () => attemptedClose.value,
  (newAttemptedClose, oldAttemptedClose) => {
    if (newAttemptedClose && !oldAttemptedClose) {
      createTemporaryNotification({
        caption: ref(t('clicking-the-close-button-again-will-close-app')).value,
        icon: 'mmm-error',
        message: ref(t('make-sure-that-m-is-in-not-use-before-quitting')).value,
        noClose: true,
        progress: true,
        timeout: 10000,
        type: 'negative',
      });
      setTimeout(() => {
        attemptedClose.value = false;
      }, 10000);
    }
  },
);

onMounted(() => {
  document.title = 'Meeting Media Manager';
  if (!currentSettings.value) navigateToCongregationSelector();
});
</script>

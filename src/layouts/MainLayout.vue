<template>
  <q-layout class="non-selectable column no-wrap" view="hHh LpR lFr">
    <HeaderBase />

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

    <q-drawer
      v-model="drawer"
      :breakpoint="5"
      :mini="miniState"
      bordered
      class="column justify-between no-wrap bg-secondary-contrast text-weight-medium text-dark-grey"
    >
      <q-item
        v-if="$q.screen.gt.xs"
        v-ripple
        clickable
        @click="miniState = !miniState"
      >
        <q-tooltip
          v-if="miniState"
          :delay="1000"
          anchor="center right"
          self="center left"
        >
          {{ $t('expand-sidebar') }}
        </q-tooltip>
        <q-item-section avatar>
          <q-icon name="mmm-menu" />
        </q-item-section>
        <q-item-section>{{ $t('collapse-sidebar') }}</q-item-section>
      </q-item>
      <q-item
        v-ripple
        :disable="!currentSettings || invalidSettings()"
        :to="{ path: '/media-calendar', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
      >
        <q-tooltip
          v-if="miniState"
          :delay="1000"
          anchor="center right"
          self="center left"
        >
          {{
            !currentSettings
              ? $t('select-a-congregation-to-enable')
              : $t('titles.meetingMedia')
          }}
        </q-tooltip>
        <q-item-section avatar>
          <q-icon name="mmm-media" />
        </q-item-section>
        <q-item-section>{{ $t('titles.meetingMedia') }}</q-item-section>
      </q-item>
      <q-item
        v-ripple
        :disable="!currentSettings || invalidSettings() || mediaPlaying"
        :to="{ path: '/present-website', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
      >
        <q-tooltip
          v-if="miniState"
          :delay="1000"
          anchor="center right"
          self="center left"
        >
          {{ $t('titles.presentWebsite') }}
        </q-tooltip>
        <q-item-section avatar>
          <q-icon name="mmm-open-web" />
        </q-item-section>
        <q-item-section>{{ $t('titles.presentWebsite') }}</q-item-section>
      </q-item>
      <q-item
        v-ripple
        :disable="mediaPlaying"
        :to="{ path: '/congregation-selector', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
      >
        <q-tooltip
          v-if="miniState"
          :delay="1000"
          anchor="center right"
          self="center left"
        >
          {{ $t('titles.profileSelection') }}
        </q-tooltip>
        <q-item-section avatar>
          <q-icon name="mmm-groups" />
        </q-item-section>
        <q-item-section>
          {{ $t('titles.profileSelection') }}
        </q-item-section>
      </q-item>
      <q-space />
      <q-item
        v-ripple
        :disable="
          !currentSettings || mediaPlaying || route.fullPath.includes('wizard')
        "
        :to="{ path: '/settings', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
      >
        <q-tooltip
          v-if="miniState"
          :delay="1000"
          anchor="center right"
          self="center left"
        >
          {{ $t('titles.settings') }}
        </q-tooltip>
        <q-item-section avatar>
          <q-icon
            :color="invalidSettings() ? 'negative' : ''"
            name="mmm-settings"
          />
        </q-item-section>
        <q-item-section :class="invalidSettings() ? 'text-negative' : ''">
          {{ $t('titles.settings') }}
        </q-item-section>
      </q-item>
    </q-drawer>
    <q-scroll-area
      :bar-style="barStyle()"
      :thumb-style="thumbStyle()"
      style="flex: 1 1 1px"
    >
      <q-page-container class="main-bg">
        <router-view />
      </q-page-container>
    </q-scroll-area>
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Dark, LocalStorage } from 'quasar';
import { useQuasar } from 'quasar';
import { queues } from 'src/boot/globals';
import { barStyle, thumbStyle } from 'src/boot/globals';
import { refreshDateLocale } from 'src/boot/i18n';
import HeaderBase from 'src/components/header/HeaderBase.vue';
import ActionIsland from 'src/components/ui/ActionIsland.vue';
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
import { createTemporaryNotification } from 'src/helpers/notifications';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useCongregationSettingsStore } from 'src/stores/congregation-settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

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

// Store and router initializations

const appSettings = useAppSettingsStore();
const { migrations } = storeToRefs(appSettings);
const { runMigration } = appSettings;

appSettings.$subscribe((_, state) => {
  LocalStorage.set('migrations', state.migrations);
  LocalStorage.set('screenPreferences', state.screenPreferences);
});

const currentState = useCurrentStateStore();
const { invalidSettings } = currentState;
const {
  currentCongregation,
  currentSettings,
  downloadProgress,
  mediaPlaying,
  online,
  selectedDate,
} = storeToRefs(currentState);

const congregationSettings = useCongregationSettingsStore();
congregationSettings.$subscribe((_, state) => {
  LocalStorage.set('congregations', state.congregations);
});

const jwStore = useJwStore();
const { updateJwLanguages } = jwStore;
jwStore.$subscribe((_, state) => {
  LocalStorage.set('jwLanguages', state.jwLanguages);
  LocalStorage.set('jwSongs', state.jwSongs);
  LocalStorage.set('yeartexts', state.yeartexts);
  LocalStorage.set('mediaSort', state.mediaSort);
  LocalStorage.set('customDurations', state.customDurations);
  LocalStorage.set('additionalMediaMaps', state.additionalMediaMaps);
  LocalStorage.set('lookupPeriod', state.lookupPeriod);
});

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

const { locale, t } = useI18n({ useScope: 'global' });
const drawer = ref(true);
updateJwLanguages();

const route = useRoute();
const router = useRouter();
const miniState = ref(true);

watch(currentCongregation, (newCongregation, oldCongregation) => {
  try {
    if (oldCongregation && queues.meetings[oldCongregation]) {
      queues.meetings[oldCongregation].pause();
    }
    if (!newCongregation) {
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

if (!migrations.value.includes('firstRun')) {
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

watch(
  () => $q?.screen?.lt?.sm,
  (isNowExtraSmall) => {
    if (isNowExtraSmall) {
      miniState.value = true;
    }
  },
);

onMounted(() => {
  document.title = 'Meeting Media Manager';
  if (!currentSettings.value) navigateToCongregationSelector();
});
</script>

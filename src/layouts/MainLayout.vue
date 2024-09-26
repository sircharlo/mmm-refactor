<template>
  <q-layout class="non-selectable column no-wrap" view="hHh LpR lFr">
    <q-header
      bordered
      class="bg-primary text-white text-bigger text-weight-medium"
    >
      <div class="row items-center q-my-sm q-mr-md">
        <div
          @click="aboutModal = true"
          class="row justify-center cursor-pointer"
          style="width: 56px"
        >
          <img src="logo-no-background.svg" />
        </div>
        <q-separator class="bg-semi-white-24 q-ml-none" inset vertical />
        <div class="col q-ml-md flex items-center">
          <div class="col-shrink items-center">
            <q-icon
              :name="route.meta.icon as string"
              class="q-mr-md"
              size="md"
            />
          </div>
          <div class="col items-center">
            <div class="row text-current-page ellipsis-1-line">
              {{ $t(route.meta.title as string) }}
            </div>
            <div
              class="row text-congregation ellipsis-1-line"
              v-if="!route.fullPath.includes('congregation-selector')"
            >
              {{
                congregationSettings?.congregations?.[currentCongregation]
                  ?.congregationName
              }}
            </div>
          </div>
        </div>
        <div class="col-shrink q-gutter-x-sm">
          <template v-if="route.fullPath.includes('congregation-selector')">
            <q-btn
              :label="$t('new-profile')"
              @click="createNewCongregation"
              color="white-transparent"
              icon="mmm-plus"
              unelevated
            />
          </template>
          <template v-else-if="route.fullPath === '/media-calendar'">
            <q-btn
              :disable="mediaPlaying || !mediaSortForDay"
              @click="resetSort"
              color="white-transparent"
              unelevated
            >
              <q-icon
                :class="{ 'q-mr-sm': $q.screen.gt.sm }"
                name="mmm-reset"
                size="xs"
              />
              {{ $q.screen.gt.sm ? $t('reset-sort-order') : '' }}
              <q-tooltip :delay="1000">
                {{ $t('reset-sort-order') }}
              </q-tooltip>
            </q-btn>
            <q-btn color="white-transparent" unelevated v-if="selectedDate">
              <q-icon
                :class="{ 'q-mr-sm': $q.screen.gt.sm }"
                name="mmm-import-media"
                size="xs"
              />
              {{ $q.screen.gt.sm ? $t('import-media') : '' }}
              <q-tooltip :delay="1000">
                {{ $t('import-media') }}
              </q-tooltip>
              <q-menu :offset="[0, 11]" class="top-menu" ref="importMenu">
                <q-list style="min-width: 100px">
                  <q-item-label header>{{ $t('from-jw-org') }}</q-item-label>
                  <q-item
                    :disable="!online"
                    @click="chooseSong = true"
                    clickable
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon color="primary" name="mmm-music-note" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('song') }}</q-item-label>
                      <q-item-label caption>{{
                        $t('from-songbook')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                    :disable="!online"
                    @click="
                      remoteVideoPopup = true;
                      getJwVideos();
                    "
                    clickable
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon color="primary" name="mmm-movie" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('video') }}</q-item-label>
                      <q-item-label caption>{{
                        $t('latest-videos-from-jw-org')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                    @click="publicTalkMediaPopup = true"
                    clickable
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon color="primary" name="mmm-lectern" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('public-talk-media') }}</q-item-label>
                      <q-item-label caption>{{
                        $t('media-from-s34mp')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item-label header>{{
                    $t('from-local-computer')
                  }}</q-item-label>
                  <template
                    :key="name"
                    v-for="[icon, name] in [
                      ['mmm-local-media', 'images-videos'],
                      ['mmm-jwpub', 'jwpub-file'],
                      ['mmm-jwlplaylist', 'jw-playlist'],
                    ]"
                  >
                    <q-item @click="dragging" clickable v-close-popup>
                      <q-item-section avatar>
                        <q-icon :name="icon" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t(name) }}</q-item-label>
                        <q-item-label caption>{{
                          $t(name + '-explain')
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn :disable="mediaPlaying" color="white-transparent" unelevated>
              <q-icon
                :class="{ 'q-mr-sm': $q.screen.gt.xs }"
                name="mmm-calendar-month"
                size="xs"
              />
              {{
                $q.screen.gt.xs
                  ? getDateLocaleFormatted(
                      currentSettings?.localAppLang,
                      selectedDate,
                    ) || $t('select-a-date')
                  : ''
              }}
              <!--dayjs-->
              <q-popup-proxy :offset="[0, 11]" v-model="datePickerActive">
                <q-date
                  :event-color="getEventDayColor"
                  :events="getEventDates()"
                  :navigation-max-year-month="maxDate()"
                  :navigation-min-year-month="minDate()"
                  :options="dateOptions"
                  landscape
                  v-model="selectedDate"
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      :label="$t('close')"
                      color="primary"
                      outline
                      v-close-popup
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <DialogRemoteVideo
              :remote-videos="remoteVideos"
              :remote-videos-loading-progress="remoteVideosLoadingProgress"
              v-model="remoteVideoPopup"
            />
          </template>
          <template v-else-if="route.fullPath === '/settings'">
            <q-btn color="white-transparent" unelevated v-if="selectedDate">
              <q-icon class="q-mr-sm" name="mmm-tools" size="xs" />
              {{ $t('tools') }}
              <q-tooltip :delay="1000" v-if="!moreOptionsMenuActive">
                {{ $t('tools') }}
              </q-tooltip>
              <q-menu
                :offset="[0, 11]"
                @before-hide="moreOptionsMenuActive = false"
                @show="
                  moreOptionsMenuActive = true;
                  calculateCacheSize();
                "
              >
                <q-list style="min-width: 100px">
                  <template v-if="invalidSettings()">
                    <q-item-label header>{{
                      $t('invalid-settings')
                    }}</q-item-label>
                    <q-item
                      @click="
                        onlyShowInvalidSettings = !onlyShowInvalidSettings
                      "
                      clickable
                    >
                      <q-item-section avatar>
                        <q-icon
                          :color="
                            onlyShowInvalidSettings ? 'primary' : 'negative'
                          "
                          :name="
                            onlyShowInvalidSettings ? 'mmm-menu' : 'mmm-error'
                          "
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label
                          >{{
                            onlyShowInvalidSettings
                              ? $t('show-all-settings')
                              : $t('only-show-settings-that-are-not-valid')
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <q-item-label header>{{ $t('cache') }}</q-item-label>
                  <q-item
                    :disable="calculatingCacheSize"
                    @click="confirmDeleteCacheFiles('smart')"
                    clickable
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon color="primary" name="mmm-delete-smart" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label
                        >{{ $t('remove-unused-cache') }}
                      </q-item-label>
                      <q-item-label caption>{{
                        unusedCacheFoldersSize
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                    :disable="calculatingCacheSize"
                    @click="confirmDeleteCacheFiles('all')"
                    clickable
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon color="primary" name="mmm-delete-all" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('remove-all-cache') }} </q-item-label>
                      <q-item-label caption>{{
                        allCacheFilesSize
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
          <template v-else-if="route.fullPath === '/present-website'">
            <template v-if="mediaPlayingAction == 'website'">
              <q-btn-group unelevated>
                <q-btn
                  @click="zoomWebsiteWindow('out')"
                  color="white-transparent"
                >
                  <q-icon name="mmm-minus" size="xs" />
                  <q-tooltip :delay="1000">{{ $t('zoom-out') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click="zoomWebsiteWindow('in')"
                  color="white-transparent"
                >
                  <q-icon name="mmm-plus" size="xs" />
                  <q-tooltip :delay="1000">{{ $t('zoom-in') }}</q-tooltip>
                </q-btn>
              </q-btn-group>
              <q-btn-group unelevated>
                <q-btn
                  @click="navigateWebsiteWindow('back')"
                  color="white-transparent"
                >
                  <q-icon name="mmm-arrow-back" size="xs" />
                  <q-tooltip :delay="1000">{{ $t('back') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click="navigateWebsiteWindow('forward')"
                  color="white-transparent"
                >
                  <q-icon name="mmm-arrow-forward" size="xs" />
                  <q-tooltip :delay="1000">{{ $t('forward') }}</q-tooltip>
                </q-btn>
                <q-btn
                  @click="navigateWebsiteWindow('refresh')"
                  color="white-transparent"
                >
                  <q-icon name="mmm-refresh" size="xs" />
                  <q-tooltip :delay="1000">{{ $t('refresh') }}</q-tooltip>
                </q-btn>
              </q-btn-group>
              <q-btn
                @click="
                  closeWebsiteWindow();
                  mediaPlayingAction = '';
                "
                color="white-transparent"
                unelevated
              >
                <q-icon class="q-mr-sm" name="mmm-mirror" size="xs" />
                {{ $t('stop-mirroring') }}
              </q-btn>
            </template>
            <q-btn
              :disable="mediaPlaying"
              @click="
                openWebsiteWindow();
                mediaPlayingAction = 'website';
              "
              color="white-transparent"
              unelevated
              v-else
            >
              <q-icon class="q-mr-sm" name="mmm-mirror" size="xs" />
              {{ $t('start-mirroring') }}
            </q-btn>
          </template>
        </div>
      </div>
    </q-header>

    <q-footer
      :style="'left: calc(50% + ' + (miniState ? '28' : '150') + 'px) !important'"
      class="q-pb-sm"
      v-if="
        currentSettings?.enableMediaDisplayButton ||
        currentSettings?.enableMusicButton
      "
    >
      <ActionIsland />
    </q-footer>
    <PublicTalkMediaPicker v-model="publicTalkMediaPopup" />
    <SongPicker v-model="chooseSong" />
    <q-drawer
      :breakpoint="5"
      :mini="miniState"
      bordered
      class="column justify-between no-wrap bg-secondary-contrast text-weight-medium text-dark-grey"
      v-model="drawer"
    >
      <q-item
        @click="miniState = !miniState"
        clickable
        v-if="$q.screen.gt.xs"
        v-ripple
      >
        <q-tooltip
          :delay="1000"
          anchor="center right"
          self="center left"
          v-if="miniState"
        >
          {{ $t('expand-sidebar') }}
        </q-tooltip>
        <q-item-section avatar>
          <q-icon name="mmm-menu" />
        </q-item-section>
        <q-item-section>{{ $t('collapse-sidebar') }}</q-item-section>
      </q-item>
      <q-item
        :disable="!currentSettings || invalidSettings()"
        :to="{ path: '/media-calendar', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
        v-ripple
      >
        <q-tooltip
          :delay="1000"
          anchor="center right"
          self="center left"
          v-if="miniState"
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
        :disable="!currentSettings || invalidSettings() || mediaPlaying"
        :to="{ path: '/present-website', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
        v-ripple
      >
        <q-tooltip
          :delay="1000"
          anchor="center right"
          self="center left"
          v-if="miniState"
        >
          {{ $t('titles.presentWebsite') }}
        </q-tooltip>
        <q-item-section avatar>
          <q-icon name="mmm-open-web" />
        </q-item-section>
        <q-item-section>{{ $t('titles.presentWebsite') }}</q-item-section>
      </q-item>
      <q-item
        :disable="mediaPlaying"
        :to="{ path: '/congregation-selector', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
        v-ripple
      >
        <q-tooltip
          :delay="1000"
          anchor="center right"
          self="center left"
          v-if="miniState"
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
        :disable="
          !currentSettings || mediaPlaying || route.fullPath.includes('wizard')
        "
        :to="{ path: '/settings', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
        v-ripple
      >
        <q-tooltip
          :delay="1000"
          anchor="center right"
          self="center left"
          v-if="miniState"
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
    <DialogCacheClear
      :cache-files="cacheFiles"
      :untouchable-directories="untouchableDirectories"
      :unused-parent-directories="unusedParentDirectories"
      v-model="cacheClearConfirmPopup"
      v-model:cache-clear-type="cacheClearType"
    />
    <DialogAbout v-model="aboutModal" />
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import prettyBytes from 'pretty-bytes';
import { Dark, date, LocalStorage, QMenu } from 'quasar';
import { useQuasar } from 'quasar';
import { get } from 'src/boot/axios';
import { queues } from 'src/boot/globals';
import { barStyle, thumbStyle } from 'src/boot/globals';
import { refreshDateLocale } from 'src/boot/i18n';
import DialogAbout from 'src/components/dialog/DialogAbout.vue';
import DialogCacheClear from 'src/components/dialog/DialogCacheClear.vue';
import DialogRemoteVideo from 'src/components/dialog/DialogRemoteVideo.vue';
import PublicTalkMediaPicker from 'src/components/media/PublicTalkMediaPicker.vue';
import SongPicker from 'src/components/media/SongPicker.vue';
import ActionIsland from 'src/components/ui/ActionIsland.vue';
import {
  cleanAdditionalMediaFolder,
  cleanLocalStorage,
} from 'src/helpers/cleanup';
import { getDateLocaleFormatted, updateLookupPeriod } from 'src/helpers/date';
import { electronApi } from 'src/helpers/electron-api';
import { errorCatcher } from 'src/helpers/error-catcher';
import {
  getAdditionalMediaPath,
  getParentDirectory,
  getPublicationDirectory,
  getPublicationsPath,
  getTempDirectory,
} from 'src/helpers/fs';
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
import { CacheFile } from 'src/types/media';
import {
  JwVideoCategory,
  MediaItemsMediatorItem,
} from 'src/types/publications';
import { computed, onMounted, Ref, ref, watch } from 'vue';
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
  currentSongbook,
  downloadProgress,
  mediaPlaying,
  mediaPlayingAction,
  online,
  onlyShowInvalidSettings,
  selectedDate,
} = storeToRefs(currentState);

const congregationSettings = useCongregationSettingsStore();
congregationSettings.$subscribe((_, state) => {
  LocalStorage.set('congregations', state.congregations);
});

const jwStore = useJwStore();
const { resetSort, updateJwLanguages } = jwStore;
const { additionalMediaMaps, lookupPeriod, mediaSort } = storeToRefs(jwStore);
jwStore.$subscribe((_, state) => {
  LocalStorage.set('jwLanguages', state.jwLanguages);
  LocalStorage.set('jwSongs', state.jwSongs);
  LocalStorage.set('yeartexts', state.yeartexts);
  LocalStorage.set('mediaSort', state.mediaSort);
  LocalStorage.set('customDurations', state.customDurations);
  LocalStorage.set('additionalMediaMaps', state.additionalMediaMaps);
  LocalStorage.set('lookupPeriod', state.lookupPeriod);
});

// Ref and reactive initializations
const chooseSong = ref(false);
const mediaSortForDay = computed(() => {
  if (!selectedDate.value || !currentCongregation.value || !mediaSort.value)
    return false;
  try {
    return (
      mediaSort.value?.[currentCongregation.value]?.[selectedDate.value]
        ?.length > 0
    );
  } catch (error) {
    errorCatcher(error);
    return false;
  }
});
const {
  closeWebsiteWindow,
  fs,
  getAppDataPath,
  getUserDataPath,
  getUserDesktopPath,
  klawSync,
  navigateWebsiteWindow,
  openWebsiteWindow,
  path,
  pathToFileURL,
  readShortcutLink,
  setAutoStartAtLogin,
  writeShortcutLink,
  zoomWebsiteWindow,
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

const dateOptions = (lookupDate: string) => {
  try {
    if (!lookupPeriod.value || !lookupPeriod.value) return true;
    const dateArray: Date[] = lookupPeriod.value[
      currentCongregation.value
    ]?.map((day) => day.date);
    // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
    const minDate = date.getMinDate(...dateArray);
    // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
    const maxDate = date.getMaxDate(...dateArray);
    return (
      date.getDateDiff(lookupDate, minDate, 'days') >= 0 &&
      date.getDateDiff(lookupDate, maxDate, 'days') <= 0
    );
  } catch (error) {
    errorCatcher(error);
    return true;
  }
};

const minDate = () => {
  try {
    if (!lookupPeriod.value || !currentCongregation.value) return undefined;
    const dateArray: Date[] = lookupPeriod.value[
      currentCongregation.value
    ]?.map((day) => day.date);
    // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
    const minDate = date.getMinDate(...dateArray);
    return date.formatDate(minDate, 'YYYY/MM');
  } catch (error) {
    errorCatcher(error);
    return undefined;
  }
};

const maxDate = () => {
  try {
    if (!lookupPeriod.value || !currentCongregation.value) return undefined;
    const dateArray: Date[] = lookupPeriod.value[
      currentCongregation.value
    ]?.map((day) => day.date);
    // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
    const maxDate = date.getMaxDate(...dateArray);
    return date.formatDate(maxDate, 'YYYY/MM');
  } catch (error) {
    errorCatcher(error);
    return undefined;
  }
};

const getEventDates = () => {
  try {
    if (
      !(lookupPeriod.value || additionalMediaMaps.value) ||
      !currentCongregation.value
    )
      return [];
    const meetingDates = lookupPeriod.value[currentCongregation.value]
      ?.filter((day) => day.meeting)
      .map((day) => date.formatDate(day.date, 'YYYY/MM/DD'));
    const additionalMedia =
      additionalMediaMaps.value[currentCongregation.value];
    const additionalMediaDates = additionalMedia
      ? Object.keys(additionalMedia).map((day) =>
          date.formatDate(day, 'YYYY/MM/DD'),
        )
      : [];
    return meetingDates.concat(additionalMediaDates);
  } catch (error) {
    errorCatcher(error);
    return [];
  }
};

// Ref for UI states
const datePickerActive = ref(false);
const remoteVideoPopup = ref(false);
const remoteVideosLoadingProgress = ref(0);
const remoteVideos: Ref<MediaItemsMediatorItem[]> = ref([]);
const moreOptionsMenuActive = ref(false);
const cacheFiles: Ref<CacheFile[]> = ref([]);
const calculatingCacheSize = ref(false);
const cacheClearConfirmPopup = ref(false);
const cacheClearType = ref<'' | 'all' | 'smart'>('');

const publicTalkMediaPopup = ref(false);

const dragging = () => {
  window.dispatchEvent(new Event('draggingSomething'));
};

const confirmDeleteCacheFiles = (type: 'all' | 'smart') => {
  cacheClearType.value = type;
  cacheClearConfirmPopup.value = true;
};

const frequentlyUsedDirectories = computed(() => {
  const backgroundMusicFilesDirectory = getPublicationDirectory({
    langwritten: currentSettings.value.lang,
    pub: currentSongbook.value.pub,
  });

  const songbookDirectory = getPublicationDirectory({
    langwritten: currentSettings.value.lang,
    pub: currentSongbook.value.pub,
  });

  const insightDirectory = getPublicationDirectory({
    issue: 0,
    langwritten: currentSettings.value.lang,
    pub: 'it',
  });
  const enjoyLifeForeverDirectory = getPublicationDirectory({
    issue: 0,
    langwritten: currentSettings.value.lang,
    pub: 'lff',
  });
  const lovePeopleDirectory = getPublicationDirectory({
    issue: 0,
    langwritten: currentSettings.value.lang,
    pub: 'lmd',
  });
  return new Set([
    backgroundMusicFilesDirectory,
    enjoyLifeForeverDirectory,
    insightDirectory,
    lovePeopleDirectory,
    songbookDirectory,
  ]);
});

const usedCacheFiles = computed(() => {
  try {
    const usedFiles = cacheFiles.value.filter((f) => !f.orphaned);
    return usedFiles;
  } catch (error) {
    errorCatcher(error);
    return [];
  }
});

const usedParentDirectories = computed(() => {
  try {
    return usedCacheFiles.value.reduce(
      (acc, file) => {
        if (acc[file.parentPath]) {
          acc[file.parentPath] += file.size;
        } else {
          acc[file.parentPath] = file.size;
        }
        return acc;
      },
      {} as { [parentPath: string]: number },
    );
  } catch (error) {
    errorCatcher(error);
    return {};
  }
});

const untouchableDirectories = computed(() => {
  try {
    return new Set([
      getAdditionalMediaPath(),
      getPublicationsPath(),
      getTempDirectory(),
    ]);
  } catch (error) {
    errorCatcher(error);
    return new Set() as Set<string>;
  }
});

const unusedParentDirectories = computed(() => {
  try {
    return cacheFiles.value.reduce(
      (acc, file) => {
        if (
          !usedParentDirectories.value[file.parentPath] &&
          !frequentlyUsedDirectories.value.has(file.parentPath) &&
          !untouchableDirectories.value.has(file.parentPath)
        ) {
          if (acc[file.parentPath]) {
            acc[file.parentPath] += file.size;
          } else {
            acc[file.parentPath] = file.size;
          }
        }
        return acc;
      },
      {} as { [parentPath: string]: number },
    );
  } catch (error) {
    errorCatcher(error);
    return {} as { [parentPath: string]: number };
  }
});

const unusedCacheFoldersSize = computed(() => {
  try {
    if (!cacheFiles.value.length) return '...';
    const size = Object.values(unusedParentDirectories.value).reduce(
      (a, b) => a + b,
      0,
    );
    return prettyBytes(size);
  } catch (error) {
    errorCatcher(error);
    return prettyBytes(0);
  }
});

const allCacheFilesSize = computed(() => {
  try {
    if (!cacheFiles.value.length) return '...';
    return prettyBytes(
      cacheFiles.value.reduce((size, cacheFile) => size + cacheFile.size, 0),
    );
  } catch (error) {
    errorCatcher(error);
    return prettyBytes(0);
  }
});

const calculateCacheSize = async () => {
  calculatingCacheSize.value = true;
  cacheFiles.value = [];
  try {
    const cacheDirs = [
      getAdditionalMediaPath(),
      getTempDirectory(),
      getPublicationsPath(),
    ].filter((dir) => fs.existsSync(dir));
    const lookupPeriodsCollections = Object.values(lookupPeriod.value).flatMap(
      (congregationLookupPeriods) =>
        congregationLookupPeriods.flatMap(
          (lookupPeriods) => lookupPeriods?.dynamicMedia || [],
        ),
    );
    const additionalMediaCollections = Object.values(
      additionalMediaMaps.value,
    ).flatMap((congregationAdditionalMediaMap) =>
      Object.values(congregationAdditionalMediaMap).flat(),
    );
    const mediaFileParentDirectories = new Set([
      ...additionalMediaCollections.map((media) =>
        pathToFileURL(getParentDirectory(media.fileUrl)),
      ),
      ...lookupPeriodsCollections.map((media) =>
        pathToFileURL(getParentDirectory(media.fileUrl)),
      ),
    ]);
    for (const cacheDir of cacheDirs) {
      cacheFiles.value.push(
        ...klawSync(cacheDir, {
          nodir: true,
          nofile: false,
        }).map((file) => {
          const fileParentDirectory = getParentDirectory(file.path);
          const fileParentDirectoryUrl = pathToFileURL(fileParentDirectory);

          return {
            directory: false,
            orphaned: !mediaFileParentDirectories.has(fileParentDirectoryUrl), // Not referenced on any date
            parentPath: fileParentDirectory,
            path: file.path,
            size: file.stats.size,
          };
        }),
      );
    }
  } catch (error) {
    errorCatcher(error);
  }
  calculatingCacheSize.value = false;
};

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
const getJwVideos = async () => {
  try {
    if (!currentSettings.value) return;
    if (remoteVideosLoadingProgress.value < 1) {
      const getSubcategories = async (category: string) => {
        return (await get(
          `https://b.jw-cdn.org/apis/mediator/v1/categories/${
            currentSettings.value?.lang
          }/${category}?detailed=1&mediaLimit=0&clientType=www`,
        )) as JwVideoCategory;
      };
      const subcategories: {
        key: string;
        parentCategory: string;
      }[] = [{ key: 'LatestVideos', parentCategory: '' }];
      const subcategoriesRequest = await getSubcategories('VideoOnDemand');
      const subcategoriesFirstLevel =
        subcategoriesRequest.category.subcategories.map((s) => s.key);
      for (const subcategoryFirstLevel of subcategoriesFirstLevel) {
        subcategories.push(
          ...(
            await getSubcategories(subcategoryFirstLevel)
          ).category.subcategories.map((s) => {
            return { key: s.key, parentCategory: subcategoryFirstLevel };
          }),
        );
      }
      let index = 0;
      for (const category of subcategories) {
        const request = (await get(
          `https://b.jw-cdn.org/apis/mediator/v1/categories/${
            currentSettings.value?.lang
          }/${category.key}?detailed=0&clientType=www`,
        )) as JwVideoCategory;
        remoteVideos.value = remoteVideos.value
          .concat(request.category.media)
          .reduce((accumulator: MediaItemsMediatorItem[], current) => {
            const guids = new Set(accumulator.map((item) => item.guid));
            if (!guids.has(current.guid)) {
              accumulator.push(current);
            }
            return accumulator;
          }, [])
          .sort((a, b) => {
            return (
              new Date(b.firstPublished).getTime() -
              new Date(a.firstPublished).getTime()
            );
          });
        index++;
        remoteVideosLoadingProgress.value = index / subcategories.length;
      }
    }
  } catch (error) {
    errorCatcher(error);
  }
};

const getEventDayColor = (eventDate: string) => {
  try {
    if (!lookupPeriod.value || !currentCongregation.value)
      throw new Error('No congregation or lookup period');
    const lookupDate = lookupPeriod.value[currentCongregation.value]?.find(
      (d) => date.getDateDiff(eventDate, d.date, 'days') === 0,
    );
    if (lookupDate?.complete) {
      return 'primary';
    } else if (lookupDate?.error) {
      return 'negative';
    }
    const additionalDates =
      additionalMediaMaps.value[currentCongregation.value];
    if (additionalDates) {
      const isAdditional = Object.keys(additionalDates)
        .map((day) => date.formatDate(day, 'YYYY/MM/DD'))
        .includes(eventDate);
      if (isAdditional) return 'additional';
    }
  } catch (error) {
    errorCatcher(error);
    return 'negative';
  }
  return 'warning';
};

const createNewCongregation = () => {
  window.dispatchEvent(new CustomEvent('createNewCongregation'));
};

const aboutModal = ref(false);

const importMenu: Ref<QMenu | undefined> = ref();
const openImportMenu = () => {
  importMenu.value?.show();
};

const openSongPicker = () => {
  chooseSong.value = true;
};

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
  window.addEventListener('openImportMenu', openImportMenu);
  window.addEventListener('openSongPicker', openSongPicker);
});
</script>

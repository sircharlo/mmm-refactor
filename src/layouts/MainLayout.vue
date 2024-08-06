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
          <q-icon :name="route.meta.icon as string" class="q-mr-md" size="md" />
          {{ $t(route.meta.title as string) }}
        </div>
        <div class="col-shrink q-gutter-x-sm">
          <template v-if="route.fullPath === '/congregation-selector'">
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
              :disable="mediaPlaying"
              @click="resetSort"
              color="white-transparent"
              unelevated
              v-if="mediaSortForDay && selectedDate"
            >
              <q-icon class="q-mr-sm" name="mmm-reset" size="xs" />
              {{ $t('reset-sort-order') }}
            </q-btn>
            <q-btn color="white-transparent" unelevated v-if="selectedDate">
              <q-icon class="q-mr-sm" name="mmm-import-media" size="xs" />
              {{ $t('import-media') }}
              <q-menu
                :offset="[0, 11]"
                @before-hide="importMediaMenuActive = false"
                @before-show="importMediaMenuActive = true"
                class="top-menu"
              >
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
              <q-icon class="q-mr-sm" name="mmm-calendar-month" size="xs" />
              {{
                getDateLocaleFormatted(
                  currentSettings?.localAppLang,
                  selectedDate,
                ) || $t('select-a-date')
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
            <q-dialog v-model="remoteVideoPopup">
              <div
                class="items-center q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast large-overlay"
              >
                <div class="text-h6 row">{{ $t('add-video-jw-org') }}</div>
                <div class="row">{{ $t('add-a-video-explain') }}</div>
                <!-- <div class="row">
                  <q-linear-progress
                    :value="remoteVideosLoadingProgress"
                    class="q-mt-md"
                  />
                </div> -->
                <div class="row">
                  <div class="col-grow">
                    <q-input
                      :label="$t('search')"
                      clearable
                      dense
                      outlined
                      v-model="remoteVideoFilter"
                    >
                      <template v-slot:prepend>
                        <q-icon name="mmm-search" />
                      </template>
                    </q-input>
                  </div>
                </div>
                <div
                  class="text-center row items-center justify-center"
                  v-if="
                    !!(
                      remoteVideosLoadingProgress < 1 &&
                      (remoteVideosFiltered.length === 0 || remoteVideoFilter)
                    )
                  "
                >
                  <q-spinner-pie :thickness="2" color="primary" size="4em" />
                </div>
                <div class="row">
                  <q-scroll-area
                    :bar-style="barStyle"
                    :thumb-style="thumbStyle"
                    style="height: 40vh; width: -webkit-fill-available"
                  >
                    <div class="row q-col-gutter-lg">
                      <template
                        :key="video.guid"
                        v-for="video in remoteVideosFiltered"
                      >
                        <div
                          class="col-xs-6 col-sm-4 col-md-3 col-lg-3 col-xl-2"
                        >
                          <q-card
                            :class="{
                              'cursor-pointer': true,
                              'rounded-borders': true,
                              'full-height': true,
                              'bg-accent-100':
                                hoveredRemoteVideo === video.guid,
                            }"
                            @click="
                              downloadAdditionalRemoteVideo(
                                video.files,
                                getBestImageUrl(video.images, 'md'),
                              );
                              remoteVideoPopup = false;
                            "
                            @mouseout="hoveredRemoteVideo = ''"
                            @mouseover="hoveredRemoteVideo = video.guid"
                            flat
                            v-ripple
                          >
                            <q-card-section class="q-pa-sm">
                              <q-img
                                :src="getBestImageUrl(video.images, 'md')"
                                class="rounded-borders"
                              >
                                <q-badge
                                  class="q-mt-xs q-ml-xs bg-semi-black"
                                  style="padding: 5px !important"
                                >
                                  <q-icon
                                    class="q-mr-xs"
                                    color="white"
                                    name="mmm-play"
                                  />
                                  {{ formatTime(video.duration) }}
                                </q-badge>
                              </q-img>
                            </q-card-section>
                            <q-card-section class="q-pa-sm">
                              <div class="text-subtitle2 q-mb-xs">
                                {{ video.title }}
                              </div>
                              <div>
                                <span class="text-caption text-dark-grey">{{
                                  video.naturalKey
                                }}</span>
                              </div>
                            </q-card-section>
                          </q-card>
                        </div>
                      </template>
                    </div>
                  </q-scroll-area>
                </div>
                <div class="row items-center">
                  <div class="col">
                    <q-toggle
                      :label="$t('include-audio-description')"
                      checked-icon="mmm-check"
                      color="primary"
                      v-model="remoteVideosIncludeAudioDescription"
                    />
                  </div>
                  <div class="col text-right">
                    <q-btn color="negative" flat v-close-popup>{{
                      $t('cancel')
                    }}</q-btn>
                  </div>
                </div>
                <q-inner-loading :showing="remoteVideoLoading" />
              </div>
            </q-dialog>
          </template>
          <template v-else-if="route.fullPath === '/settings'">
            <q-btn color="white-transparent" unelevated v-if="selectedDate">
              <q-icon class="q-mr-sm" name="mdi-dots-vertical" size="xs" />
              {{ $t('tools') }}

              <q-tooltip :delay="2000" v-if="!moreOptionsMenuActive">
                {{ $t('tools') }}
              </q-tooltip>
              <q-menu
                @before-hide="moreOptionsMenuActive = false"
                @before-show="
                  moreOptionsMenuActive = true;
                  calculateCacheSize();
                "
              >
                <q-list style="min-width: 100px">
                  <q-item-label header>{{ $t('tools') }}</q-item-label>
                  <q-item
                    :disable="calculatingCacheSize"
                    @click="confirmDeleteCacheFiles('smart')"
                    clickable
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon color="primary" name="mdi-vacuum" />
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
                      <q-icon color="primary" name="mdi-bomb" />
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
            <q-toggle
              :label="$t('only-show-settings-that-are-not-valid')"
              color="red"
              icon="clear"
              left-label
              v-if="invalidSettings()"
              v-model="onlyShowInvalidSettings"
            >
            </q-toggle>
          </template>
          <template v-else-if="route.fullPath === '/present-website'">
            <q-btn
              :disable="mediaPlaying"
              @click="
                openWebsiteWindow();
                mediaPlayingAction = 'website';
              "
              color="white-transparent"
              unelevated
              v-if="mediaPlayingAction !== 'website'"
            >
              <q-icon class="q-mr-sm" name="mmm-mirror" size="xs" />
              {{ $t('start-mirroring') }}
            </q-btn>
            <q-btn
              @click="
                closeWebsiteWindow();
                mediaPlayingAction = '';
              "
              color="white-transparent"
              unelevated
              v-else
            >
              <q-icon class="q-mr-sm" name="mmm-mirror" size="xs" />
              {{ $t('stop-mirroring') }}
            </q-btn>
          </template>
        </div>
      </div>
    </q-header>

    <q-footer
      class="q-pb-sm"
      style="background-color: transparent"
      v-if="
        currentSettings?.enableMediaDisplayButton ||
        currentSettings?.enableMusicButton
      "
    >
      <ActionIsland />
    </q-footer>

    <SongPicker v-model="chooseSong" />
    <q-drawer
      :breakpoint="5"
      :mini="miniState"
      bordered
      class="column justify-between no-wrap bg-secondary-contrast text-weight-medium text-dark-grey"
      v-model="drawer"
    >
      <q-item @click="miniState = !miniState" clickable v-ripple>
        <q-tooltip
          :delay="2000"
          anchor="center right"
          self="center left"
          v-if="miniState"
        >
          {{ $t('expand-sidebar') }}
        </q-tooltip>
        <q-item-section avatar>
          <!-- <q-icon :name="'mmm-menu' + (miniState ? '' : '-open')" /> -->
          <q-icon name="mmm-menu" />
        </q-item-section>
        <q-item-section>{{ $t('collapse-sidebar') }}</q-item-section>
      </q-item>

      <!-- @click="
          selectedDate = '';
          datePickerActive = true;
        " -->
      <q-item
        :disable="!currentSettings || invalidSettings() || mediaPlaying"
        :to="{ path: '/media-calendar', exact: true }"
        active-class="bg-accent-100 text-primary blue-bar"
        clickable
        v-ripple
      >
        <q-tooltip
          :delay="2000"
          anchor="center right"
          self="center left"
          v-if="miniState"
        >
          {{ $t('titles.meetingMedia') }}
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
          :delay="2000"
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
          :delay="2000"
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
          :delay="2000"
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
      :bar-style="barStyle"
      :thumb-style="thumbStyle"
      style="flex: 1 1 1px"
    >
      <q-page-container class="main-bg">
        <router-view />
      </q-page-container>
    </q-scroll-area>
    <q-dialog v-model="cacheClearConfirmPopup">
      <q-card class="modal-confirm">
        <q-card-section
          class="row items-center text-bigger text-semibold text-negative q-pb-none"
        >
          <q-icon class="q-mr-sm" name="mmm-delete" />
          {{ $t('clear-cache') }}
        </q-card-section>
        <q-card-section class="row items-center">
          {{ $t('are-you-sure-you-want-to-clear-the-cache') }}
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn
            :label="$t('cancel')"
            @click="cacheClearConfirmPopup = false"
            flat
          />
          <q-btn
            :label="$t('delete')"
            @click="deleteCacheFiles(cacheClearType)"
            color="negative"
            flat
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="aboutModal">
      <div
        class="items-center q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast"
      >
        <!-- <div class="text-h6 row">{{ $t('titles.about') }}</div> -->
        <div class="row items-center">
          <div class="col-shrink q-mr-md">
            <img
              col
              src="favicon.ico"
              style="max-height: 10vh; display: flex"
            />
          </div>
          <div class="col">
            <div class="row text-h6">
              {{ $t('meeting-media-manager') }}
            </div>
            <div class="row">v{{ appVersion }}</div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            {{ $t('app-description') }}
          </div>
        </div>
        <div class="row q-gutter-x-md">
          <div class="col">
            <q-btn
              @click="openExternalWebsite(githubLink)"
              class="full-width row"
              color="primary"
              no-caps
              outline
              target="_blank"
            >
              <div class="col-shrink">
                <q-icon name="mmm-github" />
              </div>
              <div class="col col-grow">{{ $t('github-repo') }}</div>
              <div class="col-shrink"><q-icon name="mmm-arrow-outward" /></div>
            </q-btn>
          </div>
          <div class="col">
            <q-btn
              @click="openExternalWebsite(docsLink)"
              class="full-width row"
              color="primary"
              no-caps
              outline
              target="_blank"
            >
              <div class="col-shrink"><q-icon name="mmm-guide" /></div>
              <div class="col col-grow">{{ $t('user-guide') }}</div>
              <div class="col-shrink"><q-icon name="mmm-arrow-outward" /></div>
            </q-btn>
          </div>
        </div>
        <div class="row">
          <div class="col">
            {{ $t('app-issues') }}
          </div>
        </div>
        <div class="row justify-end">
          <q-btn flat v-close-popup>{{ $t('close') }}</q-btn>
        </div>
      </div>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import PQueue from 'p-queue';
import { storeToRefs } from 'pinia';
import prettyBytes from 'pretty-bytes';
import { Dark, date, LocalStorage } from 'quasar';
import { useQuasar } from 'quasar';
import { get } from 'src/boot/axios';
import { queues } from 'src/boot/globals';
import { barStyle, thumbStyle } from 'src/boot/globals';
import { refreshDateLocale } from 'src/boot/i18n';
import SongPicker from 'src/components/media/SongPicker.vue';
import ActionIsland from 'src/components/ui/ActionIsland.vue';
import {
  cleanAdditionalMediaFolder,
  cleanLocalStorage,
} from 'src/helpers/cleanup';
import { getDateLocaleFormatted, updateLookupPeriod } from 'src/helpers/date';
import { electronApi } from 'src/helpers/electron-api';
import {
  getAdditionalMediaPath,
  getParentDirectory,
  getPublicationDirectory,
  getPublicationsPath,
  getTempDirectory,
  removeEmptyDirs,
} from 'src/helpers/fs';
import {
  downloadAdditionalRemoteVideo,
  downloadBackgroundMusic,
  downloadSongbookVideos,
  getBestImageUrl,
} from 'src/helpers/jw-media';
import {
  registerAllCustomShortcuts,
  unregisterAllCustomShortcuts,
} from 'src/helpers/keyboardShortcuts';
import { formatTime } from 'src/helpers/mediaPlayback';
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
    return {
      cls: iconName.replace('chevron_', 'mmm-'),
    };
  }
  if (iconName.startsWith('keyboard_arrow_')) {
    return {
      cls: iconName.replace('keyboard_arrow_', 'mmm-'),
    };
  }
  if (iconName.startsWith('arrow_drop_')) {
    return {
      cls: 'mmm-dropdown-arrow',
    };
  }
  if (iconName.startsWith('mmm-') === true) {
    // we strip the "app:" part
    // const name = iconName.substring(4)

    return {
      cls: iconName,
    };
  }
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
const { additionalMediaMaps, lookupPeriod } = storeToRefs(jwStore);
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
const mediaSortForDay = ref(true);
const {
  closeWebsiteWindow,
  fs,
  getAppVersion,
  klawSync,
  openExternalWebsite,
  openWebsiteWindow,
  pathToFileURL,
  setAutoStartAtLogin,
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
      downloadBackgroundMusic();
      downloadSongbookVideos();
      if (queues.meetings[newCongregation]) {
        queues.meetings[newCongregation].start();
      }
    }
  } catch (error) {
    console.error(error);
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
      downloadQueue.start();
      meetingQueue.start();
    } else {
      downloadQueue.pause();
      meetingQueue.pause();
    }
  } catch (error) {
    console.error(error);
  }
});

const navigateToCongregationSelector = () => {
  try {
    if (route.fullPath !== '/congregation-selector') {
      router.push({ path: '/congregation-selector' });
      selectedDate.value = '';
    }
  } catch (error) {
    console.error(error);
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
  () => currentSettings.value?.localAppLang,
  (newAppLang) => {
    if (newAppLang) {
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
  ],
  (
    [newCurrentCongregation, , , , , ,],
    [oldCurrentCongregation, , , , , ,],
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
      console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return undefined;
  }
};

const getEventDates = () => {
  try {
    if (!lookupPeriod.value || !currentCongregation.value) return [];
    return lookupPeriod.value[currentCongregation.value]
      ?.filter((day) => day.meeting)
      .map((day) => date.formatDate(day.date, 'YYYY/MM/DD'));
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Ref for UI states
const importMediaMenuActive = ref(false);
const datePickerActive = ref(false);
const remoteVideoPopup = ref(false);
const remoteVideosLoadingProgress = ref(0);
const remoteVideos: Ref<MediaItemsMediatorItem[]> = ref([]);
const remoteVideoFilter = ref('');
const remoteVideosIncludeAudioDescription = ref(false);
const remoteVideoLoading = ref(false);
const hoveredRemoteVideo = ref('');
const moreOptionsMenuActive = ref(false);
const cacheFiles: Ref<CacheFile[]> = ref([]);
const calculatingCacheSize = ref(false);
const cacheClearConfirmPopup = ref(false);
const cacheClearType = ref<'' | 'all' | 'smart'>('');
const deletingCacheFiles = ref(false);

const dragging = () => {
  window.dispatchEvent(new Event('draggingSomething'));
};

const confirmDeleteCacheFiles = (type: 'all' | 'smart') => {
  cacheClearType.value = type;
  cacheClearConfirmPopup.value = true;
};

const cancelDeleteCacheFiles = () => {
  cacheClearType.value = '';
  cacheClearConfirmPopup.value = false;
  deletingCacheFiles.value = false;
};

const frequentlyUsedDirectories = computed(() => {
  const backgroundMusicFilesDirectory = getPublicationDirectory({
    langwritten: currentSongbook.value.signLanguage
      ? currentSettings.value.lang
      : 'E',
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
    songbookDirectory,
    insightDirectory,
    lovePeopleDirectory,
    enjoyLifeForeverDirectory,
  ]);
});

const usedCacheFiles = computed(() => {
  try {
    const usedFiles = cacheFiles.value.filter((f) => !f.orphaned);
    return usedFiles;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return {} as { [parentPath: string]: number };
  }
});

const unusedCacheFoldersSize = computed(() => {
  try {
    const size = Object.values(unusedParentDirectories.value).reduce(
      (a, b) => a + b,
      0,
    );
    return prettyBytes(size);
  } catch (error) {
    console.error(error);
    return prettyBytes(0);
  }
});

const allCacheFilesSize = computed(() => {
  try {
    return prettyBytes(
      cacheFiles.value.reduce((size, cacheFile) => size + cacheFile.size, 0),
    );
  } catch (error) {
    console.error(error);
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
    ];
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
      ...lookupPeriodsCollections.map((media) =>
        pathToFileURL(getParentDirectory(media.fileUrl)),
      ),
      ...additionalMediaCollections.map((media) =>
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
    console.error(error);
  }
  calculatingCacheSize.value = false;
};

const deleteCacheFiles = (type: '' | 'all' | 'smart') => {
  try {
    deletingCacheFiles.value = true;
    const filepathsToDelete =
      type === 'smart'
        ? Object.keys(unusedParentDirectories.value)
        : cacheFiles.value.map((f) => f.path);
    for (const filepath of filepathsToDelete) {
      try {
        fs.rmSync(filepath, { recursive: true });
      } catch (error) {
        console.error(error);
      }
      additionalMediaMaps.value = {};
    }
    for (const untouchableDirectory of untouchableDirectories.value) {
      removeEmptyDirs(untouchableDirectory);
    }
    queues.downloads[currentCongregation.value]?.clear();
    queues.downloads[currentCongregation.value] = new PQueue({
      concurrency: 5,
    });
    cancelDeleteCacheFiles();
  } catch (error) {
    console.error(error);
  }
};

if (!migrations.value.includes('firstRun')) {
  const migrationResult = runMigration('firstRun');
  if (migrationResult) {
    createTemporaryNotification({
      caption: t('successfully-migrated-from-the-previous-version'),
      icon: 'mmm-info',
      message: t('welcome-to-mmm'),
      timeout: 10000,
      type: 'positive',
    });
  }
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
    console.error(error);
  }
};

const remoteVideosFiltered = computed(() => {
  const useableVideos = ref(
    remoteVideos.value.filter(
      (v) =>
        remoteVideosIncludeAudioDescription.value ||
        !v.primaryCategory.endsWith('AD'),
    ),
  );
  if (remoteVideoFilter.value?.length > 2)
    useableVideos.value = useableVideos.value.filter((video) =>
      video.title.toLowerCase().includes(remoteVideoFilter.value.toLowerCase()),
    );
  return useableVideos.value.slice(0, 50);
});

const getEventDayColor = (eventDate: string) => {
  try {
    if (!lookupPeriod.value || !currentCongregation.value)
      throw new Error('No congregation or lookup period');
    const isLoaded =
      lookupPeriod.value[currentCongregation.value]?.find(
        (d) => date.getDateDiff(eventDate, d.date, 'days') === 0,
      )?.loading === false;
    if (!isLoaded) return 'warning';
  } catch (error) {
    console.error(error);
    return 'warning';
  }
  return 'primary';
};

const createNewCongregation = () => {
  window.dispatchEvent(new CustomEvent('createNewCongregation'));
};

const aboutModal = ref(false);
const appVersion = getAppVersion();
const githubLink = 'https://github.com/sircharlo/mmm-refactor';
const docsLink = 'https://sircharlo.github.io/mmm-refactor/';

onMounted(() => {
  document.title = 'Meeting Media Manager';
  if (!currentSettings.value) navigateToCongregationSelector();
});
</script>

<template>
  <q-layout class="non-selectable" view="hHh Lpr lFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar class="q-pl-none">
        <q-toolbar-title>
          <q-avatar class="q-px-sm q-mr-md" rounded>
            <img src="icon.png" />
          </q-avatar>
          {{ $t(route.meta.title as string) }}
        </q-toolbar-title>
        <template v-if="route.fullPath === '/media-calendar'">
          <q-btn
            class="q-ml-sm"
            color="purple-6"
            icon="mdi-movie-plus"
            rounded
            text-color="white"
            v-if="selectedDate"
          >
            <q-tooltip v-if="!importMediaMenuActive">{{
              $t('import-media')
            }}</q-tooltip>
            <q-menu
              @before-hide="importMediaMenuActive = false"
              @before-show="importMediaMenuActive = true"
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
                    <q-icon color="primary" name="mdi-music-clef-treble" />
                  </q-item-section>
                  <q-item-section>{{ $t('song') }}</q-item-section>
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
                    <q-icon color="primary" name="mdi-movie-open-play" />
                  </q-item-section>
                  <q-item-section>{{ $t('video') }}</q-item-section>
                </q-item>
                <q-item-label header>{{
                  $t('from-local-computer')
                }}</q-item-label>
                <template
                  :key="name"
                  v-for="[icon, name] in [
                    ['mdi-image', 'Images or videos'],
                    ['mdi-folder-zip', 'JWPub File'],
                    ['mdi-playlist-play', 'JW Playlist'],
                  ]"
                >
                  <q-item
                    @click="localUploadPopup = true"
                    clickable
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon :name="icon" color="primary" />
                    </q-item-section>
                    <q-item-section>{{ name }}</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            :disable="mediaPlaying"
            @click="resetSort"
            class="q-ml-sm"
            color="warning"
            icon="mdi-sort-numeric-variant"
            rounded
            text-color="black"
            v-if="mediaSortForDay && selectedDate"
          >
            <q-tooltip>{{ $t('reset-sort-order') }}</q-tooltip>
          </q-btn>
          <q-btn
            :disable="mediaPlaying"
            :label="selectedDate"
            class="q-ml-sm"
            color="secondary"
            icon="mdi-calendar"
            rounded
          >
            <q-tooltip v-if="!datePickerActive">{{
              $t('select-a-date')
            }}</q-tooltip>
            <q-popup-proxy breakpoint="1000" v-model="datePickerActive">
              <q-date
                :event-color="getEventDayColor"
                :events="getEventDates()"
                :navigation-max-year-month="maxDate()"
                :navigation-min-year-month="minDate()"
                :options="dateOptions"
                class="non-selectable"
                landscape
                v-model="selectedDate"
              >
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn
                    color="primary"
                    icon="mdi-check"
                    outline
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
          <q-dialog
            @dragenter="localUploadPopup = false"
            v-model="localUploadPopup"
          >
            <q-card>
              <q-card-section>
                <div class="row self-center">
                  <q-avatar
                    class="q-mr-md self-center"
                    color="primary"
                    icon="mdi-cursor-default"
                    text-color="white"
                  />
                  <span class="text-h6 self-center">
                    {{ $t('add-media-files') }}
                  </span>
                  <q-space />
                  <div class="text-h6 self-center">
                    <q-btn dense flat icon="close" round v-close-popup />
                  </div>
                </div>
              </q-card-section>
              <q-card-section>
                <p>
                  {{
                    $t(
                      'to-add-files-from-your-computer-drag-and-drop-them-directly-into-this-window',
                    )
                  }}
                </p>
                <p>
                  {{
                    $t('you-can-also-use-the-button-below-to-browse-for-files')
                  }}
                </p>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  :label="$t('browse')"
                  @click="getLocalFiles()"
                  color="primary"
                  flat
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-dialog v-model="remoteVideoPopup">
            <q-card
              class="non-selectable"
              style="width: 80vw; max-width: 80vw; min-width: 3"
            >
              <q-card-section>
                <div class="row self-center">
                  <q-avatar
                    class="q-mr-md self-center"
                    color="primary"
                    icon="mdi-movie"
                    text-color="white"
                  />
                  <span class="text-h6 self-center">
                    {{ $t('add-video-jw-org') }}
                  </span>
                  <q-space />
                  <div class="text-h6 self-center">
                    <q-btn dense flat icon="close" round v-close-popup />
                  </div>
                </div>
              </q-card-section>
              <q-linear-progress
                :value="remoteVideosLoadingProgress"
                class="q-mt-md"
              />
              <div class="row q-px-sm">
                <div class="col-grow">
                  <q-input
                    :label="$t('filter')"
                    clearable
                    dense
                    v-model="remoteVideoFilter"
                  >
                    <template v-slot:append>
                      <q-icon name="mdi-magnify" />
                    </template>
                  </q-input>
                </div>
                <q-toggle
                  :label="$t('include-audio-description')"
                  left-label
                  v-model="remoteVideosIncludeAudioDescription"
                />
              </div>
              <q-separator />
              <q-card-section
                class="text-center"
                v-if="
                  !!(
                    remoteVideosLoadingProgress < 1 &&
                    (remoteVideosFiltered.length === 0 || remoteVideoFilter)
                  )
                "
              >
                <q-spinner-pie :thickness="2" color="primary" size="4em" />
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-lg" style="min-height: 200px">
                  <template
                    :key="video.guid"
                    v-for="video in remoteVideosFiltered"
                  >
                    <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                      <q-card
                        @click="
                          downloadAdditionalRemoteVideo(video.files);
                          remoteVideoPopup = false;
                        "
                        class="text-white cursor-pointer"
                        style="
                          background-color: rgb(91, 60, 136);
                          border-radius: 0.75em;
                        "
                        v-ripple
                      >
                        <q-img :src="getBestImageUrl(video.images, 'md')" />
                        <q-card-section>
                          <div class="text-subtitle1 q-mb-xs">
                            {{ video.title }}
                          </div>
                          <div>
                            <span class="text-caption text-grey-2">{{
                              video.naturalKey
                            }}</span>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </template>
                </div>
              </q-card-section>
              <q-inner-loading :showing="remoteVideoLoading" />
            </q-card>
          </q-dialog>
        </template>
        <template v-else-if="route.fullPath === '/settings'">
          <q-btn flat icon="mdi-dots-vertical" round v-if="selectedDate">
            <q-tooltip v-if="!moreOptionsMenuActive">
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
                    <q-icon color="primary" name="mdi-vacuum  " />
                  </q-item-section>
                  <q-item-section
                    >{{ $t('remove-unused-cache') }}
                    {{ unusedCacheFilesSize }}</q-item-section
                  >
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
                  <q-item-section
                    >{{ $t('remove-all-cache') }}
                    {{ allCacheFilesSize }}</q-item-section
                  >
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
      </q-toolbar>
    </q-header>

    <q-footer
      v-if="
        currentSettings?.enableMediaDisplayButton ||
        currentSettings?.enableMusicButton
      "
    >
      <q-toolbar class="bg-blue-9 text-white" style="min-height: initial">
        <DownloadStatus />
        <q-space />
        <MusicButton />
        <SubtitlesButton />
        <ObsStatus />
        <MediaDisplayButton />
      </q-toolbar>
    </q-footer>

    <SongPicker v-model="chooseSong" />
    <q-drawer
      :bordered="miniState"
      :breakpoint="5"
      :class="
        'column justify-between no-wrap ' +
        ($q.dark.isActive ? 'bg-black text-white' : 'bg-grey-2')
      "
      :elevated="!miniState"
      :mini="miniState"
      @mouseout="miniState = true"
      @mouseover="miniState = false"
      mini-to-overlay
      v-model="drawer"
    >
      <q-item
        :disable="!currentSettings || invalidSettings() || mediaPlaying"
        :to="{ path: '/media-calendar', exact: true }"
        @click="
          selectedDate = '';
          datePickerActive = true;
        "
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-icon name="mdi-calendar-month" />
        </q-item-section>

        <q-item-section>{{ $t('titles.mediaCalendar') }}</q-item-section>
      </q-item>

      <q-space />

      <q-item
        :disable="mediaPlaying"
        :to="{ path: '/congregation-selector', exact: true }"
        clickable
        v-ripple
      >
        <!-- @click="currentCongregation = ''" -->
        <q-item-section avatar>
          <q-icon name="mdi-account-group" />
        </q-item-section>

        <q-item-section>
          {{
            (!route.fullPath.includes('wizard') &&
              currentSettings &&
              currentSettings.congregationName) ||
            $t('titles.profileSelection')
          }}
        </q-item-section>
      </q-item>

      <q-item
        :disable="
          !currentSettings || mediaPlaying || route.fullPath.includes('wizard')
        "
        :to="{ path: '/settings', exact: true }"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-icon
            :color="invalidSettings() ? 'negative' : ''"
            name="settings"
          />
        </q-item-section>

        <q-item-section :class="invalidSettings() ? 'text-negative' : ''">
          {{ $t('titles.settings') }}
        </q-item-section>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="cacheClearConfirmPopup">
      <q-card style="width: 80vw; max-width: 80vw">
        <q-card-section>
          <div class="row self-center">
            <q-avatar
              class="q-mr-md self-center"
              color="negative"
              icon="mdi-alert"
              text-color="white"
            />
            <span class="text-h6 self-center">
              {{ $t('are-you-sure') }}
            </span>
            <q-space />
            <div class="text-h6 self-center">
              <q-btn
                @click="cancelDeleteCacheFiles()"
                dense
                flat
                icon="close"
                round
                v-close-popup
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <p>
            {{
              cacheClearType === 'all'
                ? $t('are-you-sure-delete-cache')
                : $t('are-you-sure-delete-unused-cache')
            }}
            {{ $t('files-listed-below') }}
          </p>
        </q-card-section>
        <q-card-section>
          <!-- <q-scroll-area > -->
          <q-table
            :columns="[
              { name: 'path', label: $t('path'), field: 'path' },
              { name: 'size', label: $t('size'), field: 'size' },
            ]"
            :rows="
              cacheFiles.map((file) => ({
                path: file.path,
                size: prettyBytes(file.size),
              }))
            "
            :virtual-scroll-sticky-size-start="48"
            dense
            row-key="path"
            style="height: 200px"
            virtual-scroll
          />
          <!-- </q-scroll-area> -->
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('delete')"
            @click="deleteCacheFiles(cacheClearType)"
            color="negative"
          />
        </q-card-actions>
        <q-inner-loading :showing="deletingCacheFiles" />
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import prettyBytes from 'pretty-bytes';
import { Dark, LocalStorage, date } from 'quasar';
import { get } from 'src/boot/axios';
import { queues } from 'src/boot/globals';
import DownloadStatus from 'src/components/media/DownloadStatus.vue';
import MediaDisplayButton from 'src/components/media/MediaDisplayButton.vue';
import MusicButton from 'src/components/media/MusicButton.vue';
import ObsStatus from 'src/components/media/ObsStatus.vue';
import SongPicker from 'src/components/media/SongPicker.vue';
import SubtitlesButton from 'src/components/media/SubtitlesButton.vue';
import {
  cleanAdditionalMediaFolder,
  cleanLocalStorage,
} from 'src/helpers/cleanup';
import { updateLookupPeriod } from 'src/helpers/date';
import { electronApi } from 'src/helpers/electron-api';
import {
  getAdditionalMediaPath,
  getPublicationDirectory,
  getPublicationsPath,
  getTempDirectory,
} from 'src/helpers/fs';
import {
  downloadAdditionalRemoteVideo,
  downloadBackgroundMusic,
  getBestImageUrl,
} from 'src/helpers/jw-media';
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
import { Ref, computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

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
  online,
  onlyShowInvalidSettings,
  selectedDate,
} = storeToRefs(currentState);

const congregationSettings = useCongregationSettingsStore();
const { congregations } = storeToRefs(congregationSettings);
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
const { fs, klawSync, openFileDialog, pathToFileURL, setAutoStartAtLogin } =
  electronApi;

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

watch(route, (newVal) => {
  try {
    drawer.value = !(
      newVal.fullPath.includes('wizard') &&
      Object.keys(congregations.value).length < 2
    );
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
);

watch(
  () => currentSettings.value?.localAppLang,
  (newAppLang) => {
    if (newAppLang) {
      locale.value = newAppLang;
    }
  },
);

watch(
  () => [
    currentCongregation.value,
    currentSettings.value?.lang,
    currentSettings.value?.langFallback,
    currentSettings.value?.langSubtitles,
    currentSettings.value?.mwDay,
    currentSettings.value?.weDay,
  ],
  ([newCurrentCongregation, , , , ,], [oldCurrentCongregation, , , , ,]) => {
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
const localUploadPopup = ref(false);
const importMediaMenuActive = ref(false);
const datePickerActive = ref(false);
const remoteVideoPopup = ref(false);
const remoteVideosLoadingProgress = ref(0);
const remoteVideos: Ref<MediaItemsMediatorItem[]> = ref([]);
const remoteVideoFilter = ref('');
const remoteVideosIncludeAudioDescription = ref(false);
const remoteVideoLoading = ref(false);
const moreOptionsMenuActive = ref(false);
const cacheFiles: Ref<CacheFile[]> = ref([]);
const calculatingCacheSize = ref(false);
const cacheClearConfirmPopup = ref(false);
const cacheClearType = ref<'' | 'all' | 'smart'>('');
const deletingCacheFiles = ref(false);

const confirmDeleteCacheFiles = (type: 'all' | 'smart') => {
  cacheClearType.value = type;
  cacheClearConfirmPopup.value = true;
};

const cancelDeleteCacheFiles = () => {
  cacheClearType.value = '';
  cacheClearConfirmPopup.value = false;
};

const unusedCacheFilesSize = computed(() => {
  try {
    return prettyBytes(
      cacheFiles.value
        .filter((f) => f.orphaned)
        .reduce((size, cacheFile) => size + cacheFile.size, 0),
    );
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
    const mediaFileUrls = new Set([
      ...lookupPeriodsCollections.map((media) => media.fileUrl),
      ...additionalMediaCollections.map((media) => media.fileUrl),
    ]);
    const backgroundMusicFilesDirectory = pathToFileURL(
      getPublicationDirectory({
        langwritten: currentSongbook.value.signLanguage
          ? currentSettings.value.lang
          : 'E',
        pub: currentSongbook.value.pub,
      }),
    );
    for (const cacheDir of cacheDirs) {
      cacheFiles.value.push(
        ...klawSync(cacheDir, {
          nodir: true,
        }).map((file) => {
          const fileUrl = pathToFileURL(file.path);
          return {
            orphaned:
              !(
                fileUrl.startsWith(backgroundMusicFilesDirectory) &&
                fileUrl.endsWith(currentSongbook.value.fileformat)
              ) && !mediaFileUrls.has(fileUrl),
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
  deletingCacheFiles.value = true;
  let filesToDelete = cacheFiles.value;
  if (type === 'smart') {
    filesToDelete = cacheFiles.value.filter((f) => f.orphaned);
  }
  for (const file of filesToDelete) {
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      console.error(error);
    }
    additionalMediaMaps.value = {};
  }
  deletingCacheFiles.value = true;
  cancelDeleteCacheFiles();
};

if (!migrations.value.includes('firstRun')) {
  const migrationResult = runMigration('firstRun');
  if (migrationResult) {
    createTemporaryNotification({
      caption: t('successfully-migrated-from-the-previous-version'),
      icon: 'mdi-check-circle',
      message: t('welcome-to-mmm'),
      timeout: 10000,
      type: 'positive',
    });
  }
}

cleanLocalStorage();
cleanAdditionalMediaFolder();

const getLocalFiles = async () => {
  openFileDialog()
    .then((result) => {
      if (result.filePaths.length > 0) {
        window.dispatchEvent(
          new CustomEvent('localFiles-browsed', {
            detail: result.filePaths.map((path) => {
              return {
                path,
              };
            }),
          }),
        );
      }
      localUploadPopup.value = false;
    })
    .catch((error) => {
      console.error(error);
    });
};

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
  } finally {
    return 'primary';
  }
};

onMounted(() => {
  document.title = 'Meeting Media Manager';
  if (!currentSettings.value) navigateToCongregationSelector();
});
</script>

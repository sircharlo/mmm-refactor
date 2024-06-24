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
                <q-item @click="chooseSong = true" clickable v-close-popup>
                  <q-item-section avatar>
                    <q-icon color="primary" name="mdi-music-clef-treble" />
                  </q-item-section>
                  <q-item-section>{{ $t('song') }}</q-item-section>
                </q-item>
                <q-item
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
                :events="getEventDates()"
                :navigation-max-year-month="maxDate()"
                :navigation-min-year-month="minDate()"
                :options="dateOptions"
                class="non-selectable"
                event-color="primary"
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
              <q-card-section horizontal>
                <q-card-section>
                  <q-icon
                    color="primary"
                    name="mdi-cursor-default"
                    size="lg"
                    text-color="white"
                /></q-card-section>
                <q-card-section>
                  <div class="text-h6">{{ $t('add-media-files') }}</div>
                  <p>
                    {{
                      $t(
                        'to-add-files-from-your-computer-drag-and-drop-them-directly-into-this-window',
                      )
                    }}
                    {{
                      $t(
                        'you-can-also-use-the-button-below-to-browse-for-files',
                      )
                    }}
                  </p>
                </q-card-section>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  :label="$t('browse')"
                  @click="getLocalFiles()"
                  color="primary"
                  flat
                />
                <q-btn :label="$t('got-it')" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-dialog v-model="remoteVideoPopup">
            <q-card
              class="non-selectable"
              style="width: 80vw; max-width: 80vw; min-width: 3"
            >
              <q-toolbar>
                <q-avatar>
                  <q-icon
                    color="primary"
                    name="mdi-cursor-default"
                    size="lg"
                    text-color="white"
                  />
                </q-avatar>
                <q-toolbar-title>{{ $t('add-media-files') }}</q-toolbar-title>
                <q-btn dense flat icon="close" round v-close-popup />
              </q-toolbar>
              <q-linear-progress
                :value="remoteVideosLoadingProgress"
                class="q-mt-md"
              />
              <div class="row q-px-sm">
                <div class="col-grow">
                  <q-input
                    :label="$t('filter')"
                    dense
                    v-model="remoteVideoFilter"
                  />
                </div>
                <q-toggle
                  :label="$t('include-audio-description')"
                  left-label
                  v-model="remoteVideosIncludeAudioDescription"
                />
              </div>
              <q-separator />
              <q-card-section>
                <div class="row q-col-gutter-lg">
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
                        <q-img :src="getBestImageUrl(video.images, 'md')">
                          <!-- <div class="absolute-bottom">
                            <div class="text-subtitle2">{{ video.title }}</div>
                            <div class="text-caption">
                              {{ video.naturalKey }}
                            </div>
                          </div> -->
                        </q-img>
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
            </q-card>
          </q-dialog>
        </template>
        <template v-else-if="route.fullPath === '/settings'">
          <q-toggle
            :label="$t('only-show-settings-that-are-not-valid')"
            color="red"
            icon="clear"
            left-label
            v-if="invalidSettings()"
            v-model="onlyShowInvalid"
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
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Dark, LocalStorage, date } from 'quasar';
import { get } from 'src/boot/axios';
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
import { getLookupPeriod } from 'src/helpers/date';
import { electronApi } from 'src/helpers/electron-api';
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
  downloadProgress,
  lookupPeriod,
  mediaPlaying,
  onlyShowInvalid,
  selectedDate,
} = storeToRefs(currentState);

const congregationSettings = useCongregationSettingsStore();
congregationSettings.$subscribe((_, state) => {
  LocalStorage.set('congregations', state.congregations);
});

const jwStore = useJwStore();
const { resetSort, updateJwLanguages } = jwStore;
jwStore.$subscribe((_, state) => {
  LocalStorage.set('jwLanguages', state.jwLanguages);
  LocalStorage.set('jwSongs', state.jwSongs);
  LocalStorage.set('yeartexts', state.yeartexts);
  LocalStorage.set('mediaSort', state.mediaSort);
  LocalStorage.set('customDurations', state.customDurations);
  LocalStorage.set('additionalMediaMaps', state.additionalMediaMaps);
});

// Ref and reactive initializations
const chooseSong = ref(false);
const mediaSortForDay = ref(true);
const { openFileDialog, setAutoStartAtLogin } = electronApi;

const { locale, t } = useI18n({ useScope: 'global' });
const drawer = ref(true);
updateJwLanguages();

const route = useRoute();
const router = useRouter();
const miniState = ref(true);

watch(currentCongregation, (newCongregation) => {
  console.log('currentCongregation changed', currentCongregation.value);
  if (!newCongregation) {
    if (route.fullPath !== '/congregation-selector') {
      router.push({ path: '/congregation-selector' });
      return;
    }
  } else {
    downloadProgress.value = {};
    lookupPeriod.value = getLookupPeriod();
    registerAllCustomShortcuts();
    downloadBackgroundMusic();
  }
});

watch(route, (newVal) => {
  drawer.value = !(
    newVal.fullPath.includes('wizard') &&
    Object.keys(congregationSettings.congregations).length < 2
  );
});

const navigateToCongregationSelector = () => {
  if (route.fullPath !== '/congregation-selector') {
    router.push({ path: '/congregation-selector' });
  }
};

watch(currentSettings, (newSettings) => {
  console.log('currentSettings changed', newSettings);
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
    currentSettings.value?.lang,
    currentSettings.value?.langFallback,
    currentSettings.value?.langSubtitles,
    currentSettings.value?.mwDay,
    currentSettings.value?.weDay,
  ],
  () => {
    lookupPeriod.value = getLookupPeriod();
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
  const dateArray: Date[] = lookupPeriod.value.map((day) => day.date);
  // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
  const minDate = date.getMinDate(...dateArray);
  // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
  const maxDate = date.getMaxDate(...dateArray);
  return (
    date.getDateDiff(lookupDate, minDate, 'days') >= 0 &&
    date.getDateDiff(lookupDate, maxDate, 'days') <= 0
  );
};

const minDate = () => {
  const dateArray: Date[] = lookupPeriod.value.map((day) => day.date);
  // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
  const minDate = date.getMinDate(...dateArray);
  return date.formatDate(minDate, 'YYYY/MM');
};

const maxDate = () => {
  const dateArray: Date[] = lookupPeriod.value.map((day) => day.date);
  // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
  const maxDate = date.getMaxDate(...dateArray);
  return date.formatDate(maxDate, 'YYYY/MM');
};

const getEventDates = () => {
  return lookupPeriod.value
    .filter((day) => day.meeting)
    .map((day) => date.formatDate(day.date, 'YYYY/MM/DD'));
};

// Ref for UI states
const localUploadPopup = ref(false);
const importMediaMenuActive = ref(false);
const datePickerActive = ref(false);
const remoteVideoPopup = ref(false);
const remoteVideosLoadingProgress = ref(0);
const remoteVideos: Ref<MediaItemsMediatorItem[]> = ref([]);
// const remoteVideosByCategory: Ref<{
//   [key: string]: MediaItemsMediatorItem[];
// }> = ref({});
const remoteVideoFilter = ref('');
const remoteVideosIncludeAudioDescription = ref(false);

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
  openFileDialog().then((result) => {
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
  });
};

const getJwVideos = async () => {
  try {
    if (remoteVideosLoadingProgress.value < 1) {
      const currentState = useCurrentStateStore();
      const { getSettingValue } = currentState;
      const getSubcategories = async (category: string) => {
        return (await get(
          `https://b.jw-cdn.org/apis/mediator/v1/categories/${
            getSettingValue('lang') as string
          }/${category}?detailed=1&mediaLimit=0&clientType=www`,
        )) as JwVideoCategory;
      };
      const subcategories: {
        key: string;
        parentCategory: string;
      }[] = [{ key: 'LatestVideos', parentCategory: '' }];
      const subcategoriesRequest = await getSubcategories('VideoOnDemand');
      console.log('subcategoriesRequest', subcategoriesRequest);
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
      console.log('subcategories', subcategories);
      let index = 0;
      for (const category of subcategories) {
        const request = (await get(
          `https://b.jw-cdn.org/apis/mediator/v1/categories/${
            getSettingValue('lang') as string
          }/${category.key}?detailed=0&clientType=www`,
        )) as JwVideoCategory;
        // remoteVideosByCategory.value[category.parentCategory ?? category.key] =
        //   request.category.media;
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

onMounted(() => {
  document.title = 'Meeting Media Manager';
  if (!currentSettings.value) navigateToCongregationSelector();
});
</script>

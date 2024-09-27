<template>
  <q-header
    bordered
    class="bg-primary text-white text-bigger text-weight-medium"
  >
    <SongPicker v-model="chooseSong" />
    <DialogAbout v-model="aboutModal" />
    <PublicTalkMediaPicker v-model="publicTalkMediaPopup" />
    <DialogCacheClear
      v-model="cacheClearConfirmPopup"
      v-model:cache-clear-type="cacheClearType"
      :cache-files="cacheFiles"
      :untouchable-directories="untouchableDirectories"
      :unused-parent-directories="unusedParentDirectories"
    />
    <div class="row items-center q-my-sm q-mr-md">
      <div
        class="row justify-center cursor-pointer"
        style="width: 56px"
        @click="aboutModal = true"
      >
        <img src="logo-no-background.svg" />
      </div>
      <q-separator class="bg-semi-white-24 q-ml-none" inset vertical />
      <div class="col q-ml-md flex items-center">
        <div class="col-shrink items-center">
          <q-icon :name="route.meta.icon as string" class="q-mr-md" size="md" />
        </div>
        <div class="col items-center">
          <div class="row text-current-page ellipsis-1-line">
            {{ $t(route.meta.title as string) }}
          </div>
          <div
            v-if="!route.fullPath.includes('congregation-selector')"
            class="row text-congregation ellipsis-1-line"
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
            color="white-transparent"
            icon="mmm-plus"
            unelevated
            @click="createNewCongregation"
          />
        </template>
        <template v-else-if="route.fullPath === '/media-calendar'">
          <q-btn
            :disable="mediaPlaying || !mediaSortForDay"
            color="white-transparent"
            unelevated
            @click="resetSort"
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
          <q-btn v-if="selectedDate" color="white-transparent" unelevated>
            <q-icon
              :class="{ 'q-mr-sm': $q.screen.gt.sm }"
              name="mmm-import-media"
              size="xs"
            />
            {{ $q.screen.gt.sm ? $t('import-media') : '' }}
            <q-tooltip :delay="1000">
              {{ $t('import-media') }}
            </q-tooltip>
            <q-menu ref="importMenu" :offset="[0, 11]" class="top-menu">
              <q-list style="min-width: 100px">
                <q-item-label header>{{ $t('from-jw-org') }}</q-item-label>
                <q-item
                  v-close-popup
                  :disable="!online"
                  clickable
                  @click="chooseSong = true"
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
                  v-close-popup
                  :disable="!online"
                  clickable
                  @click="
                    remoteVideoPopup = true;
                    getJwVideos();
                  "
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
                  v-close-popup
                  clickable
                  @click="publicTalkMediaPopup = true"
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
                  v-for="[icon, name] in [
                    ['mmm-local-media', 'images-videos'],
                    ['mmm-jwpub', 'jwpub-file'],
                    ['mmm-jwlplaylist', 'jw-playlist'],
                  ]"
                  :key="name"
                >
                  <q-item v-close-popup clickable @click="dragging">
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
            <q-popup-proxy v-model="datePickerActive" :offset="[0, 11]">
              <q-date
                v-model="selectedDate"
                :event-color="getEventDayColor"
                :events="getEventDates()"
                :navigation-max-year-month="maxDate()"
                :navigation-min-year-month="minDate()"
                :options="dateOptions"
                landscape
              >
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn
                    v-close-popup
                    :label="$t('close')"
                    color="primary"
                    outline
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
          <DialogRemoteVideo
            v-model="remoteVideoPopup"
            :remote-videos="remoteVideos"
            :remote-videos-loading-progress="remoteVideosLoadingProgress"
          />
        </template>
        <template v-else-if="route.fullPath === '/settings'">
          <q-btn v-if="selectedDate" color="white-transparent" unelevated>
            <q-icon class="q-mr-sm" name="mmm-tools" size="xs" />
            {{ $t('tools') }}
            <q-tooltip v-if="!moreOptionsMenuActive" :delay="1000">
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
                    clickable
                    @click="onlyShowInvalidSettings = !onlyShowInvalidSettings"
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
                  v-close-popup
                  :disable="calculatingCacheSize"
                  clickable
                  @click="confirmDeleteCacheFiles('smart')"
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
                  v-close-popup
                  :disable="calculatingCacheSize"
                  clickable
                  @click="confirmDeleteCacheFiles('all')"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" name="mmm-delete-all" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('remove-all-cache') }} </q-item-label>
                    <q-item-label caption>{{ allCacheFilesSize }}</q-item-label>
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
                color="white-transparent"
                @click="zoomWebsiteWindow('out')"
              >
                <q-icon name="mmm-minus" size="xs" />
                <q-tooltip :delay="1000">{{ $t('zoom-out') }}</q-tooltip>
              </q-btn>
              <q-btn color="white-transparent" @click="zoomWebsiteWindow('in')">
                <q-icon name="mmm-plus" size="xs" />
                <q-tooltip :delay="1000">{{ $t('zoom-in') }}</q-tooltip>
              </q-btn>
            </q-btn-group>
            <q-btn-group unelevated>
              <q-btn
                color="white-transparent"
                @click="navigateWebsiteWindow('back')"
              >
                <q-icon name="mmm-arrow-back" size="xs" />
                <q-tooltip :delay="1000">{{ $t('back') }}</q-tooltip>
              </q-btn>
              <q-btn
                color="white-transparent"
                @click="navigateWebsiteWindow('forward')"
              >
                <q-icon name="mmm-arrow-forward" size="xs" />
                <q-tooltip :delay="1000">{{ $t('forward') }}</q-tooltip>
              </q-btn>
              <q-btn
                color="white-transparent"
                @click="navigateWebsiteWindow('refresh')"
              >
                <q-icon name="mmm-refresh" size="xs" />
                <q-tooltip :delay="1000">{{ $t('refresh') }}</q-tooltip>
              </q-btn>
            </q-btn-group>
            <q-btn
              color="white-transparent"
              unelevated
              @click="
                closeWebsiteWindow();
                mediaPlayingAction = '';
              "
            >
              <q-icon class="q-mr-sm" name="mmm-mirror" size="xs" />
              {{ $t('stop-mirroring') }}
            </q-btn>
          </template>
          <q-btn
            v-else
            :disable="mediaPlaying"
            color="white-transparent"
            unelevated
            @click="
              openWebsiteWindow();
              mediaPlayingAction = 'website';
            "
          >
            <q-icon class="q-mr-sm" name="mmm-mirror" size="xs" />
            {{ $t('start-mirroring') }}
          </q-btn>
        </template>
      </div>
    </div>
  </q-header>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import prettyBytes from 'pretty-bytes';
import { date, QMenu } from 'quasar';
import { get } from 'src/boot/axios';
import DialogAbout from 'src/components/dialog/DialogAbout.vue';
import DialogCacheClear from 'src/components/dialog/DialogCacheClear.vue';
import DialogRemoteVideo from 'src/components/dialog/DialogRemoteVideo.vue';
import PublicTalkMediaPicker from 'src/components/media/PublicTalkMediaPicker.vue';
import SongPicker from 'src/components/media/SongPicker.vue';
import { getDateLocaleFormatted } from 'src/helpers/date';
import { electronApi } from 'src/helpers/electron-api';
import { errorCatcher } from 'src/helpers/error-catcher';
import {
  getAdditionalMediaPath,
  getParentDirectory,
  getPublicationDirectory,
  getPublicationsPath,
  getTempDirectory,
} from 'src/helpers/fs';
import { useCongregationSettingsStore } from 'src/stores/congregation-settings';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { CacheFile } from 'src/types/media';
import {
  JwVideoCategory,
  MediaItemsMediatorItem,
} from 'src/types/publications';
import { computed, onBeforeUnmount, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const {
  closeWebsiteWindow,
  fs,
  klawSync,
  navigateWebsiteWindow,
  openWebsiteWindow,
  pathToFileURL,
  zoomWebsiteWindow,
} = electronApi;

const jwStore = useJwStore();
const { resetSort } = jwStore;
const { additionalMediaMaps, lookupPeriod, mediaSort } = storeToRefs(jwStore);

const congregationSettings = useCongregationSettingsStore();

const currentState = useCurrentStateStore();
const { invalidSettings } = currentState;
const {
  currentCongregation,
  currentSettings,
  currentSongbook,
  mediaPlaying,
  mediaPlayingAction,
  online,
  onlyShowInvalidSettings,
  selectedDate,
} = storeToRefs(currentState);

const publicTalkMediaPopup = ref(false);
const chooseSong = ref(false);
const aboutModal = ref(false);
const datePickerActive = ref(false);
const remoteVideoPopup = ref(false);
const remoteVideosLoadingProgress = ref(0);
const remoteVideos: Ref<MediaItemsMediatorItem[]> = ref([]);
const moreOptionsMenuActive = ref(false);
const calculatingCacheSize = ref(false);

const cacheClearConfirmPopup = ref(false);
const cacheClearType = ref<'' | 'all' | 'smart'>('');
const cacheFiles: Ref<CacheFile[]> = ref([]);

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

const usedCacheFiles = computed(() => {
  try {
    const usedFiles = cacheFiles.value.filter((f) => !f.orphaned);
    return usedFiles;
  } catch (error) {
    errorCatcher(error);
    return [];
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

onMounted(() => {
  window.addEventListener('openSongPicker', openSongPicker);
  window.addEventListener('openImportMenu', openImportMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('openSongPicker', openSongPicker);
  window.removeEventListener('openImportMenu', openImportMenu);
});

const openSongPicker = () => {
  chooseSong.value = true;
};

const dragging = () => {
  window.dispatchEvent(new Event('draggingSomething'));
};

const confirmDeleteCacheFiles = (type: 'all' | 'smart') => {
  cacheClearType.value = type;
  cacheClearConfirmPopup.value = true;
};

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

const importMenu: Ref<QMenu | undefined> = ref();
const openImportMenu = () => {
  importMenu.value?.show();
};

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
</script>

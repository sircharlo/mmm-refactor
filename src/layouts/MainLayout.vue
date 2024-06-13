<template>
  <q-layout class="non-selectable" view="hHh Lpr lFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar class="q-pl-none">
        <q-toolbar-title>
          <q-avatar class="q-px-sm q-mr-md">
            <img src="../assets/master-icon.png" />
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
                <q-item @click="localUpload = true" clickable v-close-popup>
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
                  <q-item @click="localUpload = true" clickable v-close-popup>
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
          <q-dialog @dragenter="localUpload = false" v-model="localUpload">
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
                  <span>{{
                    $t(
                      'to-add-files-from-your-computer-drag-and-drop-them-directly-into-this-window',
                    )
                  }}</span></q-card-section
                >
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  :label="$t('got-it')"
                  color="primary"
                  flat
                  v-close-popup
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </template>
        <template v-else-if="route.fullPath === '/settings'">
          <!-- <q-btn color="negative" v-if="invalidSettings()"> -->
          <q-toggle
            :label="$t('only-show-settings-that-are-not-valid')"
            color="red"
            icon="clear"
            left-label
            v-if="invalidSettings()"
            v-model="onlyShowInvalid"
          >
          </q-toggle>
          <!-- </q-badge> -->
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
        <ObsStatus />
        <q-space />
        <ScenePicker />
        <MusicButton />
        <SubtitlesButton />
        <!-- <q-separator
          inset
          v-if="
            currentSettings?.enableMediaDisplayButton &&
            currentSettings?.enableMusicButton
          "
          vertical
        /> -->
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
        :disable="!currentSettings || invalidSettings()"
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
import DownloadStatus from 'src/components/media/DownloadStatus.vue';
import MusicButton from 'src/components/media/MusicButton.vue';
import ObsStatus from 'src/components/media/ObsStatus.vue';
import ScenePicker from 'src/components/media/ScenePicker.vue';
import SongPicker from 'src/components/media/SongPicker.vue';
import SubtitlesButton from 'src/components/media/SubtitlesButton.vue';
import { getLookupPeriod } from 'src/helpers/date';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import MediaDisplayButton from '../components/media/MediaDisplayButton.vue';
import { electronApi } from '../helpers/electron-api';
import { downloadBackgroundMusic } from '../helpers/jw-media';
import { useCongregationSettingsStore } from '../stores/congregation-settings';
import { useCurrentStateStore } from '../stores/current-state';
import { useJwStore } from '../stores/jw';

// Store and router initializations
const currentState = useCurrentStateStore();
const { invalidSettings } = currentState;
const {
  currentCongregation,
  currentSettings,
  downloadProgress,
  lookupPeriod,
  mediaPlayer,
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
const { toggleMediaWindow } = electronApi;

const { locale } = useI18n({ useScope: 'global' });
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
    downloadBackgroundMusic();
  }
});

watch(route, (newVal) => {
  drawer.value = !(
    newVal.fullPath.includes('wizard') &&
    Object.keys(congregationSettings.congregations).length < 2
  );
});

watch(currentSettings, (newSettings) => {
  console.log('currentSettings changed', newSettings);
  if (!newSettings) {
    if (route.fullPath !== '/congregation-selector') {
      router.push({ path: '/congregation-selector' });
      return;
    }
  }
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
  () => [
    currentSettings.value?.enableMediaDisplayButton,
    currentSettings.value?.jwlCompanionMode,
  ],
  ([newMediaDisplayEnabled, newJwlCompanionMode]) => {
    if (newMediaDisplayEnabled && !newJwlCompanionMode) {
      mediaPlayer.value.windowVisible = newMediaDisplayEnabled;
      toggleMediaWindow(newMediaDisplayEnabled ? 'show' : 'hide');
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
const localUpload = ref(false);
const importMediaMenuActive = ref(false);
const datePickerActive = ref(false);

onMounted(() => {
  document.title = 'Meeting Media Manager';
});
</script>

<template>
  <q-layout view="hHh Lpr lFf" class="non-selectable">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar class="q-pl-none">
        <q-toolbar-title>
          <q-avatar class="q-px-sm q-mr-md">
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          {{ $t(route.meta.title as string) }}
        </q-toolbar-title>
        <template v-if="route.fullPath === '/media-calendar'">
          <q-btn :label="selectedDate" :disable="mediaPlaying" icon="mdi-calendar" color="secondary" class="q-ml-sm"
            rounded>
            <q-tooltip v-if="!datePickerActive">{{ $t('select-a-date') }}</q-tooltip>
            <q-popup-proxy v-model="datePickerActive" breakpoint="1000">
              <q-date landscape v-model="selectedDate" :options="dateOptions" :navigation-min-year-month="minDate()"
                class="non-selectable" :navigation-max-year-month="maxDate()" :events="getEventDates()"
                event-color="primary">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn icon="mdi-check" color="primary" outline v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
          <q-btn v-if="mediaSortForDay" rounded color="warning" class="q-ml-sm" text-color="black"
            icon="mdi-sort-numeric-variant" :disable="mediaPlaying" @click="resetSort">
            <q-tooltip>{{ $t('reset-sort-order') }}</q-tooltip>
          </q-btn>
          <q-btn rounded color="purple-6" text-color="white" icon="mdi-movie-plus" class="q-ml-sm">
            <q-tooltip v-if="!importMediaMenuActive">{{ $t('import-media') }}</q-tooltip>
            <q-menu @before-hide="importMediaMenuActive = false" @before-show="importMediaMenuActive = true">
              <q-list style="min-width: 100px">
                <q-item-label header>{{ $t('from-jw-org') }}</q-item-label>
                <q-item clickable v-close-popup @click="chooseSong = true">
                  <q-item-section avatar>
                    <q-icon color="primary" name="mdi-music-clef-treble" />
                  </q-item-section>
                  <q-item-section>{{ $t('song') }}</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="localUpload = true">
                  <q-item-section avatar>
                    <q-icon color="primary" name="mdi-movie-open-play" />
                  </q-item-section>
                  <q-item-section>{{ $t('video') }}</q-item-section>
                </q-item>
                <q-item-label header>{{ $t('from-local-computer') }}</q-item-label>
                <template v-for="[icon, name] in [
                  ['mdi-image', 'Images or videos'],
                  ['mdi-folder-zip', 'JWPub File'],
                  ['mdi-playlist-play', 'JW Playlist'],
                ]" :key="name">
                  <q-item clickable v-close-popup @click="localUpload = true">
                    <q-item-section avatar>
                      <q-icon color="primary" :name="icon" />
                    </q-item-section>
                    <q-item-section>{{ name }}</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
          <q-dialog v-model="localUpload" @dragenter="localUpload = false">
            <q-card>
              <q-card-section horizontal>
                <q-card-section>
                  <q-icon name="mdi-cursor-default" size="lg" color="primary" text-color="white" /></q-card-section>
                <q-card-section>
                  <span>{{ $t('to-add-files-from-your-computer-drag-and-drop-them-directly-into-this-window') }}</span></q-card-section>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="$t('got-it')" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </template>
      </q-toolbar>
    </q-header>

    <q-footer v-if="currentSettings?.enableMediaDisplayButton || currentSettings?.enableMusicButton">
      <q-toolbar class="bg-blue-9 text-white" style="min-height: initial;">
        <DownloadStatus />
        <q-space />
        <ScenePicker />
        <MusicButton />
        <q-separator vertical inset
          v-if="currentSettings?.enableMediaDisplayButton && currentSettings?.enableMusicButton" />
        <MediaDisplayButton />
      </q-toolbar>
    </q-footer>

    <SongPicker v-model="chooseSong" />
    <q-drawer :class="'column justify-between no-wrap ' + ($q.dark.isActive ? 'bg-black text-white': 'bg-grey-2')" v-model="drawer" :mini="miniState"
      @mouseover="miniState = false" @mouseout="miniState = true" mini-to-overlay :width="200" :breakpoint="5"
      :bordered="miniState" :elevated="!miniState">
      <q-item clickable v-ripple @click="selectedDate = ''; datePickerActive = true"
        :to="{ path: '/media-calendar', exact: true }" :disable="!currentSettings || invalidSettings()">
        <q-item-section avatar>
          <q-icon name="mdi-calendar-month" />
        </q-item-section>

        <q-item-section>{{ $t("titles.mediaCalendar") }}</q-item-section>
      </q-item>

      <q-space />

      <q-item :disable="mediaPlaying" clickable v-ripple :to="{ path: '/congregation-selector', exact: true }">
        <q-item-section avatar>
          <q-icon name="mdi-account-group" />
        </q-item-section>

        <q-item-section>
          {{ (currentSettings && currentSettings.congregationName) ?? $t("titles.profileSelection") }}
        </q-item-section>
      </q-item>

      <q-item :disable="!currentSettings || mediaPlaying || route.fullPath.includes('wizard')
        " clickable v-ripple :to="{ path: '/settings', exact: true }">
        <q-item-section avatar>
          <q-icon :color="invalidSettings() ? 'negative' : ''" name="settings" />
        </q-item-section>

        <q-item-section :class="invalidSettings() ? 'text-negative' : ''">
          {{ $t("titles.settings") }}
        </q-item-section>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useCurrentStateStore } from 'stores/current-state';
const currentState = useCurrentStateStore();
const { invalidSettings } = currentState;
const {
  currentCongregation,
  selectedDate,
  lookupPeriod,
  mediaPlaying,
  mediaPlayer,
  downloadProgress
} = storeToRefs(currentState);

import { useCongregationSettingsStore } from 'stores/congregation-settings';
const congregationSettings = useCongregationSettingsStore();

import { Dark, LocalStorage, date } from 'quasar';

congregationSettings.$subscribe((_, state) => {
  LocalStorage.set('congregations', state.congregations);
});

import { useJwStore } from 'src/stores/jw';
// const { mediaSort } = storeToRefs(useJwStore());
import { downloadBackgroundMusic } from 'src/helpers/jw-media';
import { getLookupPeriod } from 'src/helpers/date';
const jwStore = useJwStore();
const { resetSort } = jwStore;
jwStore.$subscribe((_, state) => {
  LocalStorage.set('jwLanguages', state.jwLanguages);
  LocalStorage.set('jwSongs', state.jwSongs);
  LocalStorage.set('yeartexts', state.yeartexts);
  LocalStorage.set('mediaSort', state.mediaSort);
  LocalStorage.set('customDurations', state.customDurations);
  LocalStorage.set('additionalMediaMaps', state.additionalMediaMaps);
});
const { updateJwLanguages } = jwStore;

const chooseSong = ref(false);

const mediaSortForDay = ref(true);
import { electronApi } from '../helpers/electron-api';
const { toggleMediaWindow } = electronApi;
import { useI18n } from 'vue-i18n';



export default {
  setup() {
    const { locale } = useI18n({ useScope: 'global' })
    const drawer = ref(false);
    updateJwLanguages();
    const { currentSettings } = storeToRefs(currentState);
    const route = useRoute();
    const router = useRouter();

    const miniState = ref(true);
    // const { t } = useI18n()

    // const congregationName = computed(() => {
    //   return currentSettings.value !== undefined
    //     ? currentSettings.value['congregationName']
    //     : ref(t('profileSelection'));
    // });

    const applySettings = () => {
      console.log('applySettings');

      // Media Window
      const enableMediaDisplayButton = currentSettings.value?.enableMediaDisplayButton;
      mediaPlayer.value.windowVisible = !!enableMediaDisplayButton;
      toggleMediaWindow(enableMediaDisplayButton ? 'show' : 'hide');

      // Dark Mode
      Dark.set(currentSettings.value?.darkMode as boolean | 'auto');

      // I18n
      const currentLanguage = currentSettings.value?.localAppLang as string;
      if (currentLanguage) {
        // date.setLocale(currentLanguage);
        locale.value = currentLanguage
      }
    }
    watch(currentCongregation, () => {
      console.log('currentCongregation changed', currentCongregation.value);
      downloadBackgroundMusic();
      downloadProgress.value = {};
    })
    watch(
      () => currentSettings.value,
      (newVal) => {
        applySettings();
        lookupPeriod.value = getLookupPeriod();
        if (!currentCongregation.value && route.fullPath !== '/congregation-selector') {
          router.push({ path: '/congregation-selector' });
          return;
        }
        drawer.value = !(route.fullPath.includes('wizard') && newVal !== undefined);
      },
      { immediate: true, deep: true }
    );
    watch(route, (newVal) => {
      drawer.value = !newVal.fullPath.includes('wizard');
    })

    return {
      miniState,
      chooseSong,
      // congregationName,
      currentSettings,
      drawer,
      // currentPage: computed(() => {
      //   return route.meta.title
      // }),
      mediaPlaying,
      // invalidSettings: computed(() => {
      //   return (
      //     currentState.getInvalidSettings(currentCongregation.value).length > 0
      //   );
      // }),
      invalidSettings,
      selectedDate,
      resetSort,
      dateOptions: (lookupDate: string) => {
        const dateArray: Date[] = lookupPeriod.value.map((day) => day.date);
        // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
        const minDate = date.getMinDate(...dateArray);
        // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
        const maxDate = date.getMaxDate(...dateArray);
        return (
          date.getDateDiff(lookupDate, minDate, 'days') >= 0 &&
          date.getDateDiff(lookupDate, maxDate, 'days') <= 0
        );
      },
      route,
      minDate: () => {
        const dateArray: Date[] = lookupPeriod.value.map((day) => day.date);
        // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
        const minDate = date.getMinDate(...dateArray);
        return date.formatDate(minDate, 'YYYY/MM');
      },
      maxDate: () => {
        const dateArray: Date[] = lookupPeriod.value.map((day) => day.date);
        // @ts-expect-error "A spread argument must either have a tuple type or be passed to a rest parameter."
        const maxDate = date.getMaxDate(...dateArray);
        return date.formatDate(maxDate, 'YYYY/MM');
      },
      getEventDates: () => {
        return lookupPeriod.value
          .filter((day) => day.meeting)
          .map((day) => date.formatDate(day.date, 'YYYY/MM/DD'));
      },
      localUpload: ref(false),
      importMediaMenuActive: ref(false),
      datePickerActive: ref(false),
      mediaSortForDay
    };
  },
};
</script>

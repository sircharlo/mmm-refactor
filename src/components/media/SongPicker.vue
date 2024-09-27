<template>
  <q-dialog v-model="localValue">
    <div
      class="items-center q-pb-lg q-px-lg q-gutter-y-lg bg-secondary-contrast"
    >
      <div class="text-h6 row">{{ $t('choose-a-song') }}</div>
      <div class="row">{{ $t('add-a-song') }}</div>
      <div class="row">
        <q-input
          :label="$t('search')"
          class="col"
          clearable
          debounce="100"
          dense
          outlined
          v-model="filter"
        >
          <template v-slot:prepend>
            <q-icon name="mmm-search" />
          </template>
        </q-input>
      </div>
      <div class="row">
        <q-scroll-area
          :bar-style="barStyle()"
          :thumb-style="thumbStyle()"
          style="height: 40vh; width: -webkit-fill-available"
        >
          <template :key="song.url" v-for="song in filteredSongs">
            <q-item
              :disable="loading"
              @click="addSong(song.track)"
              class="items-center"
              clickable
              v-ripple
            >
              {{ song.title }}
            </q-item>
          </template>
        </q-scroll-area>
      </div>
      <div class="row">
        <div class="col">
          <q-spinner color="primary" size="2em" v-if="loading" />
        </div>
        <div class="col text-right">
          <q-btn @click="dismissPopup" color="negative" flat>{{
            $t('cancel')
          }}</q-btn>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { barStyle, thumbStyle } from 'src/boot/globals';
import { errorCatcher } from 'src/helpers/error-catcher';
import {
  downloadAdditionalRemoteVideo,
  getJwMediaInfo,
  getPubMediaLinks,
} from 'src/helpers/jw-media';
import { useCurrentStateStore } from 'src/stores/current-state';
import { MediaLink, PublicationFetcher } from 'src/types/publications';
import { computed, ComputedRef, ref, watch } from 'vue';

// Define props and emits
const props = defineProps<{
  modelValue: boolean | null;
}>();

const emit = defineEmits(['update:modelValue']);

// Setup logic
const currentState = useCurrentStateStore();
const { currentSettings, currentSongbook, currentSongs } =
  storeToRefs(currentState);

const localValue = ref(props.modelValue);
const loading = ref(false);

const filter = ref('');
const filteredSongs: ComputedRef<MediaLink[]> = computed(() => {
  return filter.value
    ? currentSongs.value.filter((s) =>
        s.title.toLowerCase().includes(filter.value.toLowerCase()),
      )
    : currentSongs.value;
});

const dismissPopup = () => {
  localValue.value = false;
  loading.value = false;
};

const addSong = async (songTrack: number) => {
  try {
    loading.value = true;
    if (songTrack) {
      const songTrackItem = {
        fileformat: 'MP4',
        langwritten: currentSettings.value.lang,
        pub: currentSongbook.value.pub,
        track: songTrack,
      } as PublicationFetcher;
      const [songTrackFiles, { thumbnail, title }] = await Promise.all([
        getPubMediaLinks(songTrackItem),
        getJwMediaInfo(songTrackItem),
      ]);
      downloadAdditionalRemoteVideo(
        songTrackFiles?.files[currentSettings.value.lang]['MP4'],
        thumbnail,
        songTrack,
        title.replace(/^\d+\.\s*/, ''),
      );
    }
  } catch (error) {
    errorCatcher(error);
  } finally {
    dismissPopup();
  }
};

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  },
);
</script>

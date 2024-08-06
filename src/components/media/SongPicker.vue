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
          :bar-style="barStyle"
          :thumb-style="thumbStyle"
          style="height: 40vh; width: -webkit-fill-available"
        >
          <template :key="song.url" v-for="song in filteredSongs">
            <q-item
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
      <div class="row justify-end">
        <q-btn @click="dismissPopup" color="negative" flat>{{
          $t('cancel')
        }}</q-btn>
      </div>
      <q-inner-loading :showing="loading" />
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { barStyle, thumbStyle } from 'src/boot/globals';
import {
  dynamicMediaMapper,
  processMissingMediaInfo,
} from 'src/helpers/jw-media';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { MediaLink } from 'src/types/publications';
import { MultimediaItem } from 'src/types/sqlite';
import { computed, ComputedRef, ref, watch } from 'vue';

// Define props and emits
const props = defineProps<{
  modelValue: boolean | null;
}>();

const emit = defineEmits(['update:modelValue']);

// Setup logic
const currentState = useCurrentStateStore();
const { currentSongbook, currentSongs, selectedDateObject } =
  storeToRefs(currentState);
const jwStore = useJwStore();
const { addToAdditionMediaMap } = jwStore;

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
      const multimediaItem = {
        KeySymbol: currentSongbook.value.pub,
        Track: songTrack,
      } as MultimediaItem;
      await processMissingMediaInfo([multimediaItem]);
      const additionalMedia = await dynamicMediaMapper(
        [multimediaItem],
        selectedDateObject.value?.date,
        true,
      );
      addToAdditionMediaMap(additionalMedia);
    }
  } catch (error) {
    console.error(error);
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
